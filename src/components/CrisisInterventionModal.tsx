import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MessageSquare, X } from 'lucide-react';

interface CrisisInterventionModalProps {
    isOpen: boolean;
    crisisLevel: number;
    detectedKeywords?: string[];
    onClose?: () => void;
    onConnectTherapist?: () => void;
}

const EMERGENCY_HELPLINES = [
    {
        name: 'Tele MANAS (India)',
        number: '14416',
        description: '24/7 Mental Health Support',
        country: 'IN',
    },
    {
        name: 'Vandrevala Foundation',
        number: '1860-266-2345',
        description: '24/7 Crisis Helpline',
        country: 'IN',
    },
    {
        name: 'Emergency Services',
        number: '112',
        description: 'Immediate Emergency Assistance',
        country: 'IN',
    },
    {
        name: 'AASRA',
        number: '91-9820466726',
        description: 'Suicide Prevention Helpline',
        country: 'IN',
    },
];

export const CrisisInterventionModal: React.FC<CrisisInterventionModalProps> = ({
    isOpen,
    crisisLevel,
    detectedKeywords = [],
    onClose,
    onConnectTherapist,
}) => {
    const isCritical = crisisLevel >= 8;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 glass"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop Blur */}
                    <div className="absolute inset-0 bg-secondary-900/20 backdrop-blur-md" />

                    {/* Modal Content */}
                    <motion.div
                        className="relative w-full max-w-2xl bg-primary-50 rounded-2xl shadow-2xl overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Close Button (only for non-critical) */}
                        {!isCritical && onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-primary-200 hover:bg-primary-300 transition-colors duration-200 z-10"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-primary-800" />
                            </button>
                        )}

                        {/* Header */}
                        <div className="bg-gradient-to-r from-secondary-100 to-primary-100 p-8 text-center">
                            <motion.div
                                className="inline-flex items-center justify-center w-20 h-20 bg-danger-100 rounded-full mb-4"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            >
                                <AlertTriangle className="w-10 h-10 text-danger-600" />
                            </motion.div>
                            <h2 className="text-3xl font-heading text-primary-900 mb-2">
                                We're Here for You
                            </h2>
                            <p className="text-lg text-gray-700">
                                Your safety is our top priority right now.
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-6">
                            {/* Critical Message */}
                            {isCritical && (
                                <div className="p-6 bg-danger-50 border-2 border-danger-200 rounded-xl">
                                    <p className="text-base text-danger-900 font-medium mb-2">
                                        🚨 Based on what you've shared, we're really concerned about your safety.
                                    </p>
                                    <p className="text-sm text-danger-800">
                                        Please reach out to someone who can help you immediately. You don't have to go through this alone.
                                    </p>
                                </div>
                            )}

                            {/* Emergency Helplines */}
                            <div>
                                <h3 className="text-xl font-heading text-primary-900 mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-primary-600" />
                                    Emergency Helplines (24/7)
                                </h3>
                                <div className="grid gap-3">
                                    {EMERGENCY_HELPLINES.map((helpline, index) => (
                                        <motion.a
                                            key={helpline.number}
                                            href={`tel:${helpline.number}`}
                                            className="flex items-center justify-between p-4 bg-white border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all duration-200 group"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <div>
                                                <div className="font-medium text-primary-900 group-hover:text-primary-700">
                                                    {helpline.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {helpline.description}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-primary-700 group-hover:text-primary-900">
                                                    {helpline.number}
                                                </span>
                                                <Phone className="w-5 h-5 text-primary-500 group-hover:text-primary-700" />
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Connect to Therapist */}
                            {onConnectTherapist && (
                                <div className="pt-4 border-t-2 border-primary-200">
                                    <button
                                        onClick={onConnectTherapist}
                                        className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg"
                                    >
                                        <MessageSquare className="w-6 h-6" />
                                        Talk to a Licensed Therapist Now
                                    </button>
                                    <p className="text-sm text-gray-500 text-center mt-3">
                                        Average response time: &lt; 5 minutes
                                    </p>
                                </div>
                            )}

                            {/* Reassurance */}
                            <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                <p className="text-sm text-secondary-900">
                                    <strong>You are not alone.</strong> What you're feeling right now is temporary, even though it might not feel that way.
                                    Reaching out is the strongest thing you can do.
                                </p>
                            </div>

                            {/* Detected Keywords (for transparency) */}
                            {detectedKeywords.length > 0 && (
                                <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-700">
                                        Why am I seeing this? (Technical details)
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 rounded">
                                        <p className="mb-1">Crisis level detected: {crisisLevel}/10</p>
                                        <p>Our AI detected keywords that suggest you may be in distress. This is a safety measure to ensure you get the help you need.</p>
                                    </div>
                                </details>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
