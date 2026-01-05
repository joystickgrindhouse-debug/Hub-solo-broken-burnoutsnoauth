const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Minimal object storage implementation for avatar uploads
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

// Add raffle draw endpoint
app.post("/api/admin/raffle-draw", async (req, res) => {
  // Simple admin check (in production use a real auth middleware)
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

// System Logging Endpoints
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

// Admin moderation endpoints
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
