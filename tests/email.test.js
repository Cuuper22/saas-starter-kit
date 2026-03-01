const { sendEmail, sendWelcomeEmail } = require('../src/email');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(async (options) => ({
      messageId: '<test@localhost>',
      accepted: [options.to]
    }))
  }))
}));

describe('Email System', () => {
  beforeAll(() => {
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'test123';
    require('../src/email').setupEmail();
  });
  
  test('sendEmail - should send email', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>'
    });
    
    expect(result.messageId).toBeTruthy();
  });
  
  test('sendWelcomeEmail - should send welcome email', async () => {
    const result = await sendWelcomeEmail({
      to: 'test@example.com',
      name: 'Test User'
    });
    
    expect(result.messageId).toBeTruthy();
  });
  
  test('sendEmail - should handle disabled email', async () => {
    // Save original transporter
    const email = require('../src/email');
    const originalSetup = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;
    
    // Force re-setup
    email.setupEmail();
    
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>'
    });
    
    expect(result.disabled).toBe(true);
    
    // Restore
    process.env.SMTP_HOST = originalSetup;
  });
});
