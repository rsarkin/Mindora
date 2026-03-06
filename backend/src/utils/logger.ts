import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

// Tell winston that we want to link the colors 
winston.addColors(colors);

// Choose the aspect of your log customizing the log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Define which transports the logger must use
const transports = [
    // Console transport
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),
    
    // File transport for errors
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    }),
    
    // File transport for all logs
    new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    })
];

// Create the logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false
});

// If we're not in production then log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// HIPAA-compliant audit logger
export const auditLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info) => {
            // Ensure sensitive data is masked
            if (info.message && typeof info.message === 'string') {
                info.message = maskSensitiveData(info.message);
            }
            return JSON.stringify(info);
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'audit.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 50, // Keep 50 files for HIPAA compliance
            tailable: true
        })
    ],
    exitOnError: false
});

// Function to mask sensitive data for HIPAA compliance
function maskSensitiveData(data: string): string {
    // Email masking
    data = data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
        (match, p1, p2) => `${p1.charAt(0)}***@${p2}`);
    
    // Phone number masking
    data = data.replace(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
        '***-***-$4');
    
    // SSN masking
    data = data.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '***-**-****');
    
    // Credit card masking
    data = data.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '****-****-****-****');
    
    return data;
}

// Export types for TypeScript
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

export default logger;