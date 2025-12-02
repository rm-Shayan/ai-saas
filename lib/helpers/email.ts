'use server';

import nodemailer from 'nodemailer';

const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST;
const SMTP_SERVER_USERNAME = process.env.SMTP_SERVER_USERNAME;
const SMTP_SERVER_PASSWORD = process.env.SMTP_SERVER_PASSWORD;
const SITE_MAIL_RECIEVER = process.env.SITE_MAIL_RECIEVER; // default fallback

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: SMTP_SERVER_HOST,
  port: 587,
  secure: true, // true for 465, false for others
  auth: {
    user: SMTP_SERVER_USERNAME,
    pass: SMTP_SERVER_PASSWORD,
  },
});

/**
 * Send an email using the configured SMTP transporter
 */
export async function sendMail({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;       // sender email (controller will pass)
  to?: string;         // optional recipient, fallback to SITE_MAIL_RECIEVER
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    // Verify transporter before sending
    await transporter.verify();
  } catch (error) {
    console.error('SMTP verification failed:', SMTP_SERVER_USERNAME, SMTP_SERVER_PASSWORD, error);
    throw new Error('SMTP Server verification failed');
  }

  const info = await transporter.sendMail({
    from,
    to: to || SITE_MAIL_RECIEVER,
    subject,
    text,
    html: html || '',
  });

  console.log('Message Sent:', info.messageId);
  console.log('Mail sent to:', to || SITE_MAIL_RECIEVER);

  return info;
}
