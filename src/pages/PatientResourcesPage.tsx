import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, BookOpen, Video, FileText, Sparkles, Filter, ChevronRight, Quote, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Resource {
    id: string;
    type: "video" | "article";
    title: string;
    category: string;
    videoId?: string;
    thumbnail?: string;
    url?: string;
    description: string;
    duration?: string;
}

interface VideoModalProps {
    videoId: string;
    title: string;
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoId, title, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-100/20"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                            <Play className="w-5 h-5 ml-1" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-slate-900 line-clamp-1">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="aspect-video bg-slate-900">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const PatientResourcesPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [resources, setResources] = useState<Resource[]>([]);
    const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

    const categories = ["All", "Yoga & Mindfulness", "Meditation", "Sleep", "Anxiety", "Depression", "Wellness"];

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setIsLoading(true);
                const data = await api.getResources();
                setQuote(data.quote);
                const allRes: Resource[] = [...(data.videos || []), ...(data.articles || [])];
                setResources(allRes);
                setError(null);
            } catch (err) {
                console.error("Failed to load resources:", err);
                setError("Failed to load fresh resources today. Please check back later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResources();
    }, []);

    const filteredResources = selectedCategory === "all"
        ? resources
        : resources.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());

    const videos = filteredResources.filter(r => r.type === "video");
    const articles = filteredResources.filter(r => r.type === "article");

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
            className="max-w-7xl mx-auto space-y-12 pb-12"
        >
            {/* Header Area - Ultra Premium */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="relative p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden shadow-2xl">
                {/* Atmospheric Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -ml-24 -mb-24" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <Sparkles className="w-4 h-4 text-sky-300" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Knowledge Hub</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                            Your Sanctuary for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">Growth</span>
                        </h1>
                        <p className="text-indigo-100/70 mt-4 text-lg font-medium leading-relaxed">
                            Curated wisdom to nourish your mind, body, and spirit. Guided by expert therapists and researchers.
                        </p>
                    </div>

                    <div 
                        onClick={() => navigate('/bot')} 
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] cursor-pointer hover:bg-white/15 transition-all group shrink-0 shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-500/40 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-black text-white group-hover:text-sky-300 transition-colors">TARA Personalized</h4>
                                <p className="text-xs font-bold text-sky-200/60 mt-0.5 uppercase tracking-wider">Ask for recommendations</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors ml-2" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Daily Inspiration Overlay Card */}
            {quote && (
                <motion.div 
                    variants={STAGGER_CHILD_VARIANTS} 
                    className="relative -mt-20 mx-8 sm:mx-16 bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-8 z-20"
                >
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                        <Quote className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-xl sm:text-2xl font-bold text-slate-800 italic leading-relaxed">"{quote.text}"</p>
                        <p className="text-amber-600 font-black mt-2 uppercase tracking-widest text-sm">— {quote.author}</p>
                    </div>
                </motion.div>
            )}

            {/* Error & Loading States */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 font-bold text-lg">
                            <AlertCircle className="w-6 h-6" /> {error}
                        </div>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white rounded-2xl shadow-xl shadow-red-500/5 text-sm font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95">
                            Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading && (
                <div className="py-32 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
                        <Sparkles className="w-6 h-6 text-sky-500 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <p className="mt-6 font-black text-slate-400 uppercase tracking-[0.2em] text-sm">Synchronizing your sanctuary...</p>
                </div>
            )}

            {!isLoading && (
                <>
                    {/* Filter Tabs */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Filter className="w-6 h-6 text-sky-500" /> Exploration
                            </h2>
                            <div className="hidden md:flex gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat.toLowerCase())}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat.toLowerCase()
                                            ? "bg-white text-sky-600 shadow-md ring-1 ring-slate-200/50"
                                            : "text-slate-400 hover:text-slate-600"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Category Scroller */}
                        <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-hide px-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat.toLowerCase())}
                                    className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm ${selectedCategory === cat.toLowerCase()
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-slate-500 border border-slate-100"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video Section */}
                    {videos.length > 0 && (
                        <div className="space-y-8 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                                    <Video className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Immersive Sessions</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence>
                                    {videos.map((resource) => (
                                        <motion.div
                                            key={resource.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 cursor-pointer"
                                            onClick={() => setSelectedVideo({ id: resource.videoId!, title: resource.title })}
                                        >
                                            <div className="relative aspect-video overflow-hidden">
                                                <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-all flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl transform transition-all group-hover:scale-110 group-hover:rotate-6">
                                                        <Play className="w-7 h-7 text-sky-600 ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">
                                                        {resource.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-8">
                                                <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
                                                    {resource.title}
                                                </h4>
                                                <p className="text-slate-500 mt-3 font-medium text-sm leading-relaxed line-clamp-2 uppercase tracking-wide opacity-70">
                                                    {resource.description}
                                                </p>
                                                <div className="mt-6 flex items-center gap-2">
                                                    <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-sky-500 w-1/3 group-hover:w-full transition-all duration-1000" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.duration}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Articles Section */}
                    {articles.length > 0 && (
                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deep Reads</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {articles.map((resource) => (
                                    <motion.a
                                        key={resource.id}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group bg-slate-50/50 hover:bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex gap-6"
                                    >
                                        <div className="w-20 h-20 bg-white shadow-md rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 group-hover:text-indigo-600 transition-colors">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{resource.category}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.duration}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                                                {resource.title}
                                            </h4>
                                            <p className="mt-2 text-slate-500 font-medium text-sm leading-relaxed line-clamp-1 opacity-70">
                                                {resource.description}
                                            </p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredResources.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Filter className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">No Discoveries Here</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">It seems we don't have resources for this category yet. Please check "All" resources.</p>
                            <button onClick={() => setSelectedCategory('all')} className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                View Everything
                            </button>
                        </motion.div>
                    )}
                </>
            )}

            {/* Video Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <VideoModal
                        videoId={selectedVideo.id}
                        title={selectedVideo.title}
                        onClose={() => setSelectedVideo(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
