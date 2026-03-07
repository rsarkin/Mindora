import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { descriptionService } from '../../services/descriptionService';
import { taskService } from '../../services/taskService';
import type { ProblemDescription, WellnessTask, TaskStats } from '../../types/wellness.types';

interface TherapistWellnessContextProps {
  patientId: string;
}

export const TherapistWellnessContext: React.FC<TherapistWellnessContextProps> = ({ patientId }) => {
  const [description, setDescription] = useState<ProblemDescription | null>(null);
  const [tasks, setTasks] = useState<WellnessTask[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskNote, setTaskNote] = useState<{ id: string, text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [desc, taskData] = await Promise.all([
          descriptionService.getPatientDescriptionForTherapist(patientId),
          taskService.getPatientTasksForTherapist(patientId)
        ]);
        setDescription(desc);
        setTasks(taskData.tasks);
        setStats(taskData.stats);
      } catch (err) {
        console.error("Failed to load wellness context", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  const handleAddNote = async (taskId: string) => {
    if (!taskNote || !taskNote.text.trim()) return;
    try {
      await taskService.addTherapistNote(patientId, taskId, taskNote.text);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, therapistNote: taskNote.text } : t));
      setTaskNote(null);
    } catch (err) {
      console.error("Failed to add note", err);
    }
  };

  if (isLoading) return <div className="animate-pulse h-40 bg-slate-50 rounded-3xl" />;

  return (
    <div className="space-y-6">
      {/* Patient's Self-Reported Description */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Brain size={20} />
          </div>
          <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Patient Report (Encrypted)</h3>
        </div>

        {description && description.content ? (
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-100 rounded-full" />
            <p className="text-slate-700 font-medium leading-relaxed italic text-lg px-2">
              "{description.content}"
            </p>
            <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Patient Self-Report • Version {description.version} • {new Date(description.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 italic">No self-reported description available.</p>
        )}
      </div>

      {/* Wellness Tasks Overview */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">Wellness Plan Progress</h3>
          </div>
          {stats && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">{stats.completed}/{stats.total}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks Done</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{task.category} • {task.frequency}</p>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 
                  task.status === 'inprogress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {task.status}
                </div>
              </div>

              {task.therapistNote ? (
                <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-50 text-xs text-slate-600 italic">
                  Note: {task.therapistNote}
                </div>
              ) : (
                <div className="mt-3">
                  {taskNote?.id === task._id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        autoFocus
                        value={taskNote.text}
                        onChange={(e) => setTaskNote({ ...taskNote, text: e.target.value })}
                        placeholder="Add a suggestion..."
                        className="flex-1 text-xs p-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <button 
                        onClick={() => handleAddNote(task._id)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setTaskNote({ id: task._id, text: '' })}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-700"
                    >
                      <MessageSquarePlus size={12} />
                      Leave a note for patient
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {tasks.length === 0 && <p className="text-slate-400 italic text-center py-4">No active wellness tasks.</p>}
        </div>
      </div>
    </div>
  );
};
