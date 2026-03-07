import api from './api';
import type { WellnessTask, TaskStatus, TaskStats } from '../types/wellness.types';

export const taskService = {
  getTasks: async (filters?: { status?: TaskStatus; category?: string }): Promise<WellnessTask[]> => {
    const response = await api.get('/patient/tasks', { params: filters });
    return response.data;
  },

  createTask: async (data: Partial<WellnessTask>): Promise<WellnessTask> => {
    const response = await api.post('/patient/tasks', data);
    return response.data;
  },

  updateStatus: async (taskId: string, status: TaskStatus): Promise<WellnessTask> => {
    const response = await api.patch(`/patient/tasks/${taskId}/status`, { status });
    return response.data;
  },

  approveOrReject: async (taskId: string, action: 'approve' | 'reject'): Promise<WellnessTask> => {
    const response = await api.patch(`/patient/tasks/${taskId}/approve`, { action });
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/patient/tasks/${taskId}`);
    return response.data;
  },

  getPatientTasksForTherapist: async (patientId: string): Promise<{ tasks: WellnessTask[]; stats: TaskStats }> => {
    const response = await api.get(`/therapist/patients/${patientId}/tasks`);
    return response.data;
  },

  addTherapistNote: async (patientId: string, taskId: string, note: string): Promise<WellnessTask> => {
    const response = await api.patch(`/therapist/patients/${patientId}/tasks/${taskId}/note`, { note });
    return response.data;
  },

  updatePreferences: async (preferences: { aiTaskApproval: 'auto' | 'review' }) => {
    const response = await api.patch('/patient/preferences', preferences);
    return response.data;
  }
};
