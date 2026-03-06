import express, { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Therapist, { TherapistVerificationStatus } from '../models/Therapist';
import Appointment from '../models/Appointment';
import Payment from '../models/Payment';
import AuditLog from '../models/AuditLog';
import { UserRole, AccountStatus } from '../models/User';
import { emailService } from '../utils/emailService';

const router = express.Router();

// Define AuthRequest to extend Express Request with user type
interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    }
}

// Middleware to Ensure Admin Role
// The authMiddleware should already run before this and set req.user
const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ error: 'Access denied: Requires Admin privileges' });
        }
        next();
    } catch (error) {
        next(error);
    }
};

router.use(isAdmin);

// 1. Dashboard Analytics - Counts
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const [activePatients, verifiedTherapists, sessionsCount, pendingApprovals, totalRevenueAgg] = await Promise.all([
            User.countDocuments({ role: UserRole.PATIENT }),
            Therapist.countDocuments({ verificationStatus: TherapistVerificationStatus.VERIFIED }),
            Appointment.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } }),
            Therapist.countDocuments({ verificationStatus: TherapistVerificationStatus.PENDING }),
            Payment.aggregate([
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// 2. Dashboard Analytics - Charts
router.get('/charts', async (req: Request, res: Response) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [userGrowth, categoryStats] = await Promise.all([
            // User growth over 30 days
            User.aggregate([
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
            Therapist.aggregate([
                { $unwind: "$specializations" },
                { $group: { _id: "$specializations", count: { $sum: 1 } } }
            ])
        ]);

        res.json({ userGrowth, categoryStats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

// 3. Therapist Management - Queue
router.get('/queue', async (req: Request, res: Response) => {
    try {
        const queue = await Therapist.find({ verificationStatus: TherapistVerificationStatus.PENDING }).populate('userId', 'name email createdAt');
        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification queue' });
    }
});

// 4. Therapist Management - Verify
router.post('/verify/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const therapist = await Therapist.findById(id).populate('userId');

        if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

        therapist.verificationStatus = TherapistVerificationStatus.VERIFIED;
        therapist.verifiedAt = new Date();
        therapist.verifiedBy = (req as AuthRequest).user!.id.toString();
        await therapist.save();

        // Safe User access
        const user = therapist.userId as any;

        // Unlock User Login
        await User.findByIdAndUpdate(user._id, { accountStatus: AccountStatus.ACTIVE });

        // Setup Audit Log
        await AuditLog.create({
            adminId: (req as AuthRequest).user!.id,
            action: 'VERIFY_THERAPIST',
            targetId: id,
            targetType: 'Therapist',
            details: `Admin verified therapist ${user.name} (${user.email})`,
            ipAddress: req.ip
        });

        // Trigger Welcome Email 
        try {
            await emailService.sendEmail(
                user.email,
                'Mindora Therapist Profile Verified!',
                `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Congratulations, ${user.name}!</h2>
                    <p>Your therapist profile on Mindora has been successfully verified by our administrator.</p>
                    <p>You can now log in to your dashboard to manage your appointments, availability, and patients.</p>
                    <br>
                    <p>Welcome to the Mindora Team!</p>
                </div>
                `
            );
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
        }

        res.json({ message: 'Therapist verified successfully', therapist });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify therapist' });
    }
});

// 5. Therapist Management - Reject
router.post('/reject/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) return res.status(400).json({ error: 'Rejection reason is required' });

        const therapist = await Therapist.findById(id).populate('userId');
        if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

        therapist.verificationStatus = TherapistVerificationStatus.REJECTED;
        await therapist.save();

        const user = therapist.userId as any;

        // Setup Audit Log
        await AuditLog.create({
            adminId: (req as AuthRequest).user!.id,
            action: 'REJECT_THERAPIST',
            targetId: id,
            targetType: 'Therapist',
            details: `Admin rejected therapist ${user.name} (${user.email}). Reason: ${reason}`,
            ipAddress: req.ip
        });

        // Trigger Rejection Email
        try {
            await emailService.sendEmail(
                user.email,
                'Update on Mindora Therapist Registration',
                `
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
                `
            );
        } catch (emailErr) {
            console.error('Failed to send rejection email:', emailErr);
        }

        // Delete the user record so they can re-register with corrected info
        // We explicitly delete both to ensure no orphaned records or unique constraint conflicts
        const userId = user._id || user;
        console.log(`[Admin] Rejecting therapist ${id}, deleting user ${userId}`);

        await Therapist.findByIdAndDelete(id);
        await User.findByIdAndDelete(userId);

        res.json({ message: 'Therapist rejected and record cleared for re-registration', id, userId });
    } catch (error) {
        console.error('Error rejecting therapist:', error);
        res.status(500).json({ error: 'Failed to reject therapist' });
    }
});

// 6. Audit Logs View
router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
        const logs = await AuditLog.find()
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
