const { getUncachableStripeClient } = require('./stripeClient');

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  const existing = await stripe.products.search({ query: "name:'Rivalis Pro'" });
  if (existing.data.length > 0) {
    console.log('Rivalis Pro already exists:', existing.data[0].id);
    const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
    prices.data.forEach(p => {
      const interval = p.recurring?.interval || 'one-time';
      console.log(`  Price: ${p.id} — $${p.unit_amount / 100}/${interval}`);
    });
    return;
  }

  console.log('Creating Rivalis Pro subscription product...');
  const product = await stripe.products.create({
    name: 'Rivalis Pro',
    description: 'Ad-free experience + AI Personal Trainer with custom workout plans, meal prep, and goal tracking.',
    metadata: {
      tier: 'pro',
      features: 'ad_free,ai_trainer,meal_plans,workout_builder,goal_tracking',
    }
  });
  console.log('Product created:', product.id);

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'monthly' },
  });
  console.log('Monthly price created:', monthlyPrice.id, '— $9.99/month');

  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 7999,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { plan: 'annual' },
  });
  console.log('Annual price created:', annualPrice.id, '— $79.99/year');

  console.log('Done! Products seeded successfully.');
}

seedProducts().catch(console.error);
