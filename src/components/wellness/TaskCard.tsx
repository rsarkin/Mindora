import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Users, Clock, Calendar, MessageSquare, Play, CheckCircle2, Sparkles } from 'lucide-react';
import type { WellnessTask } from '../../types/wellness.types';

interface TaskCardProps {
  task: WellnessTask;
  onMove: (taskId: string, status: WellnessTask['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onMove }) => {
  const Icon = {
    mental: Brain,
    physical: Zap,
    behavioral: Heart,
    social: Users
  }[task.category];

  const categoryColor = {
    mental: 'text-indigo-600 bg-indigo-50',
    physical: 'text-rose-600 bg-rose-50',
    behavioral: 'text-emerald-600 bg-emerald-50',
    social: 'text-amber-600 bg-amber-50'
  }[task.category];

  return (
    <motion.div
      layoutId={task._id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 group hover:shadow-xl transition-all h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${categoryColor}`}>
          <Icon size={20} />
        </div>
        {task.source === 'ai' && (
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1">
            <Sparkles size={10} />
            AI Plan
          </div>
        )}
      </div>

      <h4 className="font-bold text-slate-900 text-lg leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">
        {task.description}
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
          <Clock size={14} />
          {task.durationMinutes}m
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
          <Calendar size={14} />
          {task.frequency}
        </div>
      </div>

      {task.therapistNote && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6 flex items-start gap-3">
          <MessageSquare size={16} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-normal italic">
            "{task.therapistNote}"
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-dashed border-slate-100 mt-auto flex items-center justify-between">
        {task.status === 'todo' && (
          <button 
            onClick={() => onMove(task._id, 'inprogress')}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            <Play size={14} fill="currentColor" />
            Start Practice
          </button>
        )}
        {task.status === 'inprogress' && (
          <button 
            onClick={() => onMove(task._id, 'done')}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
          >
            <CheckCircle2 size={16} />
            Mark Complete
          </button>
        )}
        {task.status === 'done' && (
          <div className="w-full text-center py-2.5 text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            Soul Nourished
          </div>
        )}
      </div>
    </motion.div>
  );
};
