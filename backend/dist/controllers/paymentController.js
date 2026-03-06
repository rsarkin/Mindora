"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentSuccess = exports.razorpayWebhook = exports.createRazorpayOrder = void 0;
const AppointmentSlot_1 = __importStar(require("../models/AppointmentSlot"));
const Appointment_1 = __importStar(require("../models/Appointment"));
const Therapist_1 = __importDefault(require("../models/Therapist"));
const crypto_1 = __importDefault(require("crypto"));
const googleCalendarService_1 = require("../services/googleCalendarService");
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const razorpay_1 = __importDefault(require("razorpay"));
// Initialize Razorpay
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_SECRET || ''
});
const createRazorpayOrder = async (req, res) => {
    try {
        const { slotId } = req.body;
        const patientId = req.user.id;
        logger_1.default.info(`Initiating booking - slotId: ${slotId} patientId: ${patientId}`);
        if (!slotId) {
            return res.status(400).json({ message: 'Slot ID is required' });
        }
        const slot = await AppointmentSlot_1.default.findById(slotId);
        logger_1.default.info(`Found slot: ${JSON.stringify(slot)}`);
        if (!slot || slot.status !== AppointmentSlot_1.SlotStatus.AVAILABLE) {
            return res.status(400).json({ message: 'Slot not available' });
        }
        logger_1.default.info(`Searching for therapist with ID: ${slot.therapistId}`);
        const therapist = await Therapist_1.default.findById(slot.therapistId);
        logger_1.default.info(`Found therapist: ${JSON.stringify(therapist)}`);
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }
        const amount = therapist.hourlyRateINR || 2500;
        logger_1.default.info(`Booking amount: ${amount}`);
        // Create real Razorpay order
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${slotId}`
        };
        const order = await razorpay.orders.create(options);
        // Mark slot as pending
        slot.status = AppointmentSlot_1.SlotStatus.PENDING;
        slot.paymentOrderId = order.id;
        slot.patientId = patientId;
        await slot.save();
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey'
        });
    }
    catch (error) {
        logger_1.default.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
const razorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    // Verify webhook signature (Mocked for now)
    const isValid = true; // In real app: verify(req.body, signature, secret)
    if (!isValid)
        return res.status(400).send('Invalid signature');
    const event = req.body.event; // e.g. 'payment.captured'
    const payload = req.body.payload;
    if (event === 'payment.captured' || event === 'order.paid') {
        const orderId = payload.payment.entity.order_id;
        const slot = await AppointmentSlot_1.default.findOne({ paymentOrderId: orderId });
        if (slot) {
            // Find patient/user from Payment record or payload
            // For now, assume we have a way to get patientId. 
            // In a real flow, you'd save the patientId in the order notes.
            slot.status = AppointmentSlot_1.SlotStatus.BOOKED;
            await slot.save();
            // Create the Appointment record
            // Note: In real app, extract patientId from order notes or previous Payment model search
            const appointment = await Appointment_1.default.create({
                patientId: slot.patientId || slot.therapistId, // Fallback to therapistId if patientId missing (unlikely now)
                therapistId: slot.therapistId,
                scheduledAt: slot.startTime,
                durationMinutes: 60,
                status: Appointment_1.AppointmentStatus.CONFIRMED,
                type: Appointment_1.AppointmentType.VIDEO_CALL,
                slotId: slot._id,
                razorpayOrderId: orderId,
                razorpayPaymentId: payload.payment.entity.id
            });
            // Trigger Google Meet
            const patient = await User_1.default.findById(appointment.patientId);
            const therapistWithUser = await Therapist_1.default.findById(slot.therapistId).populate('userId');
            if (patient && therapistWithUser) {
                const meetLink = await (0, googleCalendarService_1.createMeetingEvent)(appointment, therapistWithUser, patient);
                appointment.googleMeetLink = meetLink;
                await appointment.save();
            }
            console.log('Payment Successful. Appointment created:', appointment._id);
        }
    }
    res.json({ status: 'ok' });
};
exports.razorpayWebhook = razorpayWebhook;
// Simple success callback for client-side redirection (if not using webhooks for initial confirmation)
const handlePaymentSuccess = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, slotId } = req.body;
        const patientId = req.user.id;
        // Verify signature
        const secret = process.env.RAZORPAY_SECRET || '';
        const generated_signature = crypto_1.default
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
        }
        const slot = await AppointmentSlot_1.default.findById(slotId);
        if (!slot)
            return res.status(404).json({ message: 'Slot not found' });
        slot.status = AppointmentSlot_1.SlotStatus.BOOKED;
        await slot.save();
        const appointment = await Appointment_1.default.create({
            patientId,
            therapistId: slot.therapistId,
            scheduledAt: slot.startTime,
            durationMinutes: 60,
            status: Appointment_1.AppointmentStatus.CONFIRMED,
            type: Appointment_1.AppointmentType.VIDEO_CALL,
            slotId: slot._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });
        // Trigger Google Meet
        const patient = await User_1.default.findById(patientId);
        const therapistWithUser = await Therapist_1.default.findById(slot.therapistId).populate('userId');
        if (patient && therapistWithUser) {
            const meetLink = await (0, googleCalendarService_1.createMeetingEvent)(appointment, therapistWithUser, patient);
            appointment.googleMeetLink = meetLink;
            await appointment.save();
        }
        // Trigger further actions (Email)
        res.json({ message: 'Booking confirmed', appointmentId: appointment._id, meetLink: appointment.googleMeetLink });
    }
    catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.handlePaymentSuccess = handlePaymentSuccess;
//# sourceMappingURL=paymentController.js.map