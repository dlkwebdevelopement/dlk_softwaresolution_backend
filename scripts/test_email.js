require('dotenv').config();
const transporter = require('../src/utils/mailsender');

async function testConnectionAndSend() {
  console.log("1. Verifying SMTP credentials...");
  await transporter.verify();
  console.log("✅ SMTP Credentials Verified!");

  console.log("2. Sending test email to " + process.env.EMAIL_USER + "...");
  const info = await transporter.sendMail({
    from: `"DLK Software Solutions" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "DLK System Test - Email Service Operational",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 550px;">
        <h2 style="color: #3DB843; margin-top: 0;">✅ Email Service Active</h2>
        <p style="color: #334155; line-height: 1.6;">
          This email confirms that the Gmail SMTP connection is fully working and authenticated with Google's servers.
        </p>
        <p style="color: #64748b; font-size: 13px;">
          <strong>Sender:</strong> ${process.env.EMAIL_USER}<br/>
          <strong>Timestamp:</strong> ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  });

  console.log("✅ Email sent successfully!");
  console.log("Message ID:", info.messageId);
  console.log("Response:", info.response);
}

testConnectionAndSend()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Email Error:", err);
    process.exit(1);
  });
