const express = require('express');
const router = express.Router();
const transporter = require('../../utils/mailsender');

router.post('/send-email', async (req, res) => {
  const { email, pdfBase64, title, studentName } = req.body;
  
  if (!email || !pdfBase64 || !title || !studentName) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${title} - DLK Software Solutions`,
      text: `Dear ${studentName},\n\nPlease find attached your ${title} from DLK Software Solutions.\n\nBest Regards,\nHuman Resources\nDLK Software Solutions`,
      attachments: [
        {
          filename: `${studentName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.pdf`,
          content: pdfBase64.split("base64,")[1],
          encoding: 'base64'
        }
      ]
    };

    // Do not await the sendMail function. Send it to the background so the frontend gets an instant response.
    transporter.sendMail(mailOptions).catch(error => {
        console.error('Background Email send error:', error);
    });
    
    return res.status(200).json({ message: 'Email queued for sending' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
