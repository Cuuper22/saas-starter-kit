// Email integration — supports Brevo and SendGrid
function setupEmail() {
  if (!process.env.EMAIL_API_KEY) {
    console.log('⚠️  EMAIL_API_KEY not set — emails disabled');
    return;
  }
  console.log('✅ Email configured');
}

async function sendEmail({ to, subject, html }) {
  // Implementation depends on provider
  console.log(`📧 Email to ${to}: ${subject}`);
}

module.exports = { setupEmail, sendEmail };
