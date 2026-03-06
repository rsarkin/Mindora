import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Users, User, MoreVertical, Smile, CheckCheck, Paperclip, Plus } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { CommunitiesPage } from './patient/CommunitiesPage';
import { PodDashboard } from './patient/PodDashboard';

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
    };
    content: string;
    createdAt: string;
    isOwn?: boolean;
    isRead?: boolean;
    status?: 'sent' | 'delivered' | 'read';
    metadata?: any;
}

interface Conversation {
    _id: string;
    type: 'direct' | 'group';
    groupName?: string;
    participants: {
        _id: string;
        name: string;
        role?: string;
    }[];
    lastMessage?: {
        content: string;
        createdAt: string;
        sender: string;
    };
    updatedAt: string;
}

export const PatientMessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [activePodId, setActivePodId] = useState<string | null>(null);
    const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
    const [myPods, setMyPods] = useState<any[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // New Chat State
    const [isSearchingTherapists, setIsSearchingTherapists] = useState(false);
    const [allTherapists, setAllTherapists] = useState<any[]>([]);
    const [therapistSearchQuery, setTherapistSearchQuery] = useState('');

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();

    const fetchConversations = async () => {
        try {
            const res = await api.get('/appointments/my-appointments');
            const mappedConvs = res.data.map((appt: any) => ({
                _id: appt._id,
                type: 'direct',
                participants: [
                    { _id: user?.id, name: user?.name || 'Patient', role: 'PATIENT' },
                    { _id: appt.therapistId?._id, name: appt.therapist?.user?.name || appt.therapistId?.userId?.name || 'Unknown Therapist', role: 'THERAPIST' }
                ],
                updatedAt: appt.createdAt,
                lastMessage: { content: `${appt.status} Request` }
            }));

            setConversations(mappedConvs);

            // Fetch Pods
            const pods = await api.getMyPods();
            setMyPods(pods);

            if (mappedConvs.length > 0 && !activeChatId && !activePodId && !isDiscoveryMode) {
                setActiveChatId(mappedConvs[0]._id);
            }
        } catch (err) {
            console.error('Failed to load appointments/conversations/pods', err);
        }
    };

    const handleStartNewChat = async (therapistUserId: string) => {
        try {
            const res = await api.post('/appointments/chat', { therapistUserId });
            await fetchConversations();

            // Set the active chat to the newly created/returned appointment ID
            setActiveChatId(res.data._id);
            setIsSearchingTherapists(false);
            setTherapistSearchQuery('');
        } catch (error) {
            console.error('Failed to start new chat:', error);
        }
    };

    useEffect(() => {
        fetchConversations();

        // Load therapists for the new chat search
        const fetchTherapists = async () => {
            try {
                const response = await api.get('/therapists');
                setAllTherapists(response.data);
            } catch (error) {
                console.error('Failed to fetch therapists:', error);
            }
        };
        fetchTherapists();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${activeChatId}?limit=50`);
                const loadedMessages = res.data.map((msg: any) => ({
                    ...msg,
                    isOwn: msg.senderId === user?.id,
                    sender: {
                        _id: msg.senderId,
                        name: msg.senderId === user?.id ? 'You' : 'Therapist'
                    }
                }));

                setMessages(loadedMessages);
                setHasMore(loadedMessages.length === 50);

                if (socket) {
                    socket.emit('mark:read', { appointmentId: activeChatId, userId: user?.id });
                }

                setTimeout(scrollToBottom, 50);
            } catch (err) {
                console.error('Failed to load messages', err);
            }
        };

        fetchMessages();

        // Join socket room
        if (socket) {
            socket.emit('join:room', activeChatId);
        }

    }, [activeChatId, user?.id]);

    useEffect(() => {
        if (!socket) return;

        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };

        const handleNewMessage = (msg: any) => {
            if (msg.appointmentId === activeChatId) {
                const isOwn = msg.senderId === user?.id;
                const formattedMsg: Message = {
                    ...msg,
                    isOwn,
                    sender: { _id: msg.senderId, name: isOwn ? 'You' : 'Therapist' }
                };

                setMessages(prev => {
                    if (prev.find(m => m._id === formattedMsg._id)) return prev;
                    return [...prev, formattedMsg];
                });
                setTimeout(scrollToBottom, 50);
            }

            setConversations(prev => prev.map(conv => {
                if (conv._id === msg.appointmentId) {
                    return {
                        ...conv,
                        lastMessage: {
                            content: msg.content,
                            createdAt: msg.createdAt,
                            sender: msg.senderId
                        },
                        updatedAt: msg.createdAt
                    };
                }
                return conv;
            }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        };

        const handleTypingStart = (data: { appointmentId: string, userId: string }) => {
            if (data.appointmentId === activeChatId && data.userId !== user?.id) {
                setIsTyping(true);
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleTypingStop = (data: { appointmentId: string, userId: string }) => {
            if (data.appointmentId === activeChatId && data.userId !== user?.id) {
                setIsTyping(false);
            }
        };

        const handleReadReceipt = (data: { appointmentId: string, userId: string }) => {
            if (data.appointmentId === activeChatId && data.userId !== user?.id) {
                setMessages(prev => prev.map(m => (!m.isOwn ? m : { ...m, isRead: true })));
            }
        };

        socket.on('receive:message', handleNewMessage);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);
        socket.on('messages:read', handleReadReceipt);

        return () => {
            socket.off('receive:message', handleNewMessage);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
            socket.off('messages:read', handleReadReceipt);
        };
    }, [socket, activeChatId, user?.id]);

    const handleScroll = async () => {
        if (!messagesContainerRef.current || !hasMore || isLoadingMore || !activeChatId) return;

        const { scrollTop, scrollHeight } = messagesContainerRef.current;
        if (scrollTop === 0 && messages.length > 0) {
            setIsLoadingMore(true);
            try {
                const oldestMsg = messages[0];
                const res = await api.get(`/messages/${activeChatId}?limit=50&before=${oldestMsg.createdAt}`);

                const olderMessages = res.data.map((msg: any) => ({
                    ...msg,
                    isOwn: msg.senderId === user?.id,
                    sender: {
                        _id: msg.senderId,
                        name: msg.senderId === user?.id ? 'You' : 'Therapist'
                    }
                }));

                if (olderMessages.length < 50) setHasMore(false);

                // Maintain scroll position
                const prevScrollHeight = scrollHeight;
                setMessages(prev => [...olderMessages, ...prev]);

                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - prevScrollHeight;
                    }
                }, 10);
            } catch (error) {
                console.error('Failed to load older messages', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeChatId) return;

        const content = newMessage.trim();
        setNewMessage('');

        const activeConv = conversations.find(c => c._id === activeChatId);
        const receiver = activeConv?.participants.find(p => p.role === 'THERAPIST');

        try {
            if (socket) {
                socket.emit('send:message', {
                    appointmentId: activeChatId,
                    senderId: user?.id,
                    receiverId: receiver?._id,
                    content
                });
            }
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / 3600000;

        if (hours < 24 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const activeConversation = conversations.find(c => c._id === activeChatId);

    const getChatName = (conv: Conversation) => {
        if (conv.type === 'group') return conv.groupName || 'Group Chat';
        const other = conv.participants.find(p => p._id !== user?.id);
        return other ? other.name : 'Unknown';
    };

    const directChats = conversations.filter(c => c.type === 'direct');

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] w-full max-w-7xl mx-auto flex bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative z-10">
            {/* Sidebar List */}
            <div className="w-80 md:w-96 flex-shrink-0 bg-slate-50/50 flex flex-col border-r border-slate-100 z-20 hidden md:flex relative">
                <div className="p-6 pb-4 bg-white/50 backdrop-blur-md sticky top-0 border-b border-slate-100 z-20">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Messages</h1>
                        {isSearchingTherapists ? (
                            <button
                                onClick={() => { setIsSearchingTherapists(false); setTherapistSearchQuery(''); }}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Cancel
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsSearchingTherapists(true)}
                                className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors"
                                title="New Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={isSearchingTherapists ? "Find a therapist..." : "Search messages..."}
                            value={isSearchingTherapists ? therapistSearchQuery : searchQuery}
                            onChange={e => isSearchingTherapists ? setTherapistSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium shadow-sm transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {isSearchingTherapists && (
                    <div className="absolute top-[138px] left-0 right-0 bottom-0 bg-white z-30 overflow-y-auto scrollbar-hide px-3 py-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Verified Therapists</h3>
                        <div className="space-y-1">
                            {allTherapists
                                .filter(t => (t.userId?.name || '').toLowerCase().includes((therapistSearchQuery || '').toLowerCase()))
                                .map(therapist => (
                                    <button
                                        key={therapist._id}
                                        onClick={() => handleStartNewChat(therapist.userId._id)}
                                        className="w-full p-3 rounded-2xl transition-all text-left flex items-center gap-3 group hover:bg-slate-50 border border-transparent hover:border-slate-100"
                                    >
                                        <img
                                            src={therapist.userId?.avatar || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=eff6ff&color=3b82f6&size=100`}
                                            alt={therapist.userId?.name}
                                            className="w-10 h-10 rounded-full object-cover shadow-sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                                                {therapist.userId?.name}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate">
                                                {therapist.specializations?.[0] || 'Therapist'}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            }
                            {allTherapists.filter(t => (t.userId?.name || '').toLowerCase().includes((therapistSearchQuery || '').toLowerCase())).length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-500">No therapists found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 px-3 mb-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Chats</h3>
                        </div>
                        <div className="space-y-1">
                            {directChats.filter(c => (getChatName(c) || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map(chat => (
                                <button
                                    key={chat._id}
                                    onClick={() => { setActiveChatId(chat._id); setActivePodId(null); setIsDiscoveryMode(false); }}
                                    className={`w-full p-3 rounded-2xl transition-all text-left flex items-start gap-3 group relative overflow-hidden ${activeChatId === chat._id
                                        ? 'bg-primary-50 ring-1 ring-primary-100 shadow-sm'
                                        : 'hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-100 border border-transparent'
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${getChatName(chat)}&background=eff6ff&color=3b82f6&size=100`}
                                            alt={getChatName(chat)}
                                            className="w-12 h-12 rounded-full object-cover shadow-sm bg-white"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className={`font-bold text-sm truncate pr-2 ${activeChatId === chat._id ? 'text-primary-900' : 'text-slate-900'}`}>
                                                {getChatName(chat)}
                                            </h4>
                                            <span className="text-[10px] font-semibold whitespace-nowrap text-slate-400">
                                                {formatTime(chat.updatedAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs truncate max-w-[140px] font-medium text-slate-500">
                                                {chat.lastMessage?.content || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Groups</h3>
                            </div>
                            <button 
                                onClick={() => { setIsDiscoveryMode(true); setActiveChatId(null); setActivePodId(null); }}
                                className="p-1 hover:bg-secondary-100 text-secondary-600 rounded-lg transition-colors"
                                title="Discover Communities"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-1 pb-4">
                            {myPods.filter(p => (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map(pod => (
                                <button
                                    key={pod._id}
                                    onClick={() => { setActivePodId(pod._id); setActiveChatId(null); setIsDiscoveryMode(false); }}
                                    className={`w-full p-3 rounded-2xl transition-all text-left flex items-start gap-3 group relative overflow-hidden ${activePodId === pod._id
                                        ? 'bg-secondary-50 ring-1 ring-secondary-100 shadow-sm'
                                        : 'hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-100 border border-transparent'
                                        }`}
                                >
                                    <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-full flex items-center justify-center text-secondary-600 shadow-inner border border-secondary-200">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h4 className={`font-bold text-sm truncate pr-2 ${activePodId === pod._id ? 'text-secondary-900' : 'text-slate-900'}`}>
                                            {pod.name}
                                        </h4>
                                        <p className="text-xs truncate max-w-[140px] font-medium text-slate-500">
                                            {pod.communityId?.name || 'Community Pod'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {myPods.length === 0 && !isDiscoveryMode && (
                                <div className="px-3 py-2">
                                    <p className="text-[11px] text-slate-400 italic">No pods joined yet.</p>
                                    <button 
                                        onClick={() => { setIsDiscoveryMode(true); setActiveChatId(null); setActivePodId(null); }}
                                        className="text-xs font-bold text-secondary-600 hover:text-secondary-700 mt-1"
                                    >
                                        Browse Communities &rarr;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[length:400px_400px] overflow-hidden">
                {isDiscoveryMode ? (
                    <div className="flex-1 overflow-y-auto">
                        <CommunitiesPage 
                            onJoin={(podId) => {
                                fetchConversations();
                                setActivePodId(podId);
                                setIsDiscoveryMode(false);
                            }} 
                        />
                    </div>
                ) : activePodId ? (
                    <div className="flex-1 overflow-hidden">
                        <PodDashboard 
                            podId={activePodId} 
                            onBack={() => setIsDiscoveryMode(true)} 
                        />
                    </div>
                ) : activeConversation ? (
                    <>
                        <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-between z-20 shadow-sm relative">
                            <div className="flex items-center gap-4">
                                {activeConversation.type === 'direct' ? (
                                    <div className="relative">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${getChatName(activeConversation)}&background=eff6ff&color=3b82f6`}
                                            alt={getChatName(activeConversation)}
                                            className="w-11 h-11 rounded-full object-cover shadow-sm bg-slate-50"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-11 h-11 bg-gradient-to-br from-secondary-100 to-secondary-50 text-secondary-600 rounded-full flex items-center justify-center border border-secondary-200 shadow-sm">
                                        <Users className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">{getChatName(activeConversation)}</h3>
                                    {activeConversation.type === 'group' && (
                                        <p className="text-xs font-medium text-slate-500 truncate max-w-sm mt-0.5">
                                            {activeConversation.participants?.length} members
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/95 backdrop-blur-sm relative z-10 scrollbar-hide"
                        >
                            <AnimatePresence>
                                {messages.map((message, i) => {
                                    const showName = !message.isOwn && activeConversation.type === 'group' && (i === 0 || messages[i - 1].sender?._id !== message.sender?._id);

                                    return (
                                        <motion.div
                                            key={message._id}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                                                {showName && (
                                                    <span className="text-xs font-bold text-slate-400 ml-1 mb-1">
                                                        {message.sender?.name || 'User'}
                                                    </span>
                                                )}

                                                <div className={`relative px-4 py-3 shadow-sm ${message.isOwn
                                                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm border border-primary-700/50 shadow-primary-500/10'
                                                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                                                    }`}>
                                                    <p className={`text-[15px] leading-relaxed font-medium whitespace-pre-wrap ${message.isOwn ? 'text-white' : 'text-slate-700'}`}>
                                                        {message.content}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                    {message.isOwn && (
                                                        message.isRead ? (
                                                            <CheckCheck className="w-4 h-4 text-primary-500" />
                                                        ) : (
                                                            <CheckCheck className="w-4 h-4 text-slate-300" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="flex justify-start group"
                                >
                                    <div className="flex flex-col items-start max-w-[75%] md:max-w-[65%]">
                                        <div className="relative px-4 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            <div className="flex items-end gap-3 max-w-4xl mx-auto">
                                <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 shrink-0">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <div className="flex-1 min-h-[52px] relative bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm flex items-end pr-2 overflow-hidden">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            if (socket && activeChatId) {
                                                socket.emit('typing:start', { appointmentId: activeChatId, userId: user?.id });
                                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                                typingTimeoutRef.current = setTimeout(() => {
                                                    socket.emit('typing:stop', { appointmentId: activeChatId, userId: user?.id });
                                                }, 1000);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Type your message..."
                                        rows={1}
                                        className="w-full py-3.5 pl-4 pr-10 bg-transparent text-slate-800 placeholder:text-slate-400 font-medium resize-none focus:outline-none max-h-32 text-[15px]"
                                    />
                                    <button className="absolute right-2 bottom-[11px] p-1.5 text-slate-400 hover:text-primary-500 transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className={`p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 ${newMessage.trim()
                                        ? 'bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-0.5 shadow-primary-500/25'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                        }`}
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-sm">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner transform rotate-3">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-slate-900 mb-2 tracking-tight">Your Messages</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Connect with your therapists and support groups securely. Select a conversation to start messaging.
                            </p>
                            <button 
                                onClick={() => setIsDiscoveryMode(true)}
                                className="mt-6 w-full py-3 bg-secondary-600 text-white rounded-xl font-bold hover:bg-secondary-700 transition-colors shadow-lg shadow-secondary-500/20"
                            >
                                Discover Support Groups
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
