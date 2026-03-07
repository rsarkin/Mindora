import { create } from 'zustand';
import type { WellnessTask, ProblemDescription, TaskStatus } from '../types/wellness.types';

interface TaskStore {
  tasks: WellnessTask[];                   // only approvalStatus === 'approved'
  pendingTasks: WellnessTask[];            // only approvalStatus === 'pending'
  description: ProblemDescription | null;
  isGeneratingPlan: boolean;
  
  setTasks: (tasks: WellnessTask[]) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  addTask: (task: WellnessTask) => void;
  removeTask: (taskId: string) => void;
  approvePendingTask: (task: WellnessTask) => void;
  rejectPendingTask: (taskId: string) => void;
  setDescription: (desc: ProblemDescription | null) => void;
  setIsGeneratingPlan: (val: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  pendingTasks: [],
  description: null,
  isGeneratingPlan: false,

  setTasks: (allTasks) => {
    const tasks = allTasks.filter(t => t.approvalStatus === 'approved');
    const pendingTasks = allTasks.filter(t => t.approvalStatus === 'pending');
    set({ tasks, pendingTasks });
  },

  moveTask: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => 
      t._id === taskId ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : t.completedAt } : t
    )
  })),

  addTask: (task) => set((state) => {
    if (task.approvalStatus === 'pending') {
      return { pendingTasks: [task, ...state.pendingTasks] };
    }
    return { tasks: [task, ...state.tasks] };
  }),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t._id !== taskId),
    pendingTasks: state.pendingTasks.filter(t => t._id !== taskId)
  })),

  approvePendingTask: (task) => set((state) => ({
    pendingTasks: state.pendingTasks.filter(t => t._id !== task._id),
    tasks: [{ ...task, approvalStatus: 'approved' as const }, ...state.tasks]
  })),

  rejectPendingTask: (taskId) => set((state) => ({
    pendingTasks: state.pendingTasks.filter(t => t._id !== taskId)
  })),

  setDescription: (description) => set({ description }),
  setIsGeneratingPlan: (isGeneratingPlan) => set({ isGeneratingPlan })
}));
