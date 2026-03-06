import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Send, Flag, Trash2, Ban, ShieldAlert, X, Loader2, FileWarning } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { WeeklyCircleCall } from '../../components/community/WeeklyCircleCall';

export const PodDashboard: React.FC<{ podId: string; onBack?: () => void }> = ({ podId, onBack }) => {
    const { user } = useAuth();
    
    const [pod, setPod] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);

    const loadPodData = async () => {
        try {
            if (!podId) return;
            // 1. We need the pod details to know if we are a moderator. 
            // In a real app we'd have a specific GET /api/pods/:id endpoint, 
            // but for expediency we can find it from getMyPods
            const pods = await api.getMyPods();
            const activePod = pods.find((p: any) => p._id === podId);
            
            if (!activePod) {
                setError('Pod not found or you do not have access.');
                setIsLoading(false);
                return;
            }
            
            setPod(activePod);

            // 2. Load the feed
            const feedData = await api.getPodPosts(podId);
            setPosts(feedData.reverse()); // Reverse back so oldest is top
        } catch (err: any) {
            console.error("Failed to load pod", err);
            setError(err.response?.data?.error || 'Failed to load pod data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPodData();
        // Simple polling for a live-ish feel
        const interval = setInterval(loadPodData, 10000); 
        return () => clearInterval(interval);
    }, [podId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [posts]);

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !podId) return;
        
        try {
            setIsPosting(true);
            const savedPost = await api.createPodPost(podId, newPost);
            setPosts([...posts, savedPost]);
            setNewPost('');
        } catch (err) {
            console.error("Failed to post", err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleReport = async (postId: string) => {
        const reason = window.prompt("Why are you reporting this post? (e.g. Hate speech, suicidal ideation)");
        if (!reason) return;
        try {
            await api.reportPost(postId, reason);
            alert("Post reported to moderators. Thank you for keeping the community safe.");
            loadPodData();
        } catch (err) {
            console.error("Failed to report", err);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.deletePost(postId);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleBan = async (targetUserId: string, userName: string) => {
        if (!window.confirm(`Are you SURE you want to ban ${userName} from this pod permanently?`)) return;
        try {
            await api.banUserFromPod(podId!, targetUserId);
            alert("User banned.");
            loadPodData(); 
        } catch (err) {
            console.error("Failed to ban", err);
        }
    };

    if (isLoading) {
         return <div className="flex justify-center items-center h-[70vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
    }

    if (error || !pod) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-8 bg-rose-50 rounded-2xl text-center border border-rose-100">
                <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-600 mb-6">{error}</p>
                <button onClick={onBack} className="text-indigo-600 font-bold hover:underline">
                    &larr; Back to Communities
                </button>
            </div>
        );
    }

    const isModerator = pod.role === 'MODERATOR';

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex flex-col p-4 md:p-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
                         <X className="w-5 h-5" />
                     </button>
                     <div>
                         <div className="flex items-center gap-3">
                             <h1 className="text-3xl font-heading font-black text-slate-900">{pod.name}</h1>
                             {isModerator && (
                                 <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                                     <ShieldAlert className="w-3.5 h-3.5" /> Moderator
                                 </span>
                             )}
                         </div>
                         <p className="text-slate-500 flex items-center gap-2 mt-1">
                             <Users className="w-4 h-4" /> Intimate Pod ({pod.currentMemberCount}/15 Members)
                         </p>
                     </div>
                 </div>
            </div>

            {/* Video Component */}
            <div className="mb-6 shrink-0">
                <WeeklyCircleCall 
                    pod={pod} 
                    onJoin={() => {
                         // In a real app we'd navigate to the video room URL
                         window.open(`/jitsi-call?room=mindora-pod-${pod._id}`, '_blank');
                    }}
                />
            </div>

            {/* Feed Interface */}
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
                 
                 {/* Feed Header */}
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Community Feed</h3>
                      <span className="text-xs text-slate-500 font-medium">End-to-end encrypted safe space</span>
                 </div>

                 {/* Message Scroll Area */}
                 <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                     <AnimatePresence>
                         {posts.length === 0 ? (
                             <div className="h-full flex flex-col flex-1 items-center justify-center text-slate-400">
                                 <Users className="w-12 h-12 mb-3 opacity-20" />
                                 <p className="font-semibold px-4">This space is empty. Say hello to your pod!</p>
                             </div>
                         ) : (
                             posts.map((post) => {
                                 const isMe = post.authorId._id === user?.id;
                                 return (
                                     <motion.div 
                                        key={post._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                     >
                                         <span className="text-xs text-slate-400 font-bold ml-1 mb-1">{isMe ? 'You' : post.authorId.name}</span>
                                         <div className="group relative max-w-[85%] md:max-w-[70%]">
                                             
                                             {post.isFlagged && isModerator ? (
                                                  <div className="mb-2 bg-rose-50 border border-rose-200 p-3 rounded-lg w-full flex flex-col gap-2">
                                                      <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                                                           <FileWarning className="w-4 h-4" /> Reported by User
                                                      </div>
                                                      <p className="text-rose-900 text-sm">Reason: {post.flaggedReason}</p>
                                                      <div className="flex gap-2 mt-2">
                                                           <button onClick={() => handleDelete(post._id)} className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700">
                                                               <Trash2 className="w-3.5 h-3.5" /> Delete Post
                                                           </button>
                                                           <button onClick={() => handleBan(post.authorId._id, post.authorId.name)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900">
                                                               <Ban className="w-3.5 h-3.5" /> Ban Author
                                                           </button>
                                                      </div>
                                                  </div>
                                             ) : null}

                                             <div className={`p-4 rounded-2xl relative ${post.isFlagged ? 'bg-slate-100 text-slate-500 italic border border-slate-200' : isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                                                 {post.content}
                                             </div>
                                             
                                             {!isMe && !post.isFlagged && (
                                                 <button 
                                                     onClick={() => handleReport(post._id)}
                                                     className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-sm"
                                                     title="Report to Moderator"
                                                 >
                                                     <Flag className="w-3.5 h-3.5" />
                                                 </button>
                                             )}
                                         </div>
                                     </motion.div>
                                 );
                             })
                         )}
                         <div ref={chatEndRef} />
                     </AnimatePresence>
                 </div>

                 {/* Composer */}
                 <div className="p-4 bg-white border-t border-slate-100">
                     <form onSubmit={handlePost} className="relative flex items-center">
                         <input
                              type="text"
                              value={newPost}
                              onChange={(e) => setNewPost(e.target.value)}
                              placeholder="Share your thoughts with the pod..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                         />
                         <button 
                              type="submit" 
                              disabled={isPosting || !newPost.trim()}
                              className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                         >
                              {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         </button>
                     </form>
                 </div>

            </div>
        </div>
    );
};
