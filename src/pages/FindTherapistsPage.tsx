import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Award, MapPin, Filter, Calendar, ChevronRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Therapist {
    _id: string; // Use _id from db
    userId: {
        _id: string;
        name: string;
        avatar?: string;
    };
    specializations: string[];
    certifications: string[];
    experienceYears: number;
    averageRating?: number;
    totalReviews: number;
    hourlyRateINR?: number;
    hourlyRateUSD?: number;
    location?: string;
    bio: string;
    isAcceptingPatients: boolean;
}

export const FindTherapistsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedSpec, setSelectedSpec] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleMessageTherapist = async (therapistUserId: string) => {
        try {
            if (!user?.id) {
                navigate('/login');
                return;
            }
            await api.post('/appointments/chat', {
                therapistUserId
            });
            navigate('/messages');
        } catch (error) {
            console.error('Failed to start conversation:', error);
            navigate('/messages');
        }
    };

    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const response = await api.get('/therapists');
                setTherapists(response.data);
            } catch (error) {
                console.error('Failed to fetch therapists:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    const allSpecializations = Array.from(
        new Set(therapists.flatMap(t => t.specializations || []))
    ).sort();

    const filteredTherapists = therapists.filter(therapist => {
        const matchesSpec = selectedSpec === 'all' || (therapist.specializations && therapist.specializations.includes(selectedSpec));
        const matchesSearch = searchQuery === '' ||
            (therapist.userId?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (therapist.specializations && therapist.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesSpec && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
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
            className="w-full max-w-7xl mx-auto space-y-8"
        >
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Find Your Therapist</h1>
                    <p className="text-slate-500 mt-2 text-lg">Connect with verified mental health professionals.</p>
                </div>
            </motion.div>

            {/* Smart Search & Filter */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4 items-center relative z-20">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, specialization, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-transparent focus:border-primary-500 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>

                <div className="w-full md:w-auto flex gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <select
                            value={selectedSpec}
                            onChange={(e) => setSelectedSpec(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-transparent focus:border-primary-500 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer transition-all"
                        >
                            <option value="all">All Specialties</option>
                            {allSpecializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Active Filters Display */}
            <AnimatePresence>
                {(selectedSpec !== 'all' || searchQuery) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="flex flex-wrap items-center gap-2 overflow-hidden"
                    >
                        <span className="text-sm font-semibold text-slate-500 mr-1">Active Filters:</span>
                        {selectedSpec !== 'all' && (
                            <span className="px-3.5 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
                                {selectedSpec}
                                <button onClick={() => setSelectedSpec('all')} className="hover:bg-primary-200/50 p-0.5 rounded-full transition-colors">
                                    <Search className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')} className="hover:bg-slate-200 p-0.5 rounded-full transition-colors">
                                    <Search className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={() => { setSelectedSpec('all'); setSearchQuery(''); }}
                            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors ml-2 underline underline-offset-2"
                        >
                            Clear All
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{filteredTherapists.length}</span> therapists
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                    Sort by: Recommended <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
            </motion.div>

            <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                <AnimatePresence>
                    {filteredTherapists.map((therapist) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={therapist._id}
                            className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all overflow-hidden group flex flex-col"
                        >
                            <div className="p-6 pb-5 flex-1 relative">
                                {therapist.isAcceptingPatients && (
                                    <div className="absolute top-6 right-6 flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100/50">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Accepting</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-4 mb-5">
                                    <div className="relative">
                                        <img
                                            src={therapist.userId?.avatar || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=eff6ff&color=3b82f6&size=200`}
                                            alt={therapist.userId?.name}
                                            className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 bg-white rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex-1 pr-6 cursor-pointer" onClick={() => navigate(`/therapist-profile/${therapist._id}`)}>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{therapist.userId?.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                                <Star className="w-3 h-3 fill-amber-500" /> {therapist.averageRating || 5.0}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500">
                                                {therapist.totalReviews} reviews
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(therapist.specializations || []).slice(0, 3).map((spec, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 rounded-lg text-xs font-semibold cursor-default"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                    {(therapist.specializations || []).length > 3 && (
                                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-semibold">
                                            +{(therapist.specializations?.length || 0) - 3}
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
                                    {therapist.bio}
                                </p>

                                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500 mb-4 bg-slate-50/50 p-3 rounded-2xl">
                                    <div className="flex justify-start items-center gap-2">
                                        <Award className="w-4 h-4 text-primary-500" />
                                        <span>{therapist.experienceYears}y Exp.</span>
                                    </div>
                                    <div className="flex justify-start items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        <span className="truncate">{therapist.location?.split(',')[0] || 'Remote'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Session Fee</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-slate-900">₹{therapist.hourlyRateINR || (therapist.hourlyRateUSD ? therapist.hourlyRateUSD * 83 : 'Free')}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Next Available</span>
                                        <div className="flex gap-1.5 items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 mt-0.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Ask for availability
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => handleMessageTherapist(therapist.userId._id)}
                                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold shadow-sm hover:shadow-md border border-slate-200 flex items-center justify-center shrink-0"
                                        title="Send Message"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/therapist-profile/${therapist._id}`)}
                                        className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-semibold shadow-md shadow-primary-500/20 hover:-translate-y-0.5"
                                    >
                                        Book Session
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredTherapists.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-12"
                >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">No therapists found</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        We couldn't find any therapists matching your specific filters and search criteria.
                    </p>
                    <button
                        onClick={() => {
                            setSelectedSpec('all');
                            setSearchQuery('');
                        }}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-900/20"
                    >
                        Clear All Filters
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};
