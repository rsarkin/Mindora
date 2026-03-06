import { Request, Response } from 'express';
import PodPost from '../models/PodPost';
import PodMembership, { PodRole } from '../models/PodMembership';
import Pod from '../models/Pod';
import logger from '../utils/logger';

// @route   GET /api/pods/:podId/posts
// @desc    Get all posts for a specific pod
export const getPodPosts = async (req: Request, res: Response): Promise<any> => {
    try {
        const { podId } = req.params;
        const userId = (req as any).user?.id;

        const membership = await PodMembership.findOne({ podId, userId, banned: false });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this pod or banned' });
        }

        const posts = await PodPost.find({ podId })
            .populate('authorId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50); // Pagination in real world

        // Hide content of flagged posts for normal members, but show to moderators
        const cleanedPosts = posts.map(post => {
            const p = post.toObject();
            if (p.isFlagged && membership.role !== PodRole.MODERATOR) {
                p.content = '[This post has been hidden pending moderator review]';
            }
            return p;
        });

        res.json(cleanedPosts);
    } catch (error) {
        logger.error('Error fetching pod posts:', error);
        res.status(500).json({ error: 'Server error fetching posts' });
    }
};

// @route   POST /api/pods/:podId/posts
// @desc    Create a new post in a pod
export const createPodPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { podId } = req.params;
        const { content } = req.body;
        const userId = (req as any).user?.id;

        const membership = await PodMembership.findOne({ podId, userId, banned: false });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this pod or banned' });
        }

        const newPost = await PodPost.create({
            podId,
            authorId: userId,
            content
        });

        const populatedPost = await newPost.populate('authorId', 'name avatar');
        res.status(201).json(populatedPost);

    } catch (error) {
        logger.error('Error creating pod post:', error);
        res.status(500).json({ error: 'Server error creating post' });
    }
};

// @route   POST /api/pods/posts/:postId/report
// @desc    Flag a post for moderation
export const reportPost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { postId } = req.params;
        const { reason } = req.body;
        const userId = (req as any).user?.id;

        const post = await PodPost.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Verify the reporter is in the same pod
        const membership = await PodMembership.findOne({ podId: post.podId, userId, banned: false });
        if (!membership) return res.status(403).json({ error: 'Not authorized' });

        post.isFlagged = true;
        post.flaggedReason = reason || 'User report';
        await post.save();

        res.json({ message: 'Post reported to moderators', post });
    } catch (error) {
        logger.error('Error reporting post:', error);
        res.status(500).json({ error: 'Server error reporting post' });
    }
};

// @route   DELETE /api/pods/posts/:postId
// @desc    Moderator deletes a post
export const deletePost = async (req: Request, res: Response): Promise<any> => {
    try {
        const { postId } = req.params;
        const userId = (req as any).user?.id;

        const post = await PodPost.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Verify moderator status
        const membership = await PodMembership.findOne({ podId: post.podId, userId, role: PodRole.MODERATOR });
        if (!membership) return res.status(403).json({ error: 'Only moderators can delete posts' });

        await PodPost.deleteOne({ _id: post._id });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        logger.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error deleting post' });
    }
};

// @route   POST /api/pods/:podId/ban/:targetUserId
// @desc    Moderator bans a user from the pod
export const banUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { podId, targetUserId } = req.params;
        const moderatorId = (req as any).user?.id;

        // Verify moderator status
        const modMembership = await PodMembership.findOne({ podId, userId: moderatorId, role: PodRole.MODERATOR });
        if (!modMembership) return res.status(403).json({ error: 'Only moderators can ban users' });

        // Update target membership
        const targetMembership = await PodMembership.findOneAndUpdate(
            { podId, userId: targetUserId },
            { banned: true },
            { new: true }
        );

        if (!targetMembership) return res.status(404).json({ error: 'Target user not found in this pod' });

        // Decrement pod member count so a new slot opens up
        await Pod.findByIdAndUpdate(podId, { $inc: { currentMemberCount: -1 } });

        res.json({ message: 'User banned from pod', membership: targetMembership });
    } catch (error) {
        logger.error('Error banning user:', error);
        res.status(500).json({ error: 'Server error banning user' });
    }
};

// @route   GET /api/pods/my-pods
// @desc    Get pods the user belongs to
export const getMyPods = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = (req as any).user?.id;
        const memberships = await PodMembership.find({ userId, banned: false }).populate({
            path: 'podId',
            populate: { path: 'communityId', select: 'name category imageUrl' }
        });

        const pods = memberships.map(m => {
            const membershipObj = m.toObject();
            return {
                ...membershipObj.podId,
                role: membershipObj.role // Inject role into the pod object for UI
            };
        });

        res.json(pods);
    } catch (error) {
        logger.error('Error fetching user pods:', error);
        res.status(500).json({ error: 'Server error fetching pods' });
    }
};
