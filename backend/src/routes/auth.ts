import express from 'express';
import {
    register,
    login,
    createAnonymousSession,
    getSessionStatus
} from '../controllers/authController';
import { registerValidator, loginValidator } from '../middleware/validators';

import multer from 'multer';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const router = express.Router();

router.post(
    '/register',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'documents', maxCount: 2 }
    ]),
    registerValidator,
    register
);
router.post('/login', loginValidator, login);

router.post('/anonymous', createAnonymousSession);
router.get('/session-status/:sessionId', getSessionStatus);

export default router;
