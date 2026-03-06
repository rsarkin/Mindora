"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // e.g. 'your-email@gmail.com'
                pass: process.env.SMTP_PASS // e.g. App Password
            }
        });
    }
    async sendEmail(to, subject, html, text) {
        try {
            // Log warning if credentials are missing
            if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
                logger_1.default.warn('SMTP credentials are not configured. Email will be logged but not sent.');
                logger_1.default.info(`Simulated Email -> To: ${to} | Subject: ${subject}`);
                return;
            }
            const info = await this.transporter.sendMail({
                from: `"Mindora Health" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback text from HTML
                html
            });
            logger_1.default.info(`Email sent: ${info.messageId}`);
            return info;
        }
        catch (error) {
            logger_1.default.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map