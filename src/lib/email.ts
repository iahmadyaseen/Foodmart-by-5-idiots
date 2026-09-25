import nodemailer from 'nodemailer';
import { SUPER_ADMIN_EMAIL } from './auth';

interface CustomerInquiryEmailParams {
  name: string;
  email: string;
  message: string;
  createdAt?: string | Date;
}

/**
 * Creates and caches a Nodemailer transport instance.
 * Supports Gmail App Passwords, Custom SMTP, or falls back to logger.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : undefined);
  const port = Number(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Sends customer inquiry email directly to Super Admin ay8880625@gmail.com
 */
export async function sendInquiryToSuperAdmin(params: CustomerInquiryEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  note?: string;
}> {
  const { name, email, message, createdAt = new Date() } = params;
  const dateFormatted = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const transporter = createTransporter();
  const fromAddress =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (process.env.GMAIL_USER ? `Food Mart Support <${process.env.GMAIL_USER}>` : 'Food Mart Support <support@foodmart.com>');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF9F2; margin: 0; padding: 24px; color: #242424; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #F1E4D8; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
          .header { background: #E8483F; color: #ffffff; padding: 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
          .content { padding: 32px 28px; }
          .meta-box { background: #FFFDF9; border: 1px solid #F1E4D8; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .meta-row:last-child { margin-bottom: 0; }
          .meta-label { color: #737373; font-weight: 600; text-transform: uppercase; font-size: 11px; }
          .meta-val { color: #242424; font-weight: 700; }
          .message-title { font-size: 12px; font-weight: 800; color: #737373; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
          .message-box { background: #FFF5F4; border-left: 4px solid #E8483F; border-radius: 8px; padding: 18px; font-size: 15px; line-height: 1.6; color: #1a1a1a; white-space: pre-wrap; font-style: italic; }
          .action-area { margin-top: 32px; text-align: center; }
          .btn-reply { display: inline-block; background: #E8483F; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 10px rgba(232, 72, 63, 0.3); }
          .footer { background: #FAFAFA; border-top: 1px solid #EEEEEE; padding: 20px; text-align: center; font-size: 11px; color: #8C8C8C; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Inbound Customer Inquiry</span>
            <h1>New Message from Food Mart Customer</h1>
            <p>Direct notification delivered to Super Admin (ay8880625@gmail.com)</p>
          </div>
          
          <div class="content">
            <div class="meta-box">
              <div style="margin-bottom: 8px;">
                <span class="meta-label">Customer Name:</span>
                <span class="meta-val" style="margin-left: 8px; font-size: 14px;">${name}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span class="meta-label">Customer Email:</span>
                <span class="meta-val" style="margin-left: 8px; font-family: monospace;">${email}</span>
              </div>
              <div>
                <span class="meta-label">Received At:</span>
                <span class="meta-val" style="margin-left: 8px; font-size: 12px; color: #555;">${dateFormatted}</span>
              </div>
            </div>

            <div class="message-title">Customer Inquiry Details:</div>
            <div class="message-box">
              &ldquo;${message}&rdquo;
            </div>

            <div class="action-area">
              <a href="mailto:${email}?subject=Food%20Mart%20Support:%20Reply%20to%20your%20inquiry" class="btn-reply">
                Reply to ${name} (${email})
              </a>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">Food Mart Online Grocery Store • Super Admin Management Notification</p>
            <p style="margin: 4px 0 0;">This inquiry is also visible in real-time under your Admin Dashboard.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log('\n============================================================');
    console.log(`📧 [FOOD MART INQUIRY DISPATCH TO ${SUPER_ADMIN_EMAIL}]`);
    console.log(`From Customer: ${name} <${email}>`);
    console.log(`Date: ${dateFormatted}`);
    console.log(`Message:\n"${message}"`);
    console.log('NOTE: To deliver real SMTP emails via Gmail to ay8880625@gmail.com, set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) in .env');
    console.log('============================================================\n');

    return {
      success: true,
      note: 'Message logged and queued. Configure SMTP in .env for active Gmail SMTP relay.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: SUPER_ADMIN_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: `🛒 [Food Mart] Customer Inquiry from ${name}`,
      text: `Customer Name: ${name}\nCustomer Email: ${email}\nDate: ${dateFormatted}\n\nMessage:\n${message}\n\nReply directly to ${email}`,
      html: htmlContent,
    });

    console.log(`✅ [FOOD MART EMAIL SENT] Notification delivered to ${SUPER_ADMIN_EMAIL}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`❌ [FOOD MART EMAIL ERROR] Failed to send email to ${SUPER_ADMIN_EMAIL}:`, err?.message || err);
    return {
      success: false,
      note: err?.message || 'SMTP delivery failed',
    };
  }
}

interface PasswordResetEmailParams {
  email: string;
  name?: string;
  code: string;
  magicLink: string;
}

/**
 * Sends a password reset / verification code email to customer or super admin
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  note?: string;
}> {
  const { email, name = 'Customer', code, magicLink } = params;
  const transporter = createTransporter();
  const fromAddress =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (process.env.GMAIL_USER ? `Food Mart Security <${process.env.GMAIL_USER}>` : 'Food Mart Security <security@foodmart.com>');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFF9F2; margin: 0; padding: 24px; color: #242424; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #F1E4D8; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
          .header { background: #242424; color: #ffffff; padding: 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
          .content { padding: 32px 28px; text-align: center; }
          .code-box { display: inline-block; background: #FFF4E8; border: 2px dashed #E8483F; border-radius: 14px; padding: 14px 28px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #E8483F; margin: 20px 0; font-family: monospace; }
          .btn-magic { display: inline-block; background: #E8483F; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; margin-top: 16px; }
          .footer { background: #FAFAFA; border-top: 1px solid #EEEEEE; padding: 16px; text-align: center; font-size: 11px; color: #8C8C8C; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Food Mart Security Verification</h1>
          </div>
          <div class="content">
            <p style="font-size: 15px; margin: 0;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 13px; color: #666; margin-top: 8px;">Use the following 6-digit verification code to reset your password or sign in to your Food Mart account:</p>
            
            <div class="code-box">${code}</div>

            <p style="font-size: 12px; color: #888; margin: 12px 0 0;">This code is valid for 15 minutes.</p>

            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #F1E4D8;">
              <p style="font-size: 12px; color: #666; margin-bottom: 12px;">Or sign in instantly with one click:</p>
              <a href="${magicLink}" class="btn-magic">Instant Sign In With Code</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">If you did not request this verification, your account is safe and you can ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!transporter) {
    console.log('\n============================================================');
    console.log(`🔐 [FOOD MART PASSWORD RESET CODE]`);
    console.log(`To: ${email}`);
    console.log(`Verification Code: ${code}`);
    console.log(`Direct Magic Link: ${magicLink}`);
    console.log('============================================================\n');
    return {
      success: true,
      note: 'Code generated and logged to console for localhost testing.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `🔐 Food Mart Verification Code: ${code}`,
      text: `Your Food Mart verification code is: ${code}\nOr sign in directly: ${magicLink}\nThis code expires in 15 minutes.`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Password reset email error:', err);
    return { success: false, note: err?.message };
  }
}

