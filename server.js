const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const { registerChatRoutes } = require("./replit_integrations/chat");
const { registerImageRoutes } = require("./replit_integrations/image");
const { WebhookHandlers } = require("./stripe/webhookHandlers");
const { getUncachableStripeClient, getStripePublishableKey, getStripeSync } = require("./stripe/stripeClient");
const { runMigrations } = require('stripe-replit-sync');

const app = express();
app.use(cors());

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('DATABASE_URL not set — skipping Stripe initialization');
    return;
  }
  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl, schema: 'stripe' });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Setting up managed webhook...');
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const webhookResult = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`
    );
    console.log('Webhook configured:', JSON.stringify(webhookResult).slice(0, 200));

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => console.log('Stripe data synced'))
      .catch((err) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

initStripe();

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer.');
        return res.status(500).json({ error: 'Webhook processing error' });
      }
      await WebhookHandlers.processWebhook(req.body, sig);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(express.json());

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const { admin } = require('./src/firebase_server');
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/stripe/publishable-key', async (req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (error) {
    console.error('Error getting publishable key:', error);
    res.status(500).json({ error: 'Failed to get publishable key' });
  }
});

app.get('/api/stripe/products', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const result = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active as price_active
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.name, pr.unit_amount
    `);
    await pool.end();

    const productsMap = new Map();
    for (const row of result.rows) {
      if (!productsMap.has(row.product_id)) {
        productsMap.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata,
          prices: []
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id).prices.push({
          id: row.price_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }
    res.json({ products: Array.from(productsMap.values()) });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

app.post('/api/stripe/checkout', verifyFirebaseToken, async (req, res) => {
  try {
    const { priceId } = req.body;
    if (!priceId) return res.status(400).json({ error: 'priceId required' });

    const { db } = require('./src/firebase_server');
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const stripe = await getUncachableStripeClient();

    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: { firebaseUid: req.user.uid },
      });
      customerId = customer.id;
      await db.collection('users').doc(req.user.uid).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/subscription?success=true`,
      cancel_url: `${baseUrl}/subscription?canceled=true`,
      metadata: { firebaseUid: req.user.uid },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/api/stripe/subscription', verifyFirebaseToken, async (req, res) => {
  try {
    const { db } = require('./src/firebase_server');
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    if (!userData.stripeCustomerId) {
      return res.json({ subscription: null });
    }

    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const result = await pool.query(
      `SELECT id, status, current_period_start, current_period_end, cancel_at_period_end, items
       FROM stripe.subscriptions 
       WHERE customer = $1 AND status IN ('active', 'trialing', 'past_due')
       ORDER BY current_period_end DESC LIMIT 1`,
      [userData.stripeCustomerId]
    );
    await pool.end();

    const sub = result.rows[0] || null;

    const isActive = sub && (sub.status === 'active' || sub.status === 'trialing');
    await db.collection('users').doc(req.user.uid).set(
      { 
        subscriptionStatus: isActive ? 'active' : 'inactive',
        subscriptionId: sub?.id || null,
      },
      { merge: true }
    );

    res.json({ subscription: sub });
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
});

app.post('/api/stripe/portal', verifyFirebaseToken, async (req, res) => {
  try {
    const { db } = require('./src/firebase_server');
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    if (!userData.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${baseUrl}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

registerChatRoutes(app);
registerImageRoutes(app);

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

app.post("/api/uploads/request-url", async (req, res) => {
  try {
    const { name, contentType } = req.body;
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    const privateDir = process.env.PRIVATE_OBJECT_DIR;
    
    if (!bucketId || !privateDir) {
      return res.status(500).json({ error: "Object storage not configured" });
    }

    const objectId = randomUUID();
    const objectName = `${privateDir}/uploads/${objectId}`;
    
    const request = {
      bucket_name: bucketId,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 900 * 1000).toISOString(),
    };

    const signResponse = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!signResponse.ok) throw new Error("Failed to sign URL");

    const { signed_url } = await signResponse.json();
    res.json({
      uploadURL: signed_url,
      objectPath: `/objects/uploads/${objectId}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/objects/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
    const privateDir = process.env.PRIVATE_OBJECT_DIR;
    const objectName = `${privateDir}/${type}/${id}`;

    const request = {
      bucket_name: bucketId,
      object_name: objectName,
      method: "GET",
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    const signResponse = await fetch(
      `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      }
    );

    if (!signResponse.ok) return res.status(404).send("Not found");

    const { signed_url } = await signResponse.json();
    res.redirect(signed_url);
  } catch (error) {
    res.status(500).send("Error");
  }
});

app.post("/api/admin/raffle-draw", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const { runRaffle } = require('./scripts/raffle_draw');
    const result = await runRaffle();
    res.json({ success: true, winner: result });
  } catch (error) {
    console.error("Raffle draw failed:", error);
    res.status(500).json({ error: "Raffle draw failed" });
  }
});

app.post("/api/logs/client-error", async (req, res) => {
  try {
    const { db } = require('./src/firebase_server');
    const logEntry = {
      ...req.body,
      type: 'error',
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    await db.collection('system_logs').add(logEntry);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Logging failed");
  }
});

app.post("/api/logs/activity", async (req, res) => {
  try {
    const { db } = require('./src/firebase_server');
    const logEntry = {
      ...req.body,
      type: 'activity',
      timestamp: new Date()
    };
    await db.collection('system_logs').add(logEntry);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Logging failed");
  }
});

app.post("/api/admin/system-logs", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  try {
    const { db } = require('./src/firebase_server');
    const snapshot = await db.collection('system_logs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/user-action", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { userId, action, data } = req.body;
  try {
    const { db } = require('./src/firebase_server');
    const userRef = db.collection('users').doc(userId);
    
    let update = { updatedAt: new Date() };
    if (action === 'ban') update.isBanned = data.value;
    if (action === 'mute') update.isMuted = data.value;
    if (action === 'warn') update.lastWarning = data.message;

    await userRef.update(update);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/delete-message", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { messageId, collection } = req.body;
  try {
    const { db } = require('./src/firebase_server');
    await db.collection(collection || 'global_messages').doc(messageId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/live-perk", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { perk } = req.body;
  try {
    const { db } = require('./src/firebase_server');
    await db.collection('system_config').doc('live_mode').set({ 
      activePerk: perk,
      updatedAt: new Date()
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/arena-event", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { event } = req.body;
  try {
    const { db } = require('./src/firebase_server');
    await db.collection('system_config').doc('live_mode').set({ 
      activeEvent: event,
      updatedAt: new Date()
    }, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/broadcast", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const { message } = req.body;
  try {
    const { db } = require('./src/firebase_server');
    await db.collection('global_broadcasts').add({
      message,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3600 * 1000)
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
