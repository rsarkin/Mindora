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
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const Therapist_1 = __importStar(require("../models/Therapist"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Payment_1 = __importDefault(require("../models/Payment"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const User_2 = require("../models/User");
const emailService_1 = require("../utils/emailService");
const router = express_1.default.Router();
// Middleware to Ensure Admin Role
// The authMiddleware should already run before this and set req.user
const isAdmin = async (req, res, next) => {
    try {
        const authReq = req;
        if (!authReq.user || authReq.user.role !== User_2.UserRole.ADMIN) {
            return res.status(403).json({ error: 'Access denied: Requires Admin privileges' });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
router.use(isAdmin);
// 1. Dashboard Analytics - Counts
router.get('/stats', async (req, res) => {
    try {
        const [activePatients, verifiedTherapists, sessionsCount, pendingApprovals, totalRevenueAgg] = await Promise.all([
            User_1.default.countDocuments({ role: User_2.UserRole.PATIENT }),
            Therapist_1.default.countDocuments({ verificationStatus: Therapist_1.TherapistVerificationStatus.VERIFIED }),
            Appointment_1.default.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } }),
            Therapist_1.default.countDocuments({ verificationStatus: Therapist_1.TherapistVerificationStatus.PENDING }),
            Payment_1.default.aggregate([
                { $match: { status: 'COMPLETED' } },
                { $group: { _id: null, total: { $sum: '$amountUSD' } } }
            ])
        ]);
        res.json({
            activePatients,
            verifiedTherapists,
            sessionsCount,
            pendingApprovals,
            totalRevenue: totalRevenueAgg[0]?.total || 0
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
// 2. Dashboard Analytics - Charts
router.get('/charts', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [userGrowth, categoryStats] = await Promise.all([
            // User growth over 30 days
            User_1.default.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            // Category distribution (based on therapist specializations)
            Therapist_1.default.aggregate([
                { $unwind: "$specializations" },
                { $group: { _id: "$specializations", count: { $sum: 1 } } }
            ])
        ]);
        res.json({ userGrowth, categoryStats });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});
// 3. Therapist Management - Queue
router.get('/queue', async (req, res) => {
    try {
        const queue = await Therapist_1.default.find({ verificationStatus: Therapist_1.TherapistVerificationStatus.PENDING }).populate('userId', 'name email createdAt');
        res.json(queue);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification queue' });
    }
});
// 4. Therapist Management - Verify
router.post('/verify/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const therapist = await Therapist_1.default.findById(id).populate('userId');
        if (!therapist)
            return res.status(404).json({ error: 'Therapist not found' });
        therapist.verificationStatus = Therapist_1.TherapistVerificationStatus.VERIFIED;
        therapist.verifiedAt = new Date();
        therapist.verifiedBy = req.user.id.toString();
        await therapist.save();
        // Safe User access
        const user = therapist.userId;
        // Unlock User Login
        await User_1.default.findByIdAndUpdate(user._id, { accountStatus: User_2.AccountStatus.ACTIVE });
        // Setup Audit Log
        await AuditLog_1.default.create({
            adminId: req.user.id,
            action: 'VERIFY_THERAPIST',
            targetId: id,
            targetType: 'Therapist',
            details: `Admin verified therapist ${user.name} (${user.email})`,
            ipAddress: req.ip
        });
        // Trigger Welcome Email 
        try {
            await emailService_1.emailService.sendEmail(user.email, 'Mindora Therapist Profile Verified!', `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Congratulations, ${user.name}!</h2>
                    <p>Your therapist profile on Mindora has been successfully verified by our administrator.</p>
                    <p>You can now log in to your dashboard to manage your appointments, availability, and patients.</p>
                    <br>
                    <p>Welcome to the Mindora Team!</p>
                </div>
                `);
        }
        catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
        }
        res.json({ message: 'Therapist verified successfully', therapist });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify therapist' });
    }
});
// 5. Therapist Management - Reject
router.post('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason)
            return res.status(400).json({ error: 'Rejection reason is required' });
        const therapist = await Therapist_1.default.findById(id).populate('userId');
        if (!therapist)
            return res.status(404).json({ error: 'Therapist not found' });
        therapist.verificationStatus = Therapist_1.TherapistVerificationStatus.REJECTED;
        await therapist.save();
        const user = therapist.userId;
        // Setup Audit Log
        await AuditLog_1.default.create({
            adminId: req.user.id,
            action: 'REJECT_THERAPIST',
            targetId: id,
            targetType: 'Therapist',
            details: `Admin rejected therapist ${user.name} (${user.email}). Reason: ${reason}`,
            ipAddress: req.ip
        });
        // Trigger Rejection Email
        try {
            await emailService_1.emailService.sendEmail(user.email, 'Update on Mindora Therapist Registration', `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Hello ${user.name},</h2>
                    <p>We have reviewed your application to join Mindora as a Therapist, but unfortunately, we cannot approve it at this time.</p>
                    <p><strong>Reason for rejection:</strong></p>
                    <blockquote style="background: #fdf2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0;">
                        ${reason}
                    </blockquote>
                    <p>If you believe this is an error or if you would like to submit corrected documentation, please contact our support team.</p>
                    <br>
                    <p>Best regards,<br>The Mindora Team</p>
                </div>
                `);
        }
        catch (emailErr) {
            console.error('Failed to send rejection email:', emailErr);
        }
        // Delete the user record so they can re-register with corrected info
        // We explicitly delete both to ensure no orphaned records or unique constraint conflicts
        const userId = user._id || user;
        console.log(`[Admin] Rejecting therapist ${id}, deleting user ${userId}`);
        await Therapist_1.default.findByIdAndDelete(id);
        await User_1.default.findByIdAndDelete(userId);
        res.json({ message: 'Therapist rejected and record cleared for re-registration', id, userId });
    }
    catch (error) {
        console.error('Error rejecting therapist:', error);
        res.status(500).json({ error: 'Failed to reject therapist' });
    }
});
// 6. Audit Logs View
router.get('/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog_1.default.find()
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map