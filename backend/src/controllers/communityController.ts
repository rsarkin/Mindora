import { Request, Response } from 'express';
import Community from '../models/Community';
import Pod from '../models/Pod';
import PodMembership, { PodRole } from '../models/PodMembership';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// @route   GET /api/communities
// @desc    Get all active communities (discovery view)
export const getCommunities = async (req: Request, res: Response) => {
    try {
        const communities = await Community.find({}).sort({ name: 1 });
        res.json(communities);
    } catch (error) {
        logger.error('Error fetching communities:', error);
        res.status(500).json({ error: 'Failed to fetch communities' });
    }
};

// @route   POST /api/communities/:categoryId/join
// @desc    Join a community category (automatically assigns to a 15-person pod)
export const joinCommunityPod = async (req: Request, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const userId = (req as any).user?.id;
        const { categoryId } = req.params;

        // Verify community exists
        const community = await Community.findById(categoryId).session(session);
        if (!community) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is already in A pod for this community
        const existingMembership = await PodMembership.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'pods',
                    localField: 'podId',
                    foreignField: '_id',
                    as: 'pod'
                }
            },
            { $unwind: '$pod' },
            { $match: { 'pod.communityId': community._id } }
        ]).session(session);

        if (existingMembership.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'You are already in a pod for this community', podId: existingMembership[0].podId });
        }

        // 1. Find an available pod (under 15 users)
        let pod = await Pod.findOneAndUpdate(
            { communityId: community._id, currentMemberCount: { $lt: 15 } },
            { $inc: { currentMemberCount: 1 } },
            { new: true, session, sort: { currentMemberCount: -1 } } // Fill the most full pods first to keep them tight
        );

        let roleToAssign = PodRole.MEMBER;

        // 2. If all pods are full (or none exist), create a new 15-person pod
        if (!pod) {
            // Determine weekly schedule (arbitrary default: Sat at 6 PM for new pods, could be randomized)
            const randomDay = Math.floor(Math.random() * 7);
            
            // Count total pods to make a nice name
            const podCount = await Pod.countDocuments({ communityId: community._id }).session(session);
            
            const newPod = new Pod({
                communityId: community._id,
                name: `${community.category} Pod #${podCount + 1}`,
                currentMemberCount: 1,
                weeklySessionDay: randomDay, 
                weeklySessionTime: '18:00' 
            });
            
            pod = await newPod.save({ session });
            
            // First person in a new pod becomes a Moderator by default (or assign to staff)
            roleToAssign = PodRole.MODERATOR; 
        }

        // 3. Create the Membership
        await PodMembership.create([{
            podId: pod._id,
            userId,
            role: roleToAssign
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Successfully assigned to pod',
            pod
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.error('Error joining pod:', error);
        res.status(500).json({ error: 'Failed to join community pod' });
    }
};
