import { Request, Response } from 'express';
import AppointmentSlot, { SlotStatus } from '../models/AppointmentSlot';
import Appointment, { AppointmentStatus, AppointmentType } from '../models/Appointment';
import Payment, { PaymentStatus, PaymentProvider } from '../models/Payment';
import Therapist from '../models/Therapist';
import crypto from 'crypto';
import { createMeetingEvent } from '../services/googleCalendarService';
import User from '../models/User';
import logger from '../utils/logger';

import Razorpay from 'razorpay';

// Razorpay instance is lazily initialized when needed to avoid ES6 import hoisting issues with dotenv
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_SECRET || ''
    });
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
    try {
        const { slotId } = req.body;
        const patientId = (req as any).user.id;

        logger.info(`Initiating booking - slotId: ${slotId} patientId: ${patientId}`);

        if (!slotId) {
            return res.status(400).json({ message: 'Slot ID is required' });
        }

        const slot = await AppointmentSlot.findById(slotId);
        logger.info(`Found slot: ${JSON.stringify(slot)}`);

        if (!slot || slot.status !== SlotStatus.AVAILABLE) {
            return res.status(400).json({ message: 'Slot not available' });
        }

        logger.info(`Searching for therapist with ID: ${slot.therapistId}`);
        const therapist = await Therapist.findById(slot.therapistId);
        logger.info(`Found therapist: ${JSON.stringify(therapist)}`);

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        const amount = therapist.hourlyRateINR || 2500;
        logger.info(`Booking amount: ${amount}`);

        // Create real Razorpay order
        const options = {
            amount: Math.round(amount * 100), // amount MUST be an integer (in the smallest currency unit)
            currency: "INR",
            receipt: `receipt_${slotId}`
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);

        // Mark slot as pending
        slot.status = SlotStatus.PENDING;
        slot.paymentOrderId = order.id;
        slot.patientId = patientId;
        await slot.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey'
        });
    } catch (error: any) {
        logger.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const razorpayWebhook = async (req: Request, res: Response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    const signature = req.headers['x-razorpay-signature'] as string;

    // Verify webhook signature (Mocked for now)
    const isValid = true; // In real app: verify(req.body, signature, secret)

    if (!isValid) return res.status(400).send('Invalid signature');

    const event = req.body.event; // e.g. 'payment.captured'
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
        const orderId = payload.payment.entity.order_id;

        const slot = await AppointmentSlot.findOne({ paymentOrderId: orderId });
        if (slot) {
            // Find patient/user from Payment record or payload
            // For now, assume we have a way to get patientId. 
            // In a real flow, you'd save the patientId in the order notes.

            slot.status = SlotStatus.BOOKED;
            await slot.save();

            // Create the Appointment record
            // Note: In real app, extract patientId from order notes or previous Payment model search
            const appointment = await Appointment.create({
                patientId: slot.patientId || slot.therapistId, // Fallback to therapistId if patientId missing (unlikely now)
                therapistId: slot.therapistId,
                scheduledAt: slot.startTime,
                durationMinutes: 60,
                status: AppointmentStatus.CONFIRMED,
                type: AppointmentType.VIDEO_CALL,
                slotId: slot._id,
                razorpayOrderId: orderId,
                razorpayPaymentId: payload.payment.entity.id
            });

            // Trigger Google Meet
            const patient = await User.findById(appointment.patientId);
            const therapistWithUser = await Therapist.findById(slot.therapistId).populate('userId');

            if (patient && therapistWithUser) {
                const meetLink = await createMeetingEvent(appointment, therapistWithUser, patient);
                appointment.googleMeetLink = meetLink;
                await appointment.save();
            }

            console.log('Payment Successful. Appointment created:', appointment._id);
        }
    }

    res.json({ status: 'ok' });
};

// Simple success callback for client-side redirection (if not using webhooks for initial confirmation)
export const handlePaymentSuccess = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, slotId } = req.body;
        const patientId = (req as any).user.id;

        // Verify signature
        const secret = process.env.RAZORPAY_SECRET || '';
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
        }

        const slot = await AppointmentSlot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        slot.status = SlotStatus.BOOKED;
        await slot.save();

        const appointment = await Appointment.create({
            patientId,
            therapistId: slot.therapistId,
            scheduledAt: slot.startTime,
            durationMinutes: 60,
            status: AppointmentStatus.CONFIRMED,
            type: AppointmentType.VIDEO_CALL,
            slotId: slot._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });

        // Trigger Google Meet
        const patient = await User.findById(patientId);
        const therapistWithUser = await Therapist.findById(slot.therapistId).populate('userId');

        if (patient && therapistWithUser) {
            const meetLink = await createMeetingEvent(appointment, therapistWithUser, patient);
            appointment.googleMeetLink = meetLink;
            await appointment.save();
        }

        // Trigger further actions (Email)
        res.json({ message: 'Booking confirmed', appointmentId: appointment._id, meetLink: appointment.googleMeetLink });
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
