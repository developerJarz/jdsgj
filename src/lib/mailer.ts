import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_API_KEY;

  if (!user || !pass) {
    throw new Error('Brevo SMTP credentials not set. Please add BREVO_SMTP_USER and BREVO_API_KEY to environment variables.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Send a 6-digit OTP code to the user's email via Brevo SMTP relay.
 */
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const transporter = getTransporter();
  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_SMTP_USER || 'noreply@shajgoj.bd';
  const fromName = process.env.BREVO_FROM_NAME || 'Shajgoj.bd';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background: linear-gradient(135deg, #eb0064, #ff6b8b); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">Shajgoj.bd</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 12px; margin: 6px 0 0; letter-spacing: 0.3px;">100% Authentic Beauty Products</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 36px 32px 28px;">
            <h2 style="color: #1f1f1f; font-size: 18px; margin: 0 0 8px; font-weight: 700;">Verify Your Email</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 28px; line-height: 1.6;">
              Enter the following verification code to complete your Shajgoj.bd registration. This code is valid for <strong>10 minutes</strong>.
            </p>
            <div style="background: #fdf2f6; border: 2px dashed #eb0064; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
              <span style="font-size: 36px; font-weight: 800; color: #eb0064; letter-spacing: 10px; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
            <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.5;">
              If you did not request this code, please ignore this email. Do not share this code with anyone.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #1a1a1a; padding: 20px 24px; text-align: center;">
            <p style="color: #9ca3af; font-size: 10px; margin: 0;">
              &copy; ${new Date().getFullYear()} Shajgoj.bd Limited &bull; Designed &amp; Developed by
              <a href="https://jarzdigital.com" style="color: #eb0064; text-decoration: none;" target="_blank">JarzDigital.com</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    console.log(`[Mailer] Attempting to send OTP to: ${email} from: ${fromEmail}`);
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `${otp} — Your Shajgoj.bd Verification Code`,
      html: htmlContent,
    });
    console.log(`[Mailer] Brevo SMTP response: ${info.response} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('[Mailer] Brevo SMTP email send error:', error);
    return false;
  }
}
