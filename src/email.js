const nodemailer = require('nodemailer');

let transporter;

function setupEmail() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('⚠️  SMTP credentials not set — emails disabled');
    transporter = null; // Explicitly disable
    return;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  console.log('✅ Email configured');
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`📧 [DISABLED] Email to ${to}: ${subject}`);
    return { disabled: true };
  }
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '') // Strip HTML as fallback
  });
  
  console.log(`✉️  Email sent to ${to}: ${subject} (${info.messageId})`);
  return info;
}

async function sendWelcomeEmail({ to, name }) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#06b6d4">Welcome to SaaS Starter Kit!</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for signing up! You now have access to:</p>
      <ul>
        <li>Dashboard with usage stats</li>
        <li>API key for programmatic access</li>
        <li>Stripe-powered subscription management</li>
      </ul>
      <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;padding:12px 24px;background:#06b6d4;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Go to Dashboard</a></p>
      <p style="color:#666;font-size:13px">If you have questions, reply to this email.</p>
    </div>
  `;
  
  return sendEmail({ to, subject: 'Welcome to SaaS Starter Kit', html });
}

async function sendPasswordResetEmail({ to, token }) {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#06b6d4">Reset Your Password</h1>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#06b6d4;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Reset Password</a></p>
      <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
      <p style="color:#999;font-size:11px">Link: ${resetUrl}</p>
    </div>
  `;
  
  return sendEmail({ to, subject: 'Reset Your Password', html });
}

async function sendInvoiceEmail({ to, invoiceUrl, amount, date }) {
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#06b6d4">Invoice from SaaS Starter Kit</h1>
      <p>Your payment of <strong>$${(amount / 100).toFixed(2)}</strong> was processed successfully on ${date}.</p>
      <p><a href="${invoiceUrl}" style="display:inline-block;padding:12px 24px;background:#06b6d4;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">View Invoice</a></p>
      <p style="color:#666;font-size:13px">Thanks for your business!</p>
    </div>
  `;
  
  return sendEmail({ to, subject: 'Invoice from SaaS Starter Kit', html });
}

module.exports = { 
  setupEmail, 
  sendEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendInvoiceEmail 
};
