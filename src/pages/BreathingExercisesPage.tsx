import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Square, Activity, ArrowLeft, Volume2, VolumeX, Clock, Play } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

type ExerciseType = 'box' | '478' | 'grounding';

interface Exercise {
    id: ExerciseType;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    theme: string;
    instruction: string;
    phases: { label: string; duration: number; action: 'inhale' | 'exhale' | 'hold' }[];
    shape: 'square' | 'circle' | 'wave';
}

const exercises: Exercise[] = [
    {
        id: 'box',
        title: 'Box Breathing',
        description: 'Navy SEAL technique for intense focus and rapid stress relief.',
        instruction: 'Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)',
        icon: Square,
        color: 'from-blue-200 to-cyan-300',
        theme: 'bg-blue-50',
        phases: [
            { label: 'Inhale Now', duration: 4, action: 'inhale' },
            { label: 'Hold', duration: 4, action: 'hold' },
            { label: 'Exhale Slowly', duration: 4, action: 'exhale' },
            { label: 'Hold', duration: 4, action: 'hold' }
        ],
        shape: 'square'
    },
    {
        id: '478',
        title: '4-7-8 Relaxation',
        description: 'Promotes deep sleep and significant anxiety reduction.',
        instruction: 'Inhale (4s) → Hold (7s) → Exhale (8s)',
        icon: Wind,
        color: 'from-teal-200 to-emerald-300',
        theme: 'bg-teal-50',
        phases: [
            { label: 'Inhale Now', duration: 4, action: 'inhale' },
            { label: 'Hold', duration: 7, action: 'hold' },
            { label: 'Exhale Slowly', duration: 8, action: 'exhale' }
        ],
        shape: 'circle'
    },
    {
        id: 'grounding',
        title: 'Calm Pacing',
        description: 'Designed for general relaxation and physiological resetting.',
        instruction: 'Rhythmic 5-5 continuous breathing pattern.',
        icon: Activity,
        color: 'from-indigo-200 to-purple-300',
        theme: 'bg-indigo-50',
        phases: [
            { label: 'Inhale Now', duration: 5, action: 'inhale' },
            { label: 'Exhale Slowly', duration: 5, action: 'exhale' }
        ],
        shape: 'wave'
    }
];

const playChime = (audioCtx: AudioContext | null) => {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 2.5);
    } catch (e) {
        console.error('Audio playback failed:', e);
    }
};

const BreathingAnimation = ({
    exercise,
    isActive,
    audioEnabled,
    audioCtx
}: {
    exercise: Exercise;
    isActive: boolean;
    audioEnabled: boolean;
    audioCtx: AudioContext | null;
}) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [scale, setScale] = useState(1);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentPhase = exercise.phases[phaseIndex];

    useEffect(() => {
        if (!isActive) return;

        if (currentPhase.action === 'inhale') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setScale(1.5);
        } else if (currentPhase.action === 'exhale') {
            setScale(1);
        }

        if (audioEnabled) {
            playChime(audioCtx);
        }

        const durationMs = currentPhase.duration * 1000;
        timeoutRef.current = setTimeout(() => {
            setPhaseIndex((prev) => (prev + 1) % exercise.phases.length);
        }, durationMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [phaseIndex, isActive, exercise, audioEnabled, audioCtx]);

    useEffect(() => {
        if (!isActive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPhaseIndex(0);
            setScale(1);
        }
    }, [isActive]);

    return (
        <div className="relative flex flex-col items-center justify-center w-80 h-80" aria-live="polite">
            <span className="sr-only">{currentPhase.label}</span>
            {/* Outer Glow Ring */}
            <motion.div 
                className={`absolute inset-0 border-2 border-white/30 rounded-full blur-sm`}
                animate={{ scale: scale * 1.05, opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
            />
            
            <div className={`absolute border-2 border-white/50 bg-white/5 backdrop-blur-sm ${exercise.shape === 'circle' || exercise.shape === 'wave' ? 'rounded-full' : 'rounded-[48px]'} w-64 h-64 shadow-inner`} />

            <motion.div
                className={`absolute bg-gradient-to-br ${exercise.color} shadow-[0_0_80px_rgba(255,255,255,0.4)] ${exercise.shape === 'circle' || exercise.shape === 'wave' ? 'rounded-full' : 'rounded-[40px]'}`}
                style={{ width: '160px', height: '160px' }}
                animate={{ scale: scale, opacity: [0.7, 0.9, 0.7] }}
                transition={{
                    duration: currentPhase.action !== 'hold' ? currentPhase.duration : 0.5,
                    ease: "easeInOut"
                }}
            >
                {/* Internal Pulsing Core */}
                <motion.div 
                    className="absolute inset-4 bg-white/20 rounded-full blur-xl"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            <div className="z-10 absolute flex flex-col items-center justify-center text-slate-800 w-full h-full pointer-events-none">
                <motion.span 
                    key={currentPhase.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black font-heading tracking-tight text-slate-900"
                >
                    {currentPhase.label}
                </motion.span>
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="text-sm font-black uppercase tracking-[0.3em] mt-3 text-slate-500"
                >
                    {currentPhase.action !== 'hold' ? 'Deep' : 'Pause'}
                </motion.span>
            </div>
        </div>
    );
};

export const BreathingExercisesPage: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [durationSelection, setDurationSelection] = useState<number | 'indefinite'>(120);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
    const [sessionState, setSessionState] = useState<'setup' | 'active'>('setup');
    const { showToast } = useToast();
    const { updateUser } = useAuth();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && sessionState === 'active' && timeLeft !== null && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev && prev > 1) return prev - 1;
                    handleCompleteSession();
                    return 0;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, sessionState, timeLeft]);

    const handleCompleteSession = async () => {
        setSessionState('setup');
        try {
            const data = await api.rewardBreathingSession();
            showToast('Well done! You earned 20 Mindora Points! ✨', 'success');
            updateUser({ points: data.points, badges: data.badges });
        } catch (error) {
            console.error('Failed to award breathing points', error);
        }
    };

    const handleStartSession = () => {
        if (!audioCtx) {
            setAudioCtx(new (window.AudioContext || (window as any).webkitAudioContext)());
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const seconds = durationSelection === 'indefinite' ? null : durationSelection;
        setTimeLeft(seconds);
        setSessionState('active');
    };

    const handleEndSession = () => {
        setSessionState('setup');
    };

    const handleExitCompletely = () => {
        setSessionState('setup');
        setIsActive(false);
        setSelectedExercise(null);
    };

    const activeExercise = exercises.find(e => e.id === selectedExercise);

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '∞';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-sky-100/40 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-50/50 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                className="max-w-7xl mx-auto space-y-12 relative z-10"
            >
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-sky-400 rounded-full" />
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Therapeutic Tools</span>
                        </div>
                        <h1 className="text-5xl font-heading font-black text-slate-900 tracking-tight">Breathing Space</h1>
                        <p className="text-slate-500 mt-4 text-xl font-medium max-w-2xl">Find your center with guided rhythmic patterns designed to harmonize your mind and body.</p>
                    </div>
                </motion.div>

                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {exercises.map((ex) => (
                        <motion.div
                            key={ex.id}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-10 border border-white shadow-[0_32px_80px_rgba(0,0,0,0.06)] hover:shadow-[0_48px_100px_rgba(0,0,0,0.1)] transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                            onClick={() => {
                                setSelectedExercise(ex.id);
                                setSessionState('setup');
                                setIsActive(true);
                            }}
                        >
                            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${ex.color} opacity-10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:opacity-20 transition-opacity`}></div>

                            <div className={`w-20 h-20 rounded-[28px] bg-gradient-to-br ${ex.color} flex items-center justify-center text-slate-800 mb-8 shadow-xl shadow-slate-200/50 relative z-10 transform group-hover:rotate-6 transition-transform`}>
                                <ex.icon className="w-10 h-10 opacity-80" />
                            </div>

                            <h3 className="text-3xl font-black font-heading text-slate-900 mb-4 relative z-10 tracking-tight group-hover:text-primary-700 transition-colors">{ex.title}</h3>
                            <p className="text-slate-500 text-sm font-bold leading-relaxed relative z-10 flex-1 opacity-80 group-hover:opacity-100 transition-opacity">{ex.description}</p>

                            <div className="mt-10 relative z-10">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Rhythm Pattern</span>
                                <div className="bg-white/50 border border-white p-4 rounded-2xl text-[11px] font-black text-slate-800 flex items-center justify-between shadow-sm group-hover:border-primary-200 group-hover:bg-primary-50/30 transition-all uppercase tracking-wider">
                                    {ex.instruction}
                                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isActive && activeExercise && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden`}
                    >
                        {/* Immersive Background */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${activeExercise.theme === 'bg-blue-50' ? 'from-blue-50 to-cyan-50' : activeExercise.theme === 'bg-teal-50' ? 'from-teal-50 to-emerald-50' : 'from-indigo-50 to-purple-50'} -z-10`} />
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] -z-10" />

                        <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-20">
                            <button
                                aria-label="Back to Dashboard"
                                onClick={handleExitCompletely}
                                className="text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-white backdrop-blur-md px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-200/50"
                            >
                                <ArrowLeft className="w-4 h-4" /> Exit Space
                            </button>

                            {sessionState === 'active' && (
                                <div className="flex items-center gap-6">
                                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-2xl shadow-slate-900/20 font-black text-sm tracking-widest">
                                        <Clock className="w-4 h-4 text-primary-400" />
                                        {formatTime(timeLeft)}
                                    </div>
                                    <button
                                        aria-label={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                                        onClick={() => setAudioEnabled(!audioEnabled)}
                                        className="text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-white backdrop-blur-md p-4 rounded-2xl transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center"
                                    >
                                        {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center w-full max-w-4xl z-10 flex-1">
                            {sessionState === 'setup' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/70 backdrop-blur-3xl p-12 rounded-[48px] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] w-full max-w-lg text-center relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-sky-400 to-emerald-400" />
                                    
                                    <div className={`w-24 h-24 mx-auto rounded-[32px] bg-gradient-to-br ${activeExercise.color} flex items-center justify-center text-slate-800 mb-8 shadow-xl shadow-slate-200`}>
                                        <activeExercise.icon className="w-12 h-12 opacity-80" />
                                    </div>
                                    <h2 className="text-4xl font-black font-heading text-slate-900 mb-4 tracking-tight">{activeExercise.title}</h2>
                                    <p className="text-slate-500 mb-10 font-bold text-lg leading-relaxed">{activeExercise.description}</p>

                                    <div className="text-left mb-10">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1">Session Duration</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: '2 Minutes', value: 120 },
                                                { label: '5 Minutes', value: 300 },
                                                { label: '10 Minutes', value: 600 },
                                                { label: 'Indefinite', value: 'indefinite' }
                                            ].map((option) => (
                                                <button
                                                    key={option.label}
                                                    onClick={() => setDurationSelection(option.value as number | 'indefinite')}
                                                    className={`py-4 px-4 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${durationSelection === option.value
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 transform scale-[1.05]'
                                                        : 'bg-white/50 text-slate-500 border-white/60 hover:bg-white hover:border-slate-300'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStartSession}
                                        className="w-full py-5 rounded-[24px] bg-gradient-to-r from-slate-900 to-slate-800 text-white font-black text-lg hover:shadow-2xl hover:shadow-slate-300 transition-all shadow-xl flex justify-center items-center gap-3 active:scale-[0.98]"
                                    >
                                        <Play className="w-6 h-6 fill-current" /> Initialize Space
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-sm font-black text-slate-400 mb-20 tracking-[0.5em] uppercase font-heading bg-white/50 backdrop-blur-md px-10 py-4 rounded-full border border-white">
                                        {activeExercise.title}
                                    </h2>
                                    <BreathingAnimation
                                        exercise={activeExercise}
                                        isActive={sessionState === 'active'}
                                        audioEnabled={audioEnabled}
                                        audioCtx={audioCtx}
                                    />

                                    <button
                                        onClick={handleEndSession}
                                        className="mt-20 text-slate-400 hover:text-slate-900 font-black uppercase text-[11px] tracking-[0.3em] px-12 py-4 rounded-2xl border border-slate-200 hover:bg-white hover:border-white hover:shadow-xl transition-all active:scale-95"
                                    >
                                        End Session
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-12 flex flex-col items-center gap-4"
                        >
                            <div className="w-1 h-12 bg-gradient-to-b from-slate-200 to-transparent rounded-full" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                {sessionState === 'active' ? 'Inner Peace is Here.' : 'Ready when you are.'}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
