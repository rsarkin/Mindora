import nodemailer from 'nodemailer';
import logger from './logger';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // e.g. 'your-email@gmail.com'
                pass: process.env.SMTP_PASS  // e.g. App Password
            }
        });
    }

    async sendEmail(to: string, subject: string, html: string, text?: string) {
        try {
            // Log warning if credentials are missing
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                logger.warn('SMTP credentials are not configured. Email will be logged but not sent.');
                logger.info(`Simulated Email -> To: ${to} | Subject: ${subject}`);
                return;
            }

            const info = await this.transporter.sendMail({
                from: `"Mindora Health" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback text from HTML
                html
            });

            logger.info(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }
}

export const emailService = new EmailService();
