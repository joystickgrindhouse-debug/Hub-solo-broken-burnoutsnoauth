const { getStripeSync, getUncachableStripeClient } = require('./stripeClient');

class WebhookHandlers {
  static async processWebhook(payload, signature) {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    try {
      const stripe = await getUncachableStripeClient();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const subEvents = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ];

      if (subEvents.includes(event.type)) {
        await WebhookHandlers.syncSubscriptionToFirestore(event.data.object);
      }
    } catch (err) {
      console.log('Firestore sync skipped (webhook secret may not be set):', err.message);
    }
  }

  static async syncSubscriptionToFirestore(subscription) {
    try {
      const { db } = require('../src/firebase_server');
      const customerId = subscription.customer;

      const stripe = await getUncachableStripeClient();
      const customer = await stripe.customers.retrieve(customerId);
      const firebaseUid = customer.metadata?.firebaseUid;

      if (!firebaseUid) {
        console.log('No firebaseUid found on customer', customerId);
        return;
      }

      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      await db.collection('users').doc(firebaseUid).set(
        {
          subscriptionStatus: isActive ? 'active' : 'inactive',
          subscriptionId: subscription.id || null,
        },
        { merge: true }
      );
      console.log(`Firestore subscription status updated for ${firebaseUid}: ${isActive ? 'active' : 'inactive'}`);
    } catch (err) {
      console.error('Failed to sync subscription to Firestore:', err.message);
    }
  }
}

module.exports = { WebhookHandlers };
