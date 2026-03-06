import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic, Video, PhoneOff, Upload,
    Lock, MicOff, CameraOff, MonitorUp, Settings, HelpCircle, Expand, Loader2, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { LiveNotesPanel } from '../../components/therapist/LiveNotesPanel';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const SessionPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const [appointment, setAppointment] = useState<any>(null);
    const [isLoadingAppt, setIsLoadingAppt] = useState(true);

    // Fetch appointment data for name and patientId
    useEffect(() => {
        const fetchAppt = async () => {
             if (appointmentId) {
                 try {
                     const data = await api.getAppointmentDetails(appointmentId);
                     setAppointment(data);
                 } catch (err) {
                     console.error("Failed to load appointment details:", err);
                 } finally {
                     setIsLoadingAppt(false);
                 }
             }
        };
        fetchAppt();
    }, [appointmentId]);

    // Mock timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    // Construct Jitsi URL
    const roomName = `mindora-session-${appointmentId || 'demo'}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;

    const handleEndCall = () => {
        if (window.confirm("End the session and save your notes?")) {
            navigate('/therapist/appointments');
        }
    };

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
            className="h-[calc(100vh-100px)] bg-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800 m-6"
        >
            {/* Main Video Area */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex-1 flex flex-col relative h-full">

                {/* Header Overlay */}
                <div className="absolute top-0 w-full px-6 py-4 flex justify-between items-center bg-gradient-to-b from-slate-900/80 to-transparent z-10 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-4">
                        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 border border-slate-700 rounded-xl flex items-center gap-3 shadow-lg">
                            <h2 className="text-white font-bold tracking-wide">
                                Session with {isLoadingAppt ? '...' : (appointment?.patientId?.name || 'Patient')}
                            </h2>
                            <div className="w-px h-4 bg-slate-600"></div>
                            <span className="text-emerald-400 font-mono font-bold flex items-center text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                {formatTime(sessionTime)}
                            </span>
                        </div>
                    </div>

                    <div className="pointer-events-auto">
                        <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1.5 border border-slate-700 rounded-lg flex items-center gap-1.5 text-slate-300 text-xs font-bold uppercase tracking-wider">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            E2E Encrypted
                        </div>
                    </div>
                </div>

                {/* Video Container (Iframe) */}
                <div className="flex-1 bg-black relative">
                    <iframe
                        src={`${jitsiUrl}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=[]`}
                        width="100%"
                        height="100%"
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full h-full border-none absolute inset-0"
                        title="Video Session"
                    ></iframe>
                </div>

                {/* Footer Controls (Custom Application Controls) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 px-8 py-3.5 rounded-2xl flex justify-center items-center gap-3 shadow-2xl z-10 transition-all hover:bg-slate-800">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3.5 rounded-xl transition-all ${isMuted ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-3.5 rounded-xl transition-all ${isVideoOff ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <CameraOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>

                    <div className="w-px h-8 bg-slate-700/50 mx-2"></div>

                    <button className="p-3.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-all" title="Share Screen">
                        <MonitorUp className="w-5 h-5" />
                    </button>

                    <button className="p-3.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-all" title="Settings">
                        <Settings className="w-5 h-5" />
                    </button>

                    <button className="p-3.5 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-all" title="Full Screen">
                        <Expand className="w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-slate-700/50 mx-2"></div>

                    <button
                        onClick={handleEndCall}
                        className="px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
                    >
                        <PhoneOff className="w-5 h-5" /> End Session
                    </button>
                </div>
            </motion.div>

            {/* Right Sidebar - Clinical Tools */}
            <motion.div variants={STAGGER_CHILD_VARIANTS} className="w-full lg:w-[400px] bg-white flex flex-col border-l border-slate-200 z-20">

                {/* Secure Session Notes */}
                {appointmentId && appointment?.patientId?._id ? (
                     <LiveNotesPanel appointmentId={appointmentId} patientId={appointment.patientId._id} />
                ) : (
                     <div className="flex-1 flex flex-col min-h-[50%] items-center justify-center text-slate-400 p-6 border-b border-slate-100 bg-slate-50">
                          {isLoadingAppt ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileText className="w-8 h-8 opacity-20" />}
                          <p className="mt-4 text-sm font-semibold text-center">Loading secure notes panel...</p>
                     </div>
                )}

                {/* Share Resources */}
                <div className="p-6 bg-slate-50/50 flex-1 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-heading font-black text-slate-900">Share Resources</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Send exercises, worksheets, or guides securely to the patient's portal.
                        </p>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex-1 min-h-[160px] flex flex-col items-center justify-center p-6 bg-white hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer group shadow-sm">
                        <div className="w-14 h-14 bg-primary-50 text-primary-600 border border-primary-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 mb-1 group-hover:text-primary-600 transition-colors">Click or drag files here</span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">PDF, DOCX, JPG up to 10MB</span>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <button className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                            <HelpCircle className="w-3.5 h-3.5" /> Need help uploading?
                        </button>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
};
