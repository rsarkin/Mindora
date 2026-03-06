import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Users, MoreVertical, Smile, CheckCheck, Paperclip } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

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

            // Group raw appointments by therapist to avoid duplicates in the direct chat list
            const groupedConvs = res.data.reduce((acc: Record<string, Conversation>, appt: any) => {
                const therapistId = appt.therapistId?._id || appt.therapist?._id;
                // If we haven't seen this therapist yet, OR if this appointment is newer than the stored one
                if (!acc[therapistId] || new Date(appt.createdAt) > new Date(acc[therapistId].updatedAt)) {
                    acc[therapistId] = {
                        _id: appt._id,
                        type: 'direct',
                        participants: [
                            { _id: user?.id || '', name: user?.name || 'Patient', role: 'PATIENT' },
                            { _id: therapistId, name: appt.therapist?.user?.name || appt.therapistId?.userId?.name || 'Unknown Therapist', role: 'THERAPIST' }
                        ],
                        updatedAt: appt.createdAt,
                        lastMessage: { content: `${appt.status} Request`, createdAt: appt.createdAt, sender: therapistId }
                    };
                }
                return acc;
            }, {} as Record<string, Conversation>);

            const mappedConvs = Object.values(groupedConvs) as Conversation[];

            setConversations(mappedConvs);

            if (mappedConvs.length > 0 && !activeChatId) {
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
        <div className="h-[calc(100vh-220px)] w-full max-w-7xl mx-auto flex bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] border border-white/50 overflow-hidden relative z-10">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-100/30 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-sky-100/30 rounded-full blur-[100px] -z-10" />

            {/* Sidebar List */}
            <div className="w-80 md:w-96 flex-shrink-0 bg-white/40 backdrop-blur-md flex flex-col border-r border-white/40 z-20 hidden md:flex relative overflow-hidden">
                <div className="p-8 pb-6 flex-none bg-white/40 backdrop-blur-md z-30">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight">Messages</h1>
                        {isSearchingTherapists ? (
                            <button
                                onClick={() => { setIsSearchingTherapists(false); setTherapistSearchQuery(''); }}
                                className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 px-3 py-1.5 rounded-xl"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsSearchingTherapists(true)}
                                className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                                title="New Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
                            className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400/50 text-sm font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isSearchingTherapists ? (
                            <motion.div
                                key="therapist-search"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute inset-0 overflow-y-auto scrollbar-hide px-4 py-4"
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Verified Professional</h3>
                                <div className="space-y-2">
                                    {allTherapists
                                        .filter(t => (t.userId?.name || '').toLowerCase().includes((therapistSearchQuery || '').toLowerCase()))
                                        .map(therapist => (
                                            <button
                                                key={therapist._id}
                                                onClick={() => handleStartNewChat(therapist.userId._id)}
                                                className="w-full p-4 rounded-3xl transition-all text-left flex items-center gap-4 group hover:bg-white/90 border border-transparent hover:border-white hover:shadow-xl hover:shadow-slate-200/50"
                                            >
                                                <img
                                                    src={therapist.userId?.avatar || `https://ui-avatars.com/api/?name=${therapist.userId?.name}&background=eff6ff&color=3b82f6&size=100`}
                                                    alt={therapist.userId?.name}
                                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors truncate">
                                                        {therapist.userId?.name}
                                                    </h4>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                                                        {therapist.specializations?.[0] || 'Therapist'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    }
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="active-conversations"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute inset-0 overflow-y-auto scrollbar-hide p-4 space-y-8"
                            >
                                <div>
                                    <div className="flex items-center gap-2 px-3 mb-4">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Conversations</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {directChats.filter(c => (getChatName(c) || '').toLowerCase().includes((searchQuery || '').toLowerCase())).map(chat => (
                                            <button
                                                key={chat._id}
                                                onClick={() => setActiveChatId(chat._id)}
                                                className={`w-full p-4 rounded-3xl transition-all text-left flex items-center gap-4 group relative overflow-hidden active:scale-[0.98] ${activeChatId === chat._id
                                                    ? 'bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-1 ring-white'
                                                    : 'hover:bg-white/60 border border-transparent'
                                                    }`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${getChatName(chat)}&background=eff6ff&color=3b82f6&size=100`}
                                                        alt={getChatName(chat)}
                                                        className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-white ring-2 ring-white/50"
                                                    />
                                                    {activeChatId === chat._id && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full border-2 border-white shadow-sm" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className={`font-bold truncate pr-2 ${activeChatId === chat._id ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {getChatName(chat)}
                                                        </h4>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${activeChatId === chat._id ? 'text-primary-400' : 'text-slate-300'}`}>
                                                            {formatTime(chat.updatedAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-xs truncate font-semibold ${activeChatId === chat._id ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {chat.lastMessage?.content || 'No messages yet'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
                {!activeConversation ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-12 bg-white/60 backdrop-blur-xl rounded-[48px] border border-white shadow-2xl shadow-slate-100 max-w-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-indigo-400 to-sky-400" />
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 border border-white text-slate-200 rounded-[32px] mx-auto flex items-center justify-center mb-8 shadow-inner transform rotate-6 scale-110">
                                <Users className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Secure Messaging</h2>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                                Your privacy is our priority. End-to-end encrypted conversations with verified professionals.
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-6 bg-white/60 backdrop-blur-xl border-b border-white/50 flex-none flex items-center justify-between z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${getChatName(activeConversation!)}&background=eff6ff&color=3b82f6`}
                                        alt={getChatName(activeConversation!)}
                                        className="w-14 h-14 rounded-2xl object-cover shadow-sm bg-slate-50 ring-2 ring-white"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none">{getChatName(activeConversation!)}</h3>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Active Now
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 hover:bg-slate-900 border border-white hover:text-white text-slate-400 transition-all shadow-sm active:scale-95">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 scrollbar-hide relative"
                        >
                            <AnimatePresence>
                                {messages.map((message, i) => {
                                    const showName = !message.isOwn && (i === 0 || messages[i - 1].sender?._id !== message.sender?._id);

                                    return (
                                        <motion.div
                                            key={message._id}
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                                                {showName && (
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">
                                                        {message.sender?.name || 'User'}
                                                    </span>
                                                )}

                                                <div className={`relative px-6 py-4 transition-all duration-300 ${message.isOwn
                                                    ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-[28px] rounded-tr-sm shadow-xl shadow-primary-500/10'
                                                    : 'bg-white/90 backdrop-blur-md text-slate-800 rounded-[28px] rounded-tl-sm border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
                                                    }`}>
                                                    <p className={`text-[16px] leading-[1.6] font-semibold whitespace-pre-wrap ${message.isOwn ? 'text-white' : 'text-slate-800'}`}>
                                                        {message.content}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2 px-2">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                    {message.isOwn && (
                                                        message.isRead ? (
                                                            <CheckCheck className="w-3.5 h-3.5 text-primary-500" />
                                                        ) : (
                                                            <CheckCheck className="w-3.5 h-3.5 text-slate-200" />
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
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="relative px-6 py-4 bg-white/80 backdrop-blur-md rounded-[24px] rounded-tl-sm border border-white/50 flex items-center gap-1.5 shadow-sm">
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 sm:p-8 bg-white/40 backdrop-blur-xl border-t border-white/40 flex-none relative z-20">
                            <div className="flex items-end gap-4 max-w-4xl mx-auto">
                                <button className="p-4 bg-white border border-white text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95">
                                    <Paperclip className="w-6 h-6" />
                                </button>

                                <div className="flex-1 relative bg-white/90 border border-white rounded-[24px] focus-within:ring-8 focus-within:ring-primary-500/5 focus-within:border-primary-400/50 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-end pr-2 overflow-hidden">
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
                                        className="w-full py-4 pl-6 pr-12 bg-transparent text-slate-800 placeholder:text-slate-400 font-bold resize-none focus:outline-none max-h-40 text-[16px] leading-[1.6]"
                                    />
                                    <button className="absolute right-3 bottom-[18px] p-2 text-slate-300 hover:text-primary-500 transition-colors">
                                        <Smile className="w-6 h-6" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className={`p-4 rounded-2xl flex items-center justify-center transition-all shadow-xl shrink-0 active:scale-95 mb-1 ${newMessage.trim()
                                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200 shadow-none'
                                        }`}
                                >
                                    <Send className="w-6 h-6 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
