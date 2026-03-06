import React, { useState, useEffect, useRef } from 'react';
import { Search, Phone, Video, MoreVertical, Paperclip, Send, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

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

export const MessagesPage: React.FC = () => {
    const { user } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/appointments/therapist');
                // Group raw appointments by patient to avoid duplicates in the direct chat list and match patient's active chat room
                const groupedConvs = res.data.reduce((acc: Record<string, Conversation>, appt: any) => {
                    const patientId = appt.patient?._id || appt.patientId?._id;
                    if (!patientId) return acc;

                    // If we haven't seen this patient yet, OR if this appointment is newer than the stored one
                    if (!acc[patientId] || new Date(appt.createdAt) > new Date(acc[patientId].updatedAt)) {
                        acc[patientId] = {
                            _id: appt._id,
                            type: 'direct',
                            participants: [
                                { _id: user?.id || '', name: user?.name || 'Therapist', role: 'THERAPIST' },
                                { _id: patientId, name: appt.patient?.name || appt.patientId?.name || 'Unknown Patient', role: 'PATIENT' }
                            ],
                            updatedAt: appt.createdAt,
                            lastMessage: { content: `${appt.status} Request`, createdAt: appt.createdAt, sender: patientId }
                        };
                    }
                    return acc;
                }, {} as Record<string, Conversation>);

                const mappedConvs = Object.values(groupedConvs) as Conversation[];
                mappedConvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

                setConversations(mappedConvs);
                if (mappedConvs.length > 0 && !activeChatId) {
                    setActiveChatId(mappedConvs[0]._id);
                }
            } catch (err) {
                console.error('Failed to load appointments/conversations', err);
            }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!activeChatId) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${activeChatId}?limit=50`);
                const loadedMessages = res.data.map((msg: any) => ({
                    ...msg,
                    isOwn: msg.senderId === user?.id,
                    sender: {
                        _id: msg.senderId,
                        name: msg.senderId === user?.id ? 'You' : 'Patient'
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

        if (socket) {
            socket.emit('join:room', activeChatId);
        }

    }, [activeChatId, user?.id]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg: any) => {
            if (msg.appointmentId === activeChatId) {
                const isOwn = msg.senderId === user?.id;
                const formattedMsg: Message = {
                    ...msg,
                    isOwn,
                    sender: { _id: msg.senderId, name: isOwn ? 'You' : 'Patient' }
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
                        name: msg.senderId === user?.id ? 'You' : 'Patient'
                    }
                }));

                if (olderMessages.length < 50) setHasMore(false);

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

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        const content = messageInput.trim();
        setMessageInput('');

        const activeConv = conversations.find(c => c._id === activeChatId);
        const receiver = activeConv?.participants.find(p => p.role === 'PATIENT');

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

    const getChatName = (conv: Conversation) => {
        if (conv.type === 'group') return conv.groupName || 'Group Chat';
        const other = conv.participants.find(p => p._id !== user?.id);
        return other ? other.name : 'Unknown';
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
    const filteredConversations = conversations.filter(c => getChatName(c).toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-100px)] bg-slate-50 gap-6 p-6">
            {/* Sidebar - Chat List */}
            <div className="w-80 bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden shrink-0">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight mb-4">Messages</h2>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map(chat => {
                        const isSelected = activeChatId === chat._id;
                        const name = getChatName(chat);

                        return (
                            <div
                                key={chat._id}
                                onClick={() => setActiveChatId(chat._id)}
                                className={`p-4 mx-2 my-1 rounded-2xl flex items-center cursor-pointer transition-all border ${isSelected
                                    ? 'bg-primary-50/50 border-primary-100 opacity-100'
                                    : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100 opacity-80 hover:opacity-100'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=${name}&background=eff6ff&color=3b82f6`} alt={name} className="w-12 h-12 rounded-2xl shadow-sm border border-slate-100 object-cover" />
                                </div>

                                <div className="ml-3 flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-primary-900' : 'text-slate-900'}`}>{name}</h3>
                                        <span className={`text-[10px] font-bold ${isSelected ? 'text-primary-600' : 'text-slate-400'}`}>{formatTime(chat.updatedAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <p className={`text-xs truncate text-slate-500 font-medium`}>{chat.lastMessage?.content || 'No messages yet'}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm font-bold">No chats found.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                {activeConversation ? (
                    <>
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 sticky top-0">
                            <div className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <img src={`https://ui-avatars.com/api/?name=${getChatName(activeConversation)}&background=eff6ff&color=3b82f6`} alt="Avatar" className="w-11 h-11 rounded-2xl shadow-sm border border-slate-100" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-heading font-black text-slate-900 group-hover:text-primary-600 transition-colors">{getChatName(activeConversation)}</h2>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        Active
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm shadow-transparent hover:shadow-indigo-500/10">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar relative"
                        >
                            <div className="flex justify-center mb-8">
                                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> End-to-end encrypted connection
                                </span>
                            </div>

                            <AnimatePresence initial={false}>
                                {messages.map((msg, index) => {
                                    const isMe = msg.isOwn;
                                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender?._id !== msg.sender?._id);

                                    return (
                                        <motion.div
                                            key={msg._id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            {!isMe && showAvatar && (
                                                <img src={`https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}&background=eff6ff&color=3b82f6`} alt="Avatar" className="w-8 h-8 rounded-xl shrink-0 mr-3 self-end mb-1 border border-slate-200" />
                                            )}
                                            {!isMe && !showAvatar && <div className="w-11"></div>}

                                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {msg.content && (
                                                    <div className={`px-5 py-3.5 rounded-[20px] text-[15px] font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${isMe
                                                        ? 'bg-slate-900 text-white rounded-br-sm'
                                                        : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)]'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                                        {formatTime(msg.createdAt)}
                                                    </span>
                                                    {isMe && (
                                                        msg.isRead ? (
                                                            <CheckCheck className="text-blue-500 w-4 h-4" />
                                                        ) : (
                                                            <CheckCheck className="text-slate-300 w-4 h-4" />
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
                                    <div className="w-11 mr-3 md:mr-0 shrink-0"></div>
                                    <div className="flex flex-col items-start max-w-[70%]">
                                        <div className="relative px-5 py-3.5 shadow-[0_4px_15px_rgb(0,0,0,0.02)] bg-white text-slate-800 rounded-[20px] rounded-bl-sm border border-slate-100 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 z-10 w-full relative">
                            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-3 max-w-4xl mx-auto">
                                <button type="button" className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors shrink-0 mb-0.5">
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <div className="flex-1 relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
                                    <textarea
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400 px-4 py-3.5 min-h-[50px] max-h-32 resize-none custom-scrollbar"
                                        placeholder="Type a secure message..."
                                        value={messageInput}
                                        onChange={(e) => {
                                            setMessageInput(e.target.value);
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
                                        rows={1}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className={`p-3.5 rounded-xl transition-all shrink-0 mb-0.5 flex items-center justify-center ${messageInput.trim()
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-sm">
                            <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner transform rotate-3">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-slate-900 mb-2 tracking-tight">Your Messages</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Connect with your patients securely. Select a conversation to start messaging.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
