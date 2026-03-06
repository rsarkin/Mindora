import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { format, startOfToday, addDays, subDays, eachHourOfInterval, setHours, setMinutes } from 'date-fns';

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
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Availability Planner</h1>
                    <p className="text-slate-600">Quickly toggle your available hours for patients</p>
                </div>

                <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                    <button
                        onClick={() => navigateDate('prev')}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                        disabled={selectedDate <= startOfToday()}
                    >
                        <ChevronLeft className={`w-5 h-5 ${selectedDate <= startOfToday() ? 'text-slate-300' : 'text-slate-600'}`} />
                    </button>
                    <div className="px-4 font-medium text-slate-700 min-w-[160px] text-center">
                        {format(selectedDate, 'EEEE, MMM d')}
                    </div>
                    <button
                        onClick={() => navigateDate('next')}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                        onClick={() => setSelectedDate(startOfToday())}
                        className="ml-2 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/5 rounded-md transition-colors"
                    >
                        Today
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Hourly Slots
                    </h2>
                </div>

                <div className="p-6">
                    {isLoading && slots.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {timeSlots.map((time) => {
                                const status = getSlotStatus(time);
                                const isPast = time < new Date();
                                const isBusy = isProcessing === time.toISOString();

                                return (
                                    <button
                                        key={time.toISOString()}
                                        onClick={() => !isPast && status !== 'booked' && handleToggleSlot(time)}
                                        disabled={isPast || status === 'booked' || isBusy}
                                        className={`relative group p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2
                                            ${status === 'available'
                                                ? 'bg-green-50 border-green-200 text-green-700 hover:border-green-300'
                                                : status === 'booked'
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed'
                                                    : status === 'pending'
                                                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }
                                            ${isPast ? 'opacity-40 grayscale cursor-not-allowed' : ''}
                                            ${isBusy ? 'animate-pulse' : ''}
                                        `}
                                    >
                                        <span className="text-lg font-bold">
                                            {format(time, 'h:mm a')}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">
                                            {status === 'available' ? 'Available' : status === 'booked' ? 'Confirmed' : status === 'pending' ? 'Pending' : 'Closed'}
                                        </span>

                                        {status === 'available' && (
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-green-500 text-white p-0.5 rounded-full ring-4 ring-white">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-white border border-slate-200 mr-2"></div>
                        Closed
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        Available
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        Booked
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                        Pending (Checkout)
                    </div>
                </div>
            </div>
        </div>
    );
};
