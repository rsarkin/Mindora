"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
class VideoService {
    constructor() {
        this.activeRooms = new Map();
    }
    async createRoom(hostId) {
        const roomId = (0, uuid_1.v4)();
        const room = {
            id: roomId,
            participants: [hostId],
            createdAt: new Date(),
            active: true
        };
        this.activeRooms.set(roomId, room);
        logger_1.logger.info(`Video room created: ${roomId} by ${hostId}`);
        return room;
    }
    async joinRoom(roomId, userId) {
        const room = this.activeRooms.get(roomId);
        if (!room || !room.active) {
            return null;
        }
        if (!room.participants.includes(userId)) {
            room.participants.push(userId);
        }
        return room;
    }
    async endRoom(roomId) {
        const room = this.activeRooms.get(roomId);
        if (room) {
            room.active = false;
            this.activeRooms.delete(roomId);
            logger_1.logger.info(`Video room ended: ${roomId}`);
        }
    }
    async getActiveRooms() {
        return Array.from(this.activeRooms.values());
    }
}
exports.VideoService = VideoService;
//# sourceMappingURL=videoService.js.map