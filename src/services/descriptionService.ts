import api from './api';
import type { ProblemDescription } from '../types/wellness.types';

export const descriptionService = {
  createOrUpdate: async (data: { content: string; triggerAIPlan?: boolean }) => {
    const response = await api.post('/patient/description', data);
    return response.data;
  },

  getActive: async (): Promise<ProblemDescription | null> => {
    const response = await api.get('/patient/description');
    return response.data;
  },

  getHistory: async (): Promise<ProblemDescription[]> => {
    const response = await api.get('/patient/description/history');
    return response.data;
  },

  getPatientDescriptionForTherapist: async (patientId: string): Promise<ProblemDescription | null> => {
    const response = await api.get(`/therapist/patients/${patientId}/description`);
    return response.data;
  },

  regeneratePlan: async () => {
    const response = await api.post('/patient/description/generate-plan');
    return response.data;
  }
};
