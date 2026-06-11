// services/mailService.js
import nodemailer from 'nodemailer';

let transporter;
const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  return t.sendMail({
    from: `"Be Radiant By Nancy" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

