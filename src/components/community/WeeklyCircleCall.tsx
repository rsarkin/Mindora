import React, { useState, useEffect } from 'react';
import { Video, Clock } from 'lucide-react';

interface WeeklyCircleProps {
    pod: any;
    onJoin: () => void;
}

export const WeeklyCircleCall: React.FC<WeeklyCircleProps> = ({ pod, onJoin }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, isActive: boolean }>({
        days: 0, hours: 0, minutes: 0, isActive: false
    });

    useEffect(() => {
        const calculateNextSession = () => {
            const now = new Date();
            const [sessionHour, sessionMin] = pod.weeklySessionTime.split(':').map(Number);
            const sessionDay = pod.weeklySessionDay; // 0 (Sun) to 6 (Sat)
            
            let nextSession = new Date();
            nextSession.setHours(sessionHour, sessionMin, 0, 0);
            
            // Adjust day to the target day
            const currentDay = now.getDay();
            let daysUntil = (sessionDay - currentDay + 7) % 7;
            
            // If it's today but the time has passed, next session is next week
            if (daysUntil === 0 && now.getTime() > nextSession.getTime() + (60 * 60 * 1000) /* 1 hr duration */) {
                daysUntil = 7;
            }
            
            nextSession.setDate(now.getDate() + daysUntil);
            
            const diffMs = nextSession.getTime() - now.getTime();
            
            // Active threshold: 15 mins before to 60 mins after start time
            const diffMinutes = diffMs / (1000 * 60);
            const isActive = diffMinutes <= 15 && diffMinutes >= -60;

            if (isActive) {
                 setTimeLeft({ days: 0, hours: 0, minutes: 0, isActive: true });
                 return;
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft({ days, hours, minutes, isActive: false });
        };

        calculateNextSession();
        const interval = setInterval(calculateNextSession, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [pod]);

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-black font-heading tracking-tight mb-2 flex items-center gap-2">
                        <Video className="w-6 h-6 text-indigo-300" />
                        Weekly Circle
                    </h3>
                    <p className="text-indigo-200">
                        A safe, moderated video space for the 15 members of your pod.
                    </p>
                </div>

                <div className="bg-black/20 backdrop-blur-md rounded-xl p-4 flex items-center gap-6 border border-white/10 w-full md:w-auto">
                    {timeLeft.isActive ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                                <span className="font-bold text-white tracking-wide">SESSION LIVE NOW</span>
                            </div>
                            <button 
                                onClick={onJoin}
                                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 whitespace-nowrap"
                            >
                                Join Video
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col w-full md:w-auto">
                            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Next Session In:
                            </span>
                            <div className="flex items-center gap-2 font-mono text-xl font-bold">
                                <div className="bg-black/30 px-3 py-1 rounded-md">{String(timeLeft.days).padStart(2, '0')}d</div>
                                <span>:</span>
                                <div className="bg-black/30 px-3 py-1 rounded-md">{String(timeLeft.hours).padStart(2, '0')}h</div>
                                <span>:</span>
                                <div className="bg-black/30 px-3 py-1 rounded-md">{String(timeLeft.minutes).padStart(2, '0')}m</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
