import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, Headphones, Star, Bookmark, RefreshCw } from 'lucide-react';
import api from '../services/api';

interface Resource {
    id: string;
    title: string;
    type: 'article' | 'video' | 'audio';
    category: string;
    author: string;
    image: string;
    isAssigned?: boolean;
    isPremium?: boolean;
    url?: string;
    publishedAt?: string;
}

const MOCK_ASSIGNED_RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'Understanding Anxiety Triggers',
        type: 'article',
        category: 'Anxiety',
        author: 'Dr. Sarah Smith',
        image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=500&q=80',
        isAssigned: true
    },
    {
        id: '4',
        title: 'Coping with Panic Attacks',
        type: 'article',
        category: 'Anxiety',
        author: 'Dr. Emily Chen',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
        isAssigned: true
    }
];

export const ResourcesPage: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'News', 'Anxiety', 'Depression', 'Sleep', 'Mindfulness', 'Wellness'];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            // Fetch live news
            let newsItems: Resource[] = [];
            try {
                const data = await api.getNews();
                if (Array.isArray(data)) {
                    newsItems = data;
                }
            } catch (err) {
                console.error('Failed to load news', err);
            }

            // Combine with mock assigned resources
            // In a real app, assigned resources would also come from API
            setResources([...MOCK_ASSIGNED_RESOURCES, ...newsItems]);
        } catch (error) {
            console.error('Failed to fetch resources', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(res => {
        // News items usually have 'News' category or 'General'
        const itemCategory = res.category || 'News';
        const matchesCategory = filter === 'all' || itemCategory.toLowerCase() === filter.toLowerCase();

        // Search title match
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const assignedResources = resources.filter(r => r.isAssigned);
    // General resources are those NOT assigned
    const generalResources = filteredResources.filter(r => !r.isAssigned);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Learning Center</h1>
                    <p className="text-slate-500 mt-1">Latest mental health news, articles, and guides.</p>
                </div>
                <button
                    onClick={fetchResources}
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                    title="Refresh News"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {/* Assigned Section */}
            {assignedResources.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h2 className="text-xl font-bold text-slate-800">Assigned by your Therapist</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignedResources.map(resource => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
                    </div>
                </section>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat.toLowerCase())}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat.toLowerCase()
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading latest news...</div>
            ) : generalResources.length === 0 ? (
                <div className="text-center py-20 text-slate-400">No resources found matching your criteria.</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generalResources.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
    const Icons = {
        article: BookOpen,
        video: Video,
        audio: Headphones
    };
    // Default to BookOpen if type is unknown (e.g. from API)
    const Icon = Icons[resource.type] || BookOpen;

    const handleCardClick = () => {
        if (resource.url) {
            window.open(resource.url, '_blank');
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img
                    src={resource.image}
                    alt={resource.title}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=500&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {resource.type ? (resource.type.charAt(0).toUpperCase() + resource.type.slice(1)) : 'Article'}
                </div>
                {resource.isAssigned && (
                    <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
                        Assigned
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="text-xs font-medium text-primary-600 mb-2">{(resource.category || 'News').toUpperCase()}</div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                    {resource.title}
                </h3>
                <div className="mt-auto flex justify-between items-center pt-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-500 line-clamp-1">{resource.author || 'Unknown Source'}</span>
                        {resource.publishedAt && (
                            <span className="text-xs text-slate-400">
                                {new Date(resource.publishedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <button className="text-slate-400 hover:text-primary-600 transition-colors">
                        <Bookmark className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
