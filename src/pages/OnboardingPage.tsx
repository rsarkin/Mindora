import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Users, MessageCircle, Sparkles, Loader2 } from 'lucide-react';

type EmotionType = 'anxious' | 'sad' | 'stressed' | 'overwhelmed' | 'hopeful' | 'curious';

interface Emotion {
    id: EmotionType;
    label: string;
    icon: string;
    color: string;
}


export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
    const [userMessage, setUserMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const emotions: Emotion[] = [
        { id: 'anxious', label: 'Anxious', icon: '😰', color: 'secondary' },
        { id: 'sad', label: 'Sad', icon: '😔', color: 'secondary' },
        { id: 'stressed', label: 'Stressed', icon: '😓', color: 'neutral' },
        { id: 'overwhelmed', label: 'Overwhelmed', icon: '😵', color: 'neutral' },
        { id: 'hopeful', label: 'Hopeful', icon: '🌟', color: 'primary' },
        { id: 'curious', label: 'Just Exploring', icon: '🤔', color: 'primary' },
    ];

    const handleEmotionSelect = (emotionId: EmotionType) => {
        setSelectedEmotion(emotionId);
        setTimeout(() => setStep(2), 500);
    };

    const handleStartChat = async () => {
        setIsSubmitting(true);
        setError(null);

        if (!userMessage.trim()) {
            setError('Please share a few words about how you feel.');
            setIsSubmitting(false);
            return;
        }

        navigate('/bot/public', {
            state: {
                initialEmotion: selectedEmotion,
                initialMessage: userMessage,
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white -z-10" />
            <div
                className="absolute inset-0 -z-10 opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />
            <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-sky-200/60 to-blue-100/40 rounded-full blur-3xl -z-10" />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-200/50 to-sky-100/30 rounded-full blur-3xl -z-10" />

            <div className="w-full max-w-3xl px-4 relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center justify-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-gradient-to-br from-white to-sky-50 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-100/50 border border-sky-100 p-2"
                        >
                            <img src="/logo.png" alt="Mindora Logo" className="w-full h-full object-contain" />
                        </motion.div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                        You're Not <span className="text-sky-600">Alone</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-md mx-auto">
                        Take a deep breath. We're here to listen and support your journey.
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-sky-100/50 border border-white/50 p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    {/* Step 1: Emotion Picker */}
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 text-center tracking-tight">
                                    How are you feeling right now?
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {emotions.map((emotion) => (
                                        <motion.button
                                            key={emotion.id}
                                            onClick={() => handleEmotionSelect(emotion.id)}
                                            className={`
                                                relative group flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-300
                                                ${selectedEmotion === emotion.id
                                                    ? 'border-sky-500 bg-sky-50 shadow-xl shadow-sky-100 scale-[1.02]'
                                                    : 'border-slate-100 bg-white hover:border-sky-200 hover:shadow-lg'
                                                }
                                            `}
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="text-5xl group-hover:scale-110 transition-transform duration-300 mb-2">{emotion.icon}</div>
                                            <div className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                                {emotion.label}
                                            </div>
                                            {selectedEmotion === emotion.id && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <p className="text-sm text-slate-400 font-bold text-center mt-10 uppercase tracking-widest">
                                    Your honesty is the first step to healing
                                </p>
                            </motion.div>
                        ) : (
                            /* Step 2: Free-Form Message */
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight">
                                    What brings you <span className="text-sky-600">here</span> today?
                                </h2>

                                <div className="relative group mb-6">
                                    <textarea
                                        value={userMessage}
                                        onChange={(e) => setUserMessage(e.target.value)}
                                        placeholder="You can share as much or as little as you'd like. There's no judgment here..."
                                        className="w-full min-h-[220px] p-6 bg-slate-50 border border-slate-100 rounded-3xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-lg resize-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex items-start gap-4 mb-8 p-6 bg-sky-50 rounded-[24px] border border-sky-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Sparkles className="w-6 h-6 text-sky-600 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-sky-800 font-medium leading-relaxed">
                                        <strong>Private & Safe:</strong> I'm an AI companion here to listen. I'm not a licensed therapist, but I can help you find focus and connect you with resources when you're ready.
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-8 py-5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleStartChat}
                                        disabled={!userMessage.trim() || isSubmitting}
                                        className="flex-1 py-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all disabled:opacity-70 flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Preparing Space...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="w-6 h-6" />
                                                Start Conversation
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer Info */}
                <motion.div
                    className="mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-sky-400" />
                            <span>Confidential Space</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-sky-400" />
                            <span>Community Backed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-sky-400" />
                            <span>Compassionate AI</span>
                        </div>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 mt-10 font-medium tracking-tight">
                        🔒 Safe & Secure. Start anonymously, transition to personalized care whenever you feel ready. 
                        By continuing, you agree to our <Link to="/terms" className="text-sky-500 underline underline-offset-4">Terms</Link>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
