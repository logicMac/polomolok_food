import dotenv from 'dotenv';
dotenv.config();

export const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY as string,
  senderEmail: process.env.BREVO_EMAIL as string,
  senderName: 'Polomolok Food Ordering'
};

if (!brevoConfig.apiKey || !brevoConfig.senderEmail) {
  throw new Error('Brevo configuration is missing. Check your .env file.');
}
