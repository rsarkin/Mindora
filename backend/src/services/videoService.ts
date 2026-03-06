import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface VideoRoom {
    id: string;
    participants: string[];
    createdAt: Date;
    active: boolean;
}

export class VideoService {
    private activeRooms: Map<string, VideoRoom> = new Map();

    async createRoom(hostId: string): Promise<VideoRoom> {
        const roomId = uuidv4();
        const room: VideoRoom = {
            id: roomId,
            participants: [hostId],
            createdAt: new Date(),
            active: true
        };

        this.activeRooms.set(roomId, room);
        logger.info(`Video room created: ${roomId} by ${hostId}`);
        return room;
    }

    async joinRoom(roomId: string, userId: string): Promise<VideoRoom | null> {
        const room = this.activeRooms.get(roomId);
        if (!room || !room.active) {
            return null;
        }

        if (!room.participants.includes(userId)) {
            room.participants.push(userId);
        }

        return room;
    }

    async endRoom(roomId: string): Promise<void> {
        const room = this.activeRooms.get(roomId);
        if (room) {
            room.active = false;
            this.activeRooms.delete(roomId);
            logger.info(`Video room ended: ${roomId}`);
        }
    }

    async getActiveRooms(): Promise<VideoRoom[]> {
        return Array.from(this.activeRooms.values());
    }
}
