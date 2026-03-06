import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, BookOpen, Video, FileText, Sparkles, Filter, ChevronRight, Loader2, Quote, AlertCircle } from "lucide-react";
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

    const categories = ["All", "Yoga & Mindfulness", "Health News", "Meditation", "Sleep", "Anxiety", "Depression"];

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setIsLoading(true);
                const data = await api.getResources();
                setQuote(data.quote);
                // Combine and normalize API data into common Resource interface
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
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Header Area */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Wellness Resources</h1>
                    <p className="text-slate-500 mt-2 text-lg">Curated articles, guides, and videos to support your mental health journey.</p>
                </div>

                {/* AI Helper Callout */}
                <div onClick={() => navigate('/messages')} className="flex items-center gap-4 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-100/50 p-4 rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group shrink-0">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">Not sure where to start?</h4>
                        <p className="text-sm font-medium text-slate-600 mt-0.5">Ask our AI for personalized recommendations.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors ml-2" />
                </div>
            </motion.div>

            {/* Daily Quote Section */}
            {quote && (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Quote className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Daily Inspiration</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-800 leading-tight mb-4">"{quote.text}"</h3>
                        <p className="text-amber-700 font-bold">— {quote.author}</p>
                    </div>
                </motion.div>
            )}

            {/* Error handling */}
            {error && (
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex justify-center items-center gap-2 font-semibold">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm hover:bg-slate-50 transition-colors shrink-0">
                        Retry
                    </button>
                </motion.div>
            )}

            {/* Loading Display */}
            {isLoading && (
                <div className="py-24 flex flex-col items-center justify-center text-primary-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-semibold animate-pulse">Fetching latest resources...</p>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    {/* Categories filter tabs */}
                    <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category.toLowerCase())}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${selectedCategory === category.toLowerCase()
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Video Library */}
                    {videos.length > 0 && (
                        <motion.div variants={STAGGER_CHILD_VARIANTS} className="pt-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                    <Video className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Video Library</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {videos.map((resource) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            key={resource.id}
                                            className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col"
                                            onClick={() => setSelectedVideo({ id: resource.videoId!, title: resource.title })}
                                        >
                                            <div className="relative aspect-video overflow-hidden bg-slate-100">
                                                <img
                                                    src={resource.thumbnail}
                                                    alt={resource.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                                                        <Play className="w-6 h-6 text-slate-900 ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm">
                                                        {resource.category}
                                                    </span>
                                                </div>
                                                {resource.duration && (
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white font-semibold text-xs rounded-lg shadow-sm">
                                                        {resource.duration}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                                                    {resource.title}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                                    {resource.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* Articles Section */}
                    {articles.length > 0 && (
                        <motion.div variants={STAGGER_CHILD_VARIANTS} className="pt-8 border-t border-slate-200/60">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                                    <BookOpen className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Articles & Guides</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <AnimatePresence>
                                    {articles.map((resource) => (
                                        <motion.a
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            key={resource.id}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group block relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-50/50 transition-colors z-0" />

                                            <div className="flex items-start gap-5 relative z-10">
                                                <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:border-teal-100 group-hover:text-teal-600 transition-colors shadow-sm">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/50">
                                                            {resource.category}
                                                        </span>
                                                        {resource.duration && (
                                                            <span className="text-xs font-semibold text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded-md">
                                                                {resource.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-teal-700 transition-colors pr-6">
                                                        {resource.title}
                                                    </h3>
                                                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                                        {resource.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {filteredResources.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Filter className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">No resources found</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                There are currently no resources available for the selected category.
                            </p>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-semibold shadow-lg shadow-slate-900/20"
                            >
                                View All Resources
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
