import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CrisisAlert {
    id: string;
    crisisLevel: number;
    urgency: string;
    keywords: string[];
    message: string; // Alert message to display
    patientInfo: string;
    timestamp: Date;
    userId: string;
}

interface UseTherapistCrisisAlertsReturn {
    crisisAlerts: CrisisAlert[];
    acceptCrisisSession: (alertId: string) => void;
    dismissAlert: (alertId: string) => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const useTherapistCrisisAlerts = (): UseTherapistCrisisAlertsReturn => {
    const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Initialize Socket.IO connection for therapists
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            auth: {
                token: localStorage.getItem('token'), // Therapist JWT token
                role: 'therapist'
            },
        });

        // Listen for crisis alerts broadcast to all therapists
        newSocket.on('therapist:crisis_alert', (data: any) => {
            console.log('Therapist received crisis alert:', data);

            const newAlert: CrisisAlert = {
                id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                crisisLevel: data.crisisLevel,
                urgency: data.urgency,
                keywords: data.keywords || [],
                message: data.message || `Level ${data.crisisLevel}/10 emergency - Immediate assistance required`,
                patientInfo: `Anonymous Patient (Level ${data.crisisLevel}/10 emergency)`,
                timestamp: new Date(),
                userId: data.userId || 'unknown'
            };

            setCrisisAlerts(prev => [newAlert, ...prev]);

            // Play alert sound (optional)
            try {
                const audio = new Audio('/alert-sound.mp3');
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio not available');
            }

            // Browser notification (if permission granted)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🚨 Emergency Session Request', {
                    body: `Crisis Level ${data.crisisLevel}/10 - Patient needs immediate support`,
                    icon: '/crisis-icon.png',
                    tag: newAlert.id
                });
            }
        });

        // Connection status
        newSocket.on('connect', () => {
            console.log('Therapist connected to crisis alert system');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Therapist socket connection error:', error);
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        // Request notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    const acceptCrisisSession = (alertId: string) => {
        // Remove alert from list
        setCrisisAlerts(prev => prev.filter(alert => alert.id !== alertId));

        // Notify backend that this therapist accepted the session
        if (socket) {
            const alert = crisisAlerts.find(a => a.id === alertId);
            if (alert) {
                socket.emit('therapist:accept_crisis', {
                    alertId,
                    userId: alert.userId,
                    therapistId: 'current_therapist_id' // TODO: Get from auth context
                });
            }
        }

        console.log(`Therapist accepted crisis session: ${alertId}`);
    };

    const dismissAlert = (alertId: string) => {
        // Remove alert - another therapist will handle it
        setCrisisAlerts(prev => prev.filter(alert => alert.id !== alertId));
        console.log(`Alert dismissed: ${alertId}`);
    };

    return {
        crisisAlerts,
        acceptCrisisSession,
        dismissAlert
    };
};
