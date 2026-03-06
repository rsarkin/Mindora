"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const logger_1 = require("../utils/logger");
const auditLogger = (req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.url}`);
    next();
};
exports.auditLogger = auditLogger;
//# sourceMappingURL=auditLogger.js.map