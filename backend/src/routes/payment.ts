import express from 'express';
import { createRazorpayOrder, handlePaymentSuccess, razorpayWebhook } from '../controllers/paymentController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Patient routes
router.post('/razorpay/create-order', authMiddleware, authorizeRoles('PATIENT'), createRazorpayOrder);
router.post('/razorpay/success', authMiddleware, authorizeRoles('PATIENT'), handlePaymentSuccess);

// Webhook (Public, but Razorpay verifies signature)
router.post('/razorpay/webhook', razorpayWebhook);

export default router;
