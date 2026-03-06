import express from 'express';
import { initiateGoogleOAuth, googleOAuthCallback } from '../controllers/googleAuthController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.get('/google', authMiddleware, authorizeRoles('THERAPIST'), initiateGoogleOAuth);
router.get('/google/callback', googleOAuthCallback);

export default router;
