import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Brain, Users, MessageCircle, Sparkles } from 'lucide-react';

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
        // Auto-advance to step 2 after 500ms
        setTimeout(() => setStep(2), 500);
    };

    const handleStartChat = async () => {
        setIsSubmitting(true);
        setError(null);

        if (!userMessage.trim()) {
            setError('Please enter a message before continuing.');
            setIsSubmitting(false);
            return;
        }

        // Navigate directly to the public bot page, passing initial emotion and message
        navigate('/bot/public', {
            state: {
                initialEmotion: selectedEmotion,
                initialMessage: userMessage,
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Header - Always Visible */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-primary-200 p-3 rounded-full">
                            <Heart className="w-8 h-8 text-primary-700" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-heading text-primary-900 mb-2">
                        You're Not Alone
                    </h1>
                    <p className="text-lg text-gray-600">
                        Take a deep breath. We're here to listen.
                    </p>
                </motion.div>

                {/* Step 1: Emotion Picker */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="card max-w-2xl mx-auto">
                            <h2 className="text-2xl font-heading text-primary-800 mb-6 text-center">
                                How are you feeling right now?
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {emotions.map((emotion) => (
                                    <motion.button
                                        key={emotion.id}
                                        onClick={() => handleEmotionSelect(emotion.id)}
                                        className={`
                      p-6 rounded-xl border-2 transition-all duration-300
                      ${selectedEmotion === emotion.id
                                                ? 'border-secondary-400 bg-secondary-50 shadow-lg'
                                                : 'border-primary-200 bg-white hover:border-primary-300 hover:shadow-md'
                                            }
                    `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="text-4xl mb-2">{emotion.icon}</div>
                                        <div className="text-base font-medium text-primary-800">
                                            {emotion.label}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <p className="text-sm text-gray-500 text-center mt-6">
                                This helps us understand how to support you better
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Free-Form Message */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="card max-w-2xl mx-auto">
                            <h2 className="text-2xl font-heading text-primary-800 mb-6">
                                What brings you here today?
                            </h2>

                            <textarea
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                placeholder="You can share as much or as little as you'd like. There's no judgment here."
                                className="input-field min-h-[180px] resize-none mb-4"
                                autoFocus
                            />

                            <div className="flex items-start gap-3 mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                <Sparkles className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-secondary-900">
                                    <strong>Just so you know:</strong> I'm an AI assistant here to support you, but I'm not a therapist.
                                    Everything we discuss is private, and I'm here to help connect you with the right resources.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-sm text-danger-700">{error}</p>
                                </motion.div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="btn-secondary flex-1"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleStartChat}
                                    disabled={!userMessage.trim() || isSubmitting}
                                    className="btn-primary flex-1"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Starting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <MessageCircle className="w-4 h-4" />
                                            Start Talking
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer - Reassurance */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary-500" />
                            <span>Confidential</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary-500" />
                            <span>24/7 Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-primary-500" />
                            <span>No Judgment</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-6">
                        🔒 No sign-up required. Start anonymous, create an account later.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
