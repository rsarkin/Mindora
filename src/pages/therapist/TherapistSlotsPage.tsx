import { useState, useEffect } from 'react';
import { 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Check, 

    Activity,
    Info,
    CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { format, startOfToday, addDays, subDays, eachHourOfInterval, setHours, setMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const STAGGER_CHILD_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface Slot {
    _id: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'pending' | 'booked';
}

export const TherapistSlotsPage = () => {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const { showToast } = useToast();

    const timeSlots = eachHourOfInterval({
        start: setMinutes(setHours(selectedDate, 8), 0),
        end: setMinutes(setHours(selectedDate, 20), 0)
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/slots/my-slots');
            setSlots(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch slots', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSlot = async (startTime: Date) => {
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        const startTimeStr = startTime.toISOString();

        try {
            setIsProcessing(startTimeStr);
            await api.post('/slots/toggle', {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            });
            await fetchSlots();
            showToast('Availability updated', 'success');
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to update slot', 'error');
        } finally {
            setIsProcessing(null);
        }
    };

    const getSlotStatus = (time: Date) => {
        const found = slots.find(s =>
            new Date(s.startTime).getTime() === time.getTime()
        );
        return found ? found.status : 'off';
    };

    const navigateDate = (direction: 'next' | 'prev') => {
        setSelectedDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    };

    return (
        <div className="relative">
            {/* Atmospheric Backgrounds */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-32 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] -ml-20 pointer-events-none" />

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
                className="max-w-6xl mx-auto space-y-12 relative z-10"
            >
                {/* Header Section */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-sky-400 rounded-full" />
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Availability Planner</h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Fine-tuning your clinical hours {format(selectedDate, 'MMMM yyyy')}.
                        </p>
                    </div>

                    <div className="flex items-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white/60 p-2 shadow-sm">
                        <button
                            onClick={() => navigateDate('prev')}
                            className="p-3 hover:bg-white rounded-[1.5rem] transition-all disabled:opacity-30 disabled:scale-95 border border-transparent hover:border-slate-100"
                            disabled={selectedDate <= startOfToday()}
                        >
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div className="px-6 min-w-[200px] text-center">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">Focus Date</p>
                            <p className="text-lg font-black text-indigo-600 tracking-tight">{format(selectedDate, 'EEEE, MMM d')}</p>
                        </div>
                        <button
                            onClick={() => navigateDate('next')}
                            className="p-3 hover:bg-white rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100"
                        >
                            <ChevronRight className="w-6 h-6 text-slate-600" />
                        </button>
                    </div>
                </motion.div>

                {/* Quick Switch Overlay */}
                <motion.div variants={STAGGER_CHILD_VARIANTS} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Main Interface */}
                    <div className="lg:col-span-8 bg-white rounded-[3rem] p-1 shadow-xl border border-slate-100 overflow-hidden group">
                        <div className="bg-slate-50/50 rounded-[2.75rem] p-8 md:p-10 border border-white">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <Clock className="w-6 h-6 text-indigo-500" />
                                    Hourly Operations
                                </h2>
                                {selectedDate > startOfToday() && (
                                    <button
                                        onClick={() => setSelectedDate(startOfToday())}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 px-4 py-2 hover:bg-indigo-50 rounded-full transition-colors"
                                    >
                                        Jump to Today
                                    </button>
                                )}
                            </div>

                            <AnimatePresence mode='wait'>
                                {isLoading && slots.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="h-28 bg-white/50 border-2 border-slate-50 rounded-[2rem] animate-pulse"></div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                                    >
                                        {timeSlots.map((time) => {
                                            const status = getSlotStatus(time);
                                            const isPast = time < new Date();
                                            const isBusy = isProcessing === time.toISOString();

                                            return (
                                                <button
                                                    key={time.toISOString()}
                                                    onClick={() => !isPast && status !== 'booked' && handleToggleSlot(time)}
                                                    disabled={isPast || status === 'booked' || isBusy}
                                                    className={`
                                                        relative h-28 rounded-[2rem] border-2 transition-all p-6 flex flex-col items-start justify-between group/slot
                                                        ${status === 'available'
                                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                                                            : status === 'booked'
                                                                ? 'bg-slate-900 border-slate-800 text-white'
                                                                : status === 'pending'
                                                                    ? 'bg-amber-100 border-amber-200 text-amber-900'
                                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/30'
                                                        }
                                                        ${isPast ? 'opacity-40 grayscale-[0.5] bg-slate-50 cursor-not-allowed border-slate-100' : ''}
                                                        ${isBusy ? 'animate-pulse' : 'active:translate-y-1 hover:translate-y-[-2px]'}
                                                    `}
                                                >
                                                    <div className="flex w-full items-start justify-between">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                            status === 'available' ? 'text-indigo-200' : 
                                                            status === 'booked' ? 'text-slate-500' :
                                                            status === 'pending' ? 'text-amber-600' :
                                                            'text-slate-400'
                                                        }`}>
                                                            {format(time, 'hh:mm a')}
                                                        </span>
                                                        {status === 'available' && !isBusy && (
                                                            <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                                                                <Check className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                        )}
                                                        {status === 'booked' && (
                                                            <CheckCircle2 className="w-5 h-5 text-indigo-400 opacity-50" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-lg font-black tracking-tight leading-none">
                                                            {status === 'available' ? 'Open' : status === 'booked' ? 'Booked' : status === 'pending' ? 'Pending' : 'Closed'}
                                                        </span>
                                                        <span className={`text-[8px] font-bold uppercase tracking-[0.15em] opacity-60 ${isPast ? 'line-through' : ''}`}>
                                                            {isPast ? 'Expired' : '60m Session'}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
                            <div className="relative z-10 space-y-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Activity className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight leading-tight">Sync Guidelines</h3>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                                        Open slots appear instantly to patients browse. Toggle hours to control your clinic's digital availability.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Legend Status</p>
                                    <div className="grid gap-4">
                                        {[
                                            { label: "Clinic Closed", color: "bg-white", border: "border-slate-800", sub: "Hidden from patients" },
                                            { label: "Available Now", color: "bg-indigo-600", border: "border-indigo-500", sub: "Gated for bookings" },
                                            { label: "Confirmed Seat", color: "bg-slate-900", border: "border-slate-800", sub: "Locked appointment" },
                                            { label: "Booking Pending", color: "bg-amber-100", border: "border-amber-200", sub: "User at checkout" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group/item">
                                                <div className={`w-10 h-10 rounded-xl ${item.color} ${item.border} border-2 shrink-0 group-hover/item:scale-110 transition-transform`} />
                                                <div>
                                                    <p className="text-xs font-black tracking-wide">{item.label}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">{item.sub}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 p-8 flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 mb-1">Clinic Policy</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Changes made here are updated in real-time across the Mindora patient network.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
