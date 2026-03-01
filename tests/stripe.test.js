const { createCheckoutSession, getSubscriptionStatus } = require('../src/stripe');

// Mock Stripe setup
jest.mock('stripe', () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn(async (params) => ({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
          customer_email: params.customer_email,
          metadata: params.metadata
        }))
      }
    },
    subscriptions: {
      list: jest.fn(async ({ customer }) => ({
        data: customer === 'cus_active' ? [{
          status: 'active',
          items: { data: [{ price: { nickname: 'Pro' } }] },
          current_period_end: Math.floor(Date.now() / 1000) + 86400
        }] : []
      }))
    },
    billingPortal: {
      sessions: {
        create: jest.fn(async () => ({
          url: 'https://billing.stripe.com/session/test_123'
        }))
      }
    },
    webhooks: {
      constructEvent: jest.fn((body, sig, secret) => ({
        type: 'checkout.session.completed',
        data: { object: { customer: 'cus_123', metadata: { userId: '1' } } }
      }))
    }
  }));
});

describe('Stripe Integration', () => {
  beforeAll(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    require('../src/stripe').setupStripe();
  });
  
  test('createCheckoutSession - should create session', async () => {
    const session = await createCheckoutSession({
      userId: 1,
      email: 'test@example.com',
      priceId: 'price_123'
    });
    
    expect(session.id).toMatch(/^cs_test_/);
    expect(session.url).toContain('checkout.stripe.com');
  });
  
  test('getSubscriptionStatus - should return active status', async () => {
    const status = await getSubscriptionStatus('cus_active');
    expect(status.active).toBe(true);
    expect(status.plan).toBe('Pro');
  });
  
  test('getSubscriptionStatus - should return free for no subscription', async () => {
    const status = await getSubscriptionStatus('cus_inactive');
    expect(status.active).toBe(false);
    expect(status.plan).toBe('free');
  });
});
