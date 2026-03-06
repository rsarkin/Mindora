"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const videoService_1 = require("../services/videoService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const videoService = new videoService_1.VideoService();
// Apply role authorization to all video routes
router.use((0, auth_1.authorizeRoles)('PATIENT', 'THERAPIST'));
// Create a new video room
router.post('/rooms', async (req, res) => {
    try {
        const room = await videoService.createRoom(req.user.id);
        res.json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create video room' });
    }
});
// Join a video room (check validity)
router.get('/rooms/:roomId', async (req, res) => {
    try {
        const room = await videoService.joinRoom(req.params.roomId, req.user.id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found or inactive' });
        }
        res.json(room);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to join video room' });
    }
});
// End a video room
router.delete('/rooms/:roomId', async (req, res) => {
    try {
        await videoService.endRoom(req.params.roomId);
        res.json({ message: 'Room ended successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to end video room' });
    }
});
exports.default = router;
//# sourceMappingURL=video.js.map