import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface CrisisDetection {
    crisisLevel: number;
    urgency: string;
    keywords: string[];
    sentiment: string;
    recommendations: string[];
}

interface UseCrisisDetectionReturn {
    crisisLevel: number;
    isCritical: boolean;
    showModal: boolean;
    detectedKeywords: string[];
    dismissModal: () => void;
}

const CRISIS_THRESHOLD = 8; // Show modal for crisis level >= 8
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const useCrisisDetection = (): UseCrisisDetectionReturn => {
    const [crisisLevel, setCrisisLevel] = useState<number>(0);
    const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [_, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Initialize Socket.IO connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            auth: {
                token: localStorage.getItem('anonymousSessionToken') || localStorage.getItem('token'),
            },
        });

        // Listen for crisis detection events from backend
        newSocket.on('crisis:detected', (data: CrisisDetection) => {
            console.log('Crisis detected:', data);
            setCrisisLevel(data.crisisLevel);
            setDetectedKeywords(data.keywords || []);

            // Auto-show modal for critical levels
            if (data.crisisLevel >= CRISIS_THRESHOLD) {
                setShowModal(true);
            }
        });

        // Connection error handling
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    const dismissModal = () => {
        // Only allow dismissal for non-critical levels (< 9)
        if (crisisLevel < 9) {
            setShowModal(false);
        }
    };

    return {
        crisisLevel,
        isCritical: crisisLevel >= CRISIS_THRESHOLD,
        showModal,
        detectedKeywords,
        dismissModal,
    };
};
