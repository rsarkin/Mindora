import React, { useState } from 'react';
import type { Therapist } from '../types';
import { Star, Clock, MapPin, Shield, MessageSquare, Video } from 'lucide-react';
import api from '../services/api';

interface TherapistProfileProps {
    therapist: Therapist;
    onBack: () => void;
    onChat: () => void;
    onBookingComplete: () => void;
}

export const TherapistProfile: React.FC<TherapistProfileProps> = ({ therapist, onBack, onChat, onBookingComplete }) => {
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    const handleBookAppointment = async () => {
        if (!bookingDate || !bookingTime) {
            alert('Please select a date and time');
            return;
        }

        setIsBooking(true);
        try {
            await api.bookAppointment({
                therapistId: (therapist as any).id || (therapist as any)._id,
                date: bookingDate,
                time: bookingTime,
                type: 'video'
            });
            alert('Appointment booked successfully! You can join the video call from the Appointments tab.');
            onBookingComplete();
            onBack(); // Go back to list or maybe redirect to appointments tab
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to book appointment');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="h-full bg-white overflow-y-auto animate-fade-in">
            {/* Header Image */}
            <div className="h-48 bg-gradient-to-r from-teal-500 to-blue-600 relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    ← Back
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10 pb-12">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Image */}
                    <img
                        src={therapist.imageUrl}
                        alt={therapist.name}
                        className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                    />

                    <div className="flex-1 pt-16 md:pt-0 mt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{therapist.name}</h1>
                                <p className="text-teal-600 font-medium text-lg">{therapist.specialization}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                <Star className="w-4 h-4 text-amber-400 fill-current" />
                                <span className="font-bold text-amber-700">{therapist.rating}</span>
                                <span className="text-amber-600 text-sm">({(therapist.reviews as any)?.length || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{therapist.experience} exp</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>Online & In-person</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <span>Verified Professional</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">About</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Dr. {therapist.name.split(' ')[1]} is a dedicated mental health professional with extensive experience in
                                {therapist.specialization.toLowerCase()}. They believe in a holistic approach to mental wellness,
                                combining traditional therapy with modern mindfulness techniques.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Specialties</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Anxiety', 'Depression', 'Stress', 'Relationships', 'Trauma'].map((tag) => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Booking Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 h-fit sticky top-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500">Session Fee</span>
                            <span className="text-2xl font-bold text-slate-900">${therapist.hourlyRate}</span>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Time</label>
                                <input
                                    type="time"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleBookAppointment}
                                disabled={isBooking}
                                className="w-full py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Video className="w-5 h-5" />
                                {isBooking ? 'Booking...' : 'Book Video Session'}
                            </button>

                            <button
                                onClick={onChat}
                                className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-teal-600 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Chat with Therapist
                            </button>
                        </div>

                        <p className="text-xs text-center text-slate-400 mt-4">
                            Free cancellation up to 24 hours before session.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
