import express from 'express';
import { VideoService } from '../services/videoService';
import { authMiddleware, authorizeRoles } from '../middleware/auth';

const router = express.Router();
const videoService = new VideoService();

// Apply role authorization to all video routes
router.use(authorizeRoles('PATIENT', 'THERAPIST'));

// Create a new video room
router.post('/rooms', async (req: any, res) => {
    try {
        const room = await videoService.createRoom(req.user.id);
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create video room' });
    }
});

// Join a video room (check validity)
router.get('/rooms/:roomId', async (req: any, res) => {
    try {
        const room = await videoService.joinRoom(req.params.roomId, req.user.id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found or inactive' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to join video room' });
    }
});

// End a video room
router.delete('/rooms/:roomId', async (req: any, res) => {
    try {
        await videoService.endRoom(req.params.roomId);
        res.json({ message: 'Room ended successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to end video room' });
    }
});

export default router;
