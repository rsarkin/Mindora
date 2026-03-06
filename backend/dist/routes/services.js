"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Service_1 = __importDefault(require("../models/Service"));
const TestResult_1 = __importDefault(require("../models/TestResult"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all available services
router.get('/', async (req, res) => {
    try {
        const services = await Service_1.default.find({ isActive: true });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Get services by category
router.get('/category/:category', async (req, res) => {
    try {
        const services = await Service_1.default.find({
            category: req.params.category,
            isActive: true
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Submit test result
router.post('/tests/submit', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), async (req, res) => {
    try {
        const { testType, score, details, interpretation } = req.body;
        const testResult = new TestResult_1.default({
            userId: req.user.id,
            testType,
            score,
            details,
            interpretation
        });
        await testResult.save();
        res.status(201).json(testResult);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit test result' });
    }
});
// Get user test history
router.get('/tests/history', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), async (req, res) => {
    try {
        const history = await TestResult_1.default.find({ userId: req.user.id })
            .sort({ completedAt: -1 });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch test history' });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map