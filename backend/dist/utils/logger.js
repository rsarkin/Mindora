"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
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
winston_1.default.addColors(colors);
// Choose the aspect of your log customizing the log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`));
// Define which transports the logger must use
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
    })
];
// Create the logger instance
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false
});
// If we're not in production then log to the console
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
// HIPAA-compliant audit logger
exports.auditLogger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json(), winston_1.default.format.printf((info) => {
        // Ensure sensitive data is masked
        if (info.message && typeof info.message === 'string') {
            info.message = maskSensitiveData(info.message);
        }
        return JSON.stringify(info);
    })),
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'audit.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 50, // Keep 50 files for HIPAA compliance
            tailable: true
        })
    ],
    exitOnError: false
});
// Function to mask sensitive data for HIPAA compliance
function maskSensitiveData(data) {
    // Email masking
    data = data.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, p1, p2) => `${p1.charAt(0)}***@${p2}`);
    // Phone number masking
    data = data.replace(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, '***-***-$4');
    // SSN masking
    data = data.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '***-**-****');
    // Credit card masking
    data = data.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '****-****-****-****');
    return data;
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map