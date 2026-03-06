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
        <div className="relative min-h-screen">
            {/* Background Accent Gradients */}
            <div className="fixed top-0 right-0 -mr-48 -mt-48 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="fixed bottom-0 left-0 -ml-48 -mb-48 w-[600px] h-[600px] bg-sky-100/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '12s' }} />

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
                className="w-full max-w-7xl mx-auto space-y-12 pb-24 relative z-10"
            >
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 pt-8">
                    <div>
                        <h1 className="text-5xl font-heading font-black text-slate-900 tracking-tight leading-none">Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Perfect Match</span></h1>
                        <p className="text-slate-500 mt-6 text-xl font-semibold max-w-2xl leading-relaxed">
                            Connect with world-class verified mental health professionals tailored to your unique journey.
                        </p>
                    </div>
                </motion.div>

                {/* Smart Search & Filter */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-white/70 backdrop-blur-2xl rounded-[40px] p-6 border border-white shadow-[0_32px_80px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, specialization, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border border-transparent focus:border-primary-200 rounded-[28px] text-slate-800 font-bold text-lg focus:outline-none focus:ring-8 focus:ring-primary-500/5 transition-all placeholder:text-slate-300"
                        />
                    </div>

                    <div className="w-full md:w-auto flex gap-4">
                        <div className="relative flex-1 md:w-72 group">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary-500 pointer-events-none transition-colors" />
                            <select
                                value={selectedSpec}
                                onChange={(e) => setSelectedSpec(e.target.value)}
                                className="w-full pl-16 pr-12 py-5 bg-white border border-transparent focus:border-primary-200 rounded-[28px] text-slate-700 font-bold text-lg focus:outline-none focus:ring-8 focus:ring-primary-500/5 appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">All Specialties</option>
                                {allSpecializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="w-5 h-5 text-slate-300 rotate-90" />
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

                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredTherapists.map((therapist) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                key={therapist._id}
                                className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all overflow-hidden group flex flex-col active:scale-[0.98]"
                            >
                                <div className="p-10 flex-1 relative">
                                    {therapist.isAcceptingPatients && (
                                        <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center text-center gap-6 mb-8">
                                        <div className="relative">
                                            <img
                                                src={therapist.userId?.avatar || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=eff6ff&color=3b82f6&size=200`}
                                                alt={therapist.userId?.name}
                                                className="w-28 h-28 rounded-[36px] object-cover border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500"
                                            />
                                            <div className="absolute -bottom-2 -right-2 bg-white rounded-2xl p-2 shadow-lg ring-4 ring-white">
                                                <CheckCircle2 className="w-6 h-6 text-primary-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl text-slate-900 leading-tight tracking-tight group-hover:text-primary-600 transition-colors">{therapist.userId?.name}</h3>
                                            <div className="flex items-center justify-center gap-4 mt-2">
                                                <span className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-widest">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {therapist.averageRating || 5.0}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {therapist.totalReviews} Reviews
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                                        {(therapist.specializations || []).slice(0, 3).map((spec, i) => (
                                            <span
                                                key={i}
                                                className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-sm font-semibold text-slate-500 text-center mb-8 line-clamp-3 leading-relaxed px-2">
                                        {therapist.bio}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 p-5 rounded-[28px] border border-slate-100/50">
                                        <div className="flex flex-col items-center gap-1.5 border-r border-slate-200">
                                            <Award className="w-5 h-5 text-primary-500 mb-1" />
                                            <span>{therapist.experienceYears}Y Experience</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <MapPin className="w-5 h-5 text-primary-500 mb-1" />
                                            <span className="truncate max-w-[100px]">{therapist.location?.split(',')[0] || 'Remote'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 pt-0 flex flex-col gap-6 mt-auto">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Consultation</span>
                                            <span className="text-2xl font-black text-slate-900 tracking-tight">₹{therapist.hourlyRateINR || (therapist.hourlyRateUSD ? therapist.hourlyRateUSD * 83 : 'Free')}</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => handleMessageTherapist(therapist.userId._id)}
                                            className="w-16 h-16 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-[20px] transition-all shadow-sm hover:shadow-xl flex items-center justify-center shrink-0 active:scale-95"
                                            title="Send Message"
                                        >
                                            <MessageSquare className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/therapist-profile/${therapist._id}`)}
                                            className="flex-1 h-16 bg-slate-900 border border-slate-900 text-white rounded-[20px] transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95"
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
        </div>
    );
};
