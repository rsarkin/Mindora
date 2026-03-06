"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Patient routes
router.post('/razorpay/create-order', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), paymentController_1.createRazorpayOrder);
router.post('/razorpay/success', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('PATIENT'), paymentController_1.handlePaymentSuccess);
// Webhook (Public, but Razorpay verifies signature)
router.post('/razorpay/webhook', paymentController_1.razorpayWebhook);
exports.default = router;
//# sourceMappingURL=payment.js.map