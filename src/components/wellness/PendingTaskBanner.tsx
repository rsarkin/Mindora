import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { WellnessTask } from '../../types/wellness.types';
import { taskService } from '../../services/taskService';
import { useTaskStore } from '../../store/useTaskStore';
import { useToast } from '../../context/ToastContext';

interface PendingTaskBannerProps {
  tasks: WellnessTask[];
}

export const PendingTaskBanner: React.FC<PendingTaskBannerProps> = ({ tasks }) => {
  const [index, setIndex] = useState(0);
  const currentTask = tasks[index];
  const { approvePendingTask, rejectPendingTask } = useTaskStore();
  const { showToast } = useToast();

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await taskService.approveOrReject(currentTask._id, 'approve');
        approvePendingTask(currentTask);
        showToast("Task added to your plan!", "success");
      } else {
        await taskService.approveOrReject(currentTask._id, 'reject');
        rejectPendingTask(currentTask._id);
        showToast("Task removed.", "info");
      }
      
      // Navigate to previous if we're at the end
      if (index >= tasks.length - 1 && index > 0) {
        setIndex(index - 1);
      }
    } catch (err) {
      showToast("Failed to process recommendation", "error");
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="mb-10 bg-white/40 backdrop-blur-md border-2 border-dashed border-indigo-200 rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={120} className="text-indigo-600" />
      </div>

      <div className="flex flex-col lg:row items-center gap-8 relative z-10 lg:flex-row">
        <div className="flex-none text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} />
            AI Recommendations
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight max-w-xs">
            Review these practices
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-2">
            Task {index + 1} of {tasks.length}
          </p>
        </div>

        <div className="flex-1 w-full bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-white min-h-[140px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTask._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="text-xl font-bold text-slate-900 mb-2">{currentTask.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{currentTask.description}</p>
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md">{currentTask.category}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{currentTask.durationMinutes} mins</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{currentTask.frequency}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-row lg:flex-col gap-3 shrink-0">
          <button
            onClick={() => handleAction('approve')}
            className="flex-1 lg:flex-none w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-90"
            title="Approve"
          >
            <Check size={28} />
          </button>
          <button
            onClick={() => handleAction('reject')}
            className="flex-1 lg:flex-none w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all active:scale-90"
            title="Reject"
          >
            <X size={28} />
          </button>
        </div>

        {tasks.length > 1 && (
            <div className="flex lg:flex-col gap-2 shrink-0">
                <button 
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                  className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                  disabled={index === tasks.length - 1}
                  onClick={() => setIndex(index + 1)}
                  className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
