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
exports.getTherapistAvailableSlots = exports.toggleSlot = exports.deleteSlot = exports.getMySlots = exports.createSlot = void 0;
const AppointmentSlot_1 = __importStar(require("../models/AppointmentSlot"));
const Therapist_1 = __importDefault(require("../models/Therapist"));
// Therapist specific: Open a new slot
const createSlot = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startTime, endTime } = req.body;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }
        const slot = await AppointmentSlot_1.default.create({
            therapistId: therapist._id,
            startTime,
            endTime,
            status: AppointmentSlot_1.SlotStatus.AVAILABLE
        });
        res.status(201).json(slot);
    }
    catch (error) {
        console.error('Error creating slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createSlot = createSlot;
// Therapist specific: Get their own slots
const getMySlots = async (req, res) => {
    try {
        const userId = req.user.id;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }
        const slots = await AppointmentSlot_1.default.find({ therapistId: therapist._id }).sort({ startTime: 1 });
        res.json(slots);
    }
    catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMySlots = getMySlots;
// Therapist specific: Delete or close a slot
const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist profile not found' });
        }
        const slot = await AppointmentSlot_1.default.findOne({ _id: id, therapistId: therapist._id });
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found or unauthorized' });
        }
        if (slot.status === AppointmentSlot_1.SlotStatus.BOOKED) {
            return res.status(400).json({ message: 'Cannot delete a booked slot. Please cancel the appointment.' });
        }
        await AppointmentSlot_1.default.findByIdAndDelete(id);
        res.json({ message: 'Slot removed' });
    }
    catch (error) {
        console.error('Error deleting slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteSlot = deleteSlot;
// Therapist specific: Toggle a slot (create if doesn't exist, delete if exists and available)
const toggleSlot = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startTime, endTime } = req.body;
        const therapist = await Therapist_1.default.findOne({ userId });
        if (!therapist) {
            console.warn(`Therapist profile not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Therapist profile not found. Please complete your profile onboarding.' });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        // Check if a slot already exists for this therapist and time
        const existingSlot = await AppointmentSlot_1.default.findOne({
            therapistId: therapist._id,
            startTime: start,
            endTime: end
        });
        if (existingSlot) {
            if (existingSlot.status === AppointmentSlot_1.SlotStatus.BOOKED) {
                return res.status(400).json({ message: 'Cannot close a booked slot' });
            }
            await AppointmentSlot_1.default.findByIdAndDelete(existingSlot._id);
            return res.json({ message: 'Slot closed', action: 'removed' });
        }
        else {
            const newSlot = await AppointmentSlot_1.default.create({
                therapistId: therapist._id,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: AppointmentSlot_1.SlotStatus.AVAILABLE
            });
            return res.status(201).json({ message: 'Slot opened', action: 'created', slot: newSlot });
        }
    }
    catch (error) {
        console.error('Error toggling slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleSlot = toggleSlot;
// Public/Patient: Get available slots for a specific therapist
const getTherapistAvailableSlots = async (req, res) => {
    try {
        const { therapistId } = req.params;
        const slots = await AppointmentSlot_1.default.find({
            therapistId,
            status: AppointmentSlot_1.SlotStatus.AVAILABLE,
            startTime: { $gt: new Date() } // Only future slots
        }).sort({ startTime: 1 });
        res.json(slots);
    }
    catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getTherapistAvailableSlots = getTherapistAvailableSlots;
//# sourceMappingURL=slotController.js.map