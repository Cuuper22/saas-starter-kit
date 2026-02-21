// Stripe integration — add your keys to .env
function setupStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('⚠️  STRIPE_SECRET_KEY not set — payments disabled');
    return;
  }
  console.log('✅ Stripe configured');
}

module.exports = { setupStripe };
