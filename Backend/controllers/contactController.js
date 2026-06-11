// controllers/contactController.js
import { sendMail } from '../services/mailService.js';
import { logError } from '../utils/logger.js';

export const submitContact = async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  try {
    await sendMail({
      to: process.env.CONTACT_TO_EMAIL || 'beradiantnancy@gmail.com',
      subject: 'New Be Radiant By Nancy contact form message',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2 style="margin:0 0 8px;color:#2D2D2D">Be Radiant By Nancy - Contact Form</h2>
          <hr style="border:none;border-top:1px solid #eee;margin:10px 0"/>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    logError('CONTACT_SUBMIT_FAIL', err);
    res.status(500).json({ success: false, error: 'Email failed' });
  }
};
