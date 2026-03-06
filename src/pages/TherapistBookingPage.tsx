import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Award, MapPin, Video, CheckCircle, Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { format, parseISO } from 'date-fns';

interface Therapist {
    _id: string;
    userId: {
        name: string;
        avatar?: string;
        location?: string;
        bio?: string;
    };
    specializations: string[];
    certifications: string[];
    experienceYears: number;
    averageRating?: number;
    totalReviews: number;
    hourlyRateINR: number;
}

interface TimeSlot {
    _id: string;
    startTime: string;
    endTime: string;
    status: string;
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const TherapistBookingPage: React.FC = () => {
    const { therapistId } = useParams<{ therapistId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [therapistRes, slotsRes] = await Promise.all([
                    api.get(`/therapists/${therapistId}`),
                    api.get(`/slots/therapist/${therapistId}`)
                ]);
                setTherapist(therapistRes.data);
                setAvailableSlots(slotsRes.data);
            } catch (error) {
                console.error('Error fetching booking data:', error);
                showToast('Failed to load therapist details', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (therapistId) fetchData();
    }, [therapistId]);

    const handleBookSession = async () => {
        if (!selectedSlot || !therapist) return;

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                showToast('Razorpay SDK failed to load. Are you online?', 'error');
                return;
            }

            // Create Order
            const orderRes = await api.post('/payments/razorpay/create-order', {
                slotId: selectedSlot
            });

            const { orderId, amount, currency, key } = orderRes.data;

            const options = {
                key,
                amount,
                currency,
                name: 'Mindora',
                description: `Session with ${therapist.userId.name}`,
                image: '/logo.png',
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        await api.post('/payments/razorpay/success', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            slotId: selectedSlot
                        });

                        setBookingSuccess(true);
                        showToast('Booking Successful!', 'success');
                        setTimeout(() => navigate('/appointments'), 2500);
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        showToast('Payment verification failed. Please contact support.', 'error');
                    }
                },
                prefill: {
                    name: '', // Will be filled from auth user in real app
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#0d9488'
                },
                modal: {
                    ondismiss: () => {
                        showToast('Payment cancelled', 'info');
                    }
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error('Error initiating booking:', error);
            showToast(error.response?.data?.message || 'Failed to initiate booking', 'error');
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.floor(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!therapist) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-800">Therapist not found</h2>
                    <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium underline">Go Back</button>
                </div>
            </div>
        );
    }

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
                <motion.div
                    className="bg-white rounded-2xl p-12 shadow-xl text-center max-w-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading text-neutral-900 mb-2">Booking Confirmed!</h2>
                    <p className="text-neutral-600 mb-4">
                        Your appointment with {therapist.userId.name} has been successfully booked.
                    </p>
                    <p className="text-sm text-neutral-500">
                        Redirecting to your appointments...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Therapists
                </button>

                {/* Header Card */}
                <motion.div
                    className="bg-white rounded-xl p-8 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-start gap-6">
                        <img
                            src={therapist.userId.avatar || `https://ui-avatars.com/api/?name=${therapist.userId.name}&background=3b82f6&color=fff&size=200`}
                            alt={therapist.userId.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                        />
                        <div className="flex-1">
                            <h1 className="text-3xl font-heading text-neutral-900 mb-2">{therapist.userId.name}</h1>
                            <div className="flex items-center gap-4 mb-3">
                                {renderStars(therapist.averageRating || 5)}
                                <span className="text-sm font-semibold text-neutral-900">{therapist.averageRating || 5}</span>
                                <span className="text-sm text-neutral-500">({therapist.totalReviews} reviews)</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {therapist.userId.location || 'Remote'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {therapist.experienceYears}+ years experience
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Bio & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        <motion.div
                            className="bg-white rounded-xl p-8 shadow-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 className="text-2xl font-heading text-neutral-900 mb-4">About</h2>
                            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                                {therapist.userId.bio}
                            </p>
                        </motion.div>

                        {/* Specializations & Certifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="bg-white rounded-xl p-8 shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h3 className="text-xl font-heading text-neutral-900 mb-4">Specializations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.specializations?.map((spec, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-white rounded-xl p-8 shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3 className="text-xl font-heading text-neutral-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-secondary-600" />
                                    Certifications
                                </h3>
                                <ul className="space-y-2">
                                    {therapist.certifications?.map((cert, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{cert}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column - Booking */}
                    <div className="lg:col-span-1">
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm sticky top-6 space-y-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {/* Fee Structure */}
                            <div>
                                <h3 className="text-xl font-heading text-neutral-900 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Fees
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">Individual Session</p>
                                        </div>
                                        <span className="text-lg font-bold text-green-700">₹{therapist.hourlyRateINR}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Available Slots */}
                            <div>
                                <h3 className="text-lg font-heading text-neutral-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-600" />
                                    Available Slots
                                </h3>
                                {availableSlots.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No slots available right now.</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot._id}
                                                onClick={() => setSelectedSlot(slot._id)}
                                                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedSlot === slot._id
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'border-neutral-200 hover:border-primary-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-neutral-600" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-neutral-900">
                                                            {format(parseISO(slot.startTime), 'MMM d, h:mm a')}
                                                        </span>
                                                        <span className="text-xs text-slate-500">
                                                            {format(parseISO(slot.startTime), 'EEEE')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Book Button */}
                            <button
                                onClick={handleBookSession}
                                disabled={!selectedSlot}
                                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${selectedSlot
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                                    : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                    }`}
                            >
                                <Video className="w-5 h-5" />
                                Book Session
                            </button>

                            <p className="text-xs text-neutral-500 text-center">
                                Secure payment via Razorpay. Meeting link will be generated after successful payment.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};
