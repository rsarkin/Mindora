import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Square, Activity, ArrowLeft, Maximize2, Volume2, VolumeX, Clock, Play } from 'lucide-react';

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
            <div className={`absolute border-2 border-slate-300 opacity-50 ${exercise.shape === 'circle' || exercise.shape === 'wave' ? 'rounded-full' : 'rounded-3xl'} w-64 h-64`} />

            <motion.div
                className={`absolute bg-gradient-to-br ${exercise.color} opacity-80 shadow-xl ${exercise.shape === 'circle' || exercise.shape === 'wave' ? 'rounded-full' : 'rounded-3xl'}`}
                style={{ width: '160px', height: '160px' }}
                animate={{ scale: scale }}
                transition={{
                    duration: currentPhase.action !== 'hold' ? currentPhase.duration : 0,
                    ease: "easeInOut"
                }}
            />

            <div className="z-10 absolute flex flex-col items-center justify-center text-slate-800 drop-shadow-sm w-full h-full pointer-events-none">
                <span className="text-3xl font-heading font-medium tracking-wide">{currentPhase.label}</span>
                <span className="text-lg opacity-70 mt-1 font-medium">
                    {currentPhase.action !== 'hold' ? '...' : 'Pause'}
                </span>
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

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && sessionState === 'active' && timeLeft !== null && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev && prev > 1) return prev - 1;
                    handleEndSession();
                    return 0;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, sessionState, timeLeft]);

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
        <React.Fragment>
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
                className="max-w-7xl mx-auto space-y-8"
            >
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Breathing Space</h1>
                        <p className="text-slate-500 mt-2 text-lg">Select a guided breathing pattern to find your center and relieve stress.</p>
                    </div>
                </motion.div>

                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercises.map((ex) => (
                        <motion.div
                            key={ex.id}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                            onClick={() => {
                                setSelectedExercise(ex.id);
                                setSessionState('setup');
                                setIsActive(true);
                            }}
                        >
                            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${ex.color} opacity-10 rounded-full blur-3xl -mr-24 -mt-24 group-hover:opacity-20 transition-opacity`}></div>

                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ex.color} flex items-center justify-center text-slate-800 mb-8 shadow-sm relative z-10`}>
                                <ex.icon className="w-8 h-8 opacity-75" />
                            </div>

                            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3 relative z-10">{ex.title}</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed relative z-10 flex-1">{ex.description}</p>

                            <div className="mt-auto relative z-10">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pattern</span>
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between">
                                    {ex.instruction}
                                    <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {isActive && activeExercise && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className={`fixed inset-0 z-[100] ${activeExercise.theme} flex flex-col items-center justify-center p-6 overflow-hidden`}
                    >
                        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
                            <button
                                aria-label="Back to Dashboard"
                                onClick={handleExitCompletely}
                                className="text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/60 border border-white/50 backdrop-blur-md px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 font-semibold shadow-sm"
                            >
                                <ArrowLeft className="w-5 h-5" /> Exit
                            </button>

                            {sessionState === 'active' && (
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 flex items-center gap-2 shadow-sm text-slate-700 font-semibold font-mono text-lg">
                                        <Clock className="w-5 h-5 text-slate-500" />
                                        {formatTime(timeLeft)}
                                    </div>
                                    <button
                                        aria-label={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                                        onClick={() => setAudioEnabled(!audioEnabled)}
                                        className="text-slate-600 hover:text-slate-900 bg-white/40 hover:bg-white/60 border border-white/50 backdrop-blur-md p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center"
                                    >
                                        {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center justify-center w-full max-w-4xl z-10 flex-1">
                            {sessionState === 'setup' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/60 backdrop-blur-2xl p-10 rounded-3xl border border-white/50 shadow-2xl w-full max-w-md text-center"
                                >
                                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${activeExercise.color} flex items-center justify-center text-slate-800 mb-6 shadow-md`}>
                                        <activeExercise.icon className="w-10 h-10 opacity-75" />
                                    </div>
                                    <h2 className="text-3xl font-heading font-bold text-slate-800 mb-3">{activeExercise.title}</h2>
                                    <p className="text-slate-600 mb-8 font-medium">{activeExercise.description}</p>

                                    <div className="text-left mb-8">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Select Duration</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: '2 Minutes', value: 120 },
                                                { label: '5 Minutes', value: 300 },
                                                { label: '10 Minutes', value: 600 },
                                                { label: 'Indefinite', value: 'indefinite' }
                                            ].map((option) => (
                                                <button
                                                    key={option.label}
                                                    onClick={() => setDurationSelection(option.value as number | 'indefinite')}
                                                    className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${durationSelection === option.value
                                                        ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-[1.02]'
                                                        : 'bg-white/50 text-slate-600 border-white/60 hover:bg-white hover:border-slate-300'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStartSession}
                                        className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold text-lg hover:bg-slate-900 transition-all shadow-xl flex justify-center items-center gap-2"
                                    >
                                        <Play className="w-5 h-5 fill-current" /> Start Exercise
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-2xl font-bold text-slate-800/80 mb-16 tracking-[0.2em] uppercase font-heading">
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
                                        className="mt-20 text-slate-500 hover:text-slate-800 font-bold tracking-wide px-8 py-3 rounded-full border-2 border-slate-300 hover:bg-white/50 transition-all shadow-sm"
                                    >
                                        I'm Done
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute bottom-10 text-slate-500 font-medium tracking-wide"
                        >
                            {sessionState === 'active' ? 'Close your eyes if you feel comfortable.' : 'Find a quiet place to sit comfortably.'}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    );
};
