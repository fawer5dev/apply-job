import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create email transporter
 */
function createTransporter() {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // If no SMTP configured, use ethereal (testing)
  if (!process.env.SMTP_USER) {
    console.warn(
      'No SMTP configuration found. Using console logging for emails.'
    );
    return null;
  }

  return nodemailer.createTransport(emailConfig);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  // If no transporter, log email to console (development mode)
  if (!transporter) {
    console.log('📧 Email would be sent to:', options.to);
    console.log('📧 Subject:', options.subject);
    console.log('📧 Content:', options.html);
    return true;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Apply Job" <noreply@applyjob.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log(`✅ Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Email template for verification
 */
export function getVerificationEmailTemplate(
  name: string,
  verifyUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Apply Job!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name || 'there'}! 👋</h2>
          <p>Thank you for registering with Apply Job. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <a href="${verifyUrl}" class="button">Verify Email Address</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verifyUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with Apply Job, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Apply Job. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for password reset
 */
export function getPasswordResetEmailTemplate(
  name: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${name || 'there'},</h2>
          <p>We received a request to reset the password for your Apply Job account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #DC2626;">${resetUrl}</p>
          
          <div class="warning">
            <p><strong>⚠️ Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>The link can only be used once</li>
              <li>If you didn't request a password reset, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you need help, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Apply Job. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email template for security notification
 */
export function getSecurityNotificationTemplate(
  name: string,
  action: string,
  details: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0891B2; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Security Alert</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We wanted to let you know that ${action} for your Apply Job account.</p>
          
          <p>${details}</p>
          
          <p>If this was you, no action is needed.</p>
          
          <p><strong>If this wasn't you:</strong></p>
          <ul>
            <li>Change your password immediately</li>
            <li>Review your recent account activity</li>
            <li>Contact our support team</li>
          </ul>
        </div>
        <div class="footer">
          <p>&copy; 2026 Apply Job. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send security notification email
 */
export async function sendSecurityNotification(
  to: string,
  action: string,
  details: string,
  name?: string
): Promise<boolean> {
  const html = getSecurityNotificationTemplate(name || 'User', action, details);
  return sendEmail({
    to,
    subject: `Security Alert: ${action}`,
    html,
  });
}
