const Stripe = require('stripe');

let stripe;

function setupStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️  STRIPE_SECRET_KEY not set — payments disabled');
    return;
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe configured');
}

async function createCheckoutSession({ userId, email, priceId }) {
  if (!stripe) throw new Error('Stripe not configured');
  
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: 'subscription',
    line_items: [{ price: priceId || process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/pricing.html`,
    metadata: { userId: String(userId) }
  });
  
  return session;
}

async function handleWebhook(rawBody, signature) {
  if (!stripe) throw new Error('Stripe not configured');
  
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  return event;
}

async function getSubscriptionStatus(customerId) {
  if (!stripe) return { active: false, plan: 'free' };
  
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1
  });
  
  if (!subscriptions.data.length) {
    return { active: false, plan: 'free' };
  }
  
  const sub = subscriptions.data[0];
  return {
    active: sub.status === 'active',
    plan: sub.items.data[0]?.price?.nickname || 'pro',
    currentPeriodEnd: new Date(sub.current_period_end * 1000)
  };
}

async function createCustomerPortalSession(customerId) {
  if (!stripe) throw new Error('Stripe not configured');
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard`
  });
  
  return session;
}

module.exports = { 
  setupStripe, 
  createCheckoutSession, 
  handleWebhook, 
  getSubscriptionStatus,
  createCustomerPortalSession
};
