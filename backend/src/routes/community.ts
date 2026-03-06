import express from 'express';
import { joinCommunityPod, getCommunities } from '../controllers/communityController';
import { 
    getPodPosts, 
    createPodPost, 
    reportPost, 
    deletePost, 
    banUser, 
    getMyPods 
} from '../controllers/podController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ----- Communities -----
router.get('/communities', authMiddleware, getCommunities);
router.post('/communities/:categoryId/join', authMiddleware, joinCommunityPod);

// ----- Pods / Feeds -----
router.get('/pods/my-pods', authMiddleware, getMyPods);
router.get('/pods/:podId/posts', authMiddleware, getPodPosts);
router.post('/pods/:podId/posts', authMiddleware, createPodPost);

// ----- Moderation -----
router.post('/pods/posts/:postId/report', authMiddleware, reportPost);
router.delete('/pods/posts/:postId', authMiddleware, deletePost);
router.post('/pods/:podId/ban/:targetUserId', authMiddleware, banUser);

export default router;
