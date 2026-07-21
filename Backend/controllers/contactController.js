// controllers/contactController.js
import { sendMail } from '../services/mailService.js';
import { logError, logInfo } from '../utils/logger.js';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const submitContact = async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing fields' });
  }

  try {
    const to = process.env.GMAIL_USER || process.env.CONTACT_TO_EMAIL || process.env.ADMIN_ORDER_EMAIL;
    logInfo('CONTACT_EMAIL_RECIPIENT', { to, from: process.env.GMAIL_USER });

    await sendMail({
      to,
      replyTo: email,
      subject: 'New SotraBrand contact form message',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2 style="margin:0 0 8px;color:#2D2D2D">SotraBrand - Contact Form</h2>
          <hr style="border:none;border-top:1px solid #eee;margin:10px 0"/>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    logError('CONTACT_SUBMIT_FAIL', err);
    res.status(500).json({ success: false, error: 'Email failed' });
  }
};
