import { brevoConfig } from '../config/brevo';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoConfig.apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: brevoConfig.senderName,
          email: brevoConfig.senderEmail
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .otp-box { background: #fff; border: 2px solid #000; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Polomolok Food Ordering</h1>
        </div>
        <div class="content">
          <h2>Your OTP Code</h2>
          <p>You have requested to log in to your account. Please use the following OTP code:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>This code will expire in 5 minutes.</strong></p>
          <p>If you did not request this code, please ignore this email and ensure your account is secure.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Polomolok Food Ordering System. All rights reserved.</p>
          <p>Service Area: Polomolok Only</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Your OTP Code - Polomolok Food Ordering',
    htmlContent
  });
};
