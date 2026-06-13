// services/mailService.js
import nodemailer from 'nodemailer';

let transporter;
const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
};

export const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const t = getTransporter();
  return t.sendMail({
    from: `"Be Radiant By Nancy" <${process.env.GMAIL_USER}>`,
    to,
    replyTo,
    subject,
    text,
    html,
  });
};

