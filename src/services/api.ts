import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
});

// Add a request interceptor to attach the toke
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 and other global errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.error("[API] 401 Unauthorized received. The token might be invalid or expired.");
            // We are temporarily disabling automatic blocking to debug the redirect loop.
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');

            // if (!window.location.pathname.includes('/login')) {
            //      window.location.href = '/login/patient';
            // }
        }
        return Promise.reject(error);
    }
);

const api = {
    // Expose axios methods
    get: (url: string, config?: any) => axiosInstance.get(url, config),
    post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
    put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config),
    delete: (url: string, config?: any) => axiosInstance.delete(url, config),
    patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config),

    // Custom Service Methods
    getMoodHistory: async (userId?: string) => {
        const url = userId ? `/mood/history/${userId}` : '/mood/history';
        const response = await axiosInstance.get(url);
        return response.data;
    },

    logMood: async (moodData: { mood: string; note?: string }) => {
        const response = await axiosInstance.post('/mood/log', moodData);
        return response.data;
    },

    bookAppointment: async (appointmentData: any) => {
        const response = await axiosInstance.post('/therapists/book', appointmentData);
        return response.data;
    },

    getAppointments: async () => {
        const response = await axiosInstance.get('/therapists/appointments');
        return response.data;
    },

    verifyPayment: async (data: any) => {
        const response = await axiosInstance.post('/payments/razorpay/verify', data);
        return response.data;
    },

    getNews: async () => {
        const response = await axiosInstance.get('/news');
        return response.data;
    },

    getResources: async () => {
        const response = await axiosInstance.get('/resources');
        return response.data;
    },

    // Session Notes Endpoints
    saveSessionNote: async (appointmentId: string, data: { content: string, status?: string }) => {
        const response = await axiosInstance.post(`/notes/${appointmentId}`, data);
        return response.data;
    },

    getSessionNote: async (appointmentId: string) => {
        const response = await axiosInstance.get(`/notes/${appointmentId}`);
        return response.data;
    },

    getPatientNoteHistory: async (patientId: string) => {
        const response = await axiosInstance.get(`/notes/history/patient/${patientId}`);
        return response.data;
    },

    getAppointmentDetails: async (appointmentId: string) => {
        const response = await axiosInstance.get(`/appointments/${appointmentId}`);
        return response.data;
    },

    // Community Support Endpoints
    getCommunities: async () => {
        const response = await axiosInstance.get(`/communities`);
        return response.data;
    },

    joinCommunity: async (categoryId: string) => {
        const response = await axiosInstance.post(`/communities/${categoryId}/join`);
        return response.data;
    },

    getMyPods: async () => {
        const response = await axiosInstance.get(`/pods/my-pods`);
        return response.data;
    },

    getPodPosts: async (podId: string) => {
        const response = await axiosInstance.get(`/pods/${podId}/posts`);
        return response.data;
    },

    createPodPost: async (podId: string, content: string) => {
        const response = await axiosInstance.post(`/pods/${podId}/posts`, { content });
        return response.data;
    },

    reportPost: async (postId: string, reason: string) => {
        const response = await axiosInstance.post(`/pods/posts/${postId}/report`, { reason });
        return response.data;
    },

    deletePost: async (postId: string) => {
        const response = await axiosInstance.delete(`/pods/posts/${postId}`);
        return response.data;
    },

    banUserFromPod: async (podId: string, targetUserId: string) => {
        const response = await axiosInstance.post(`/pods/${podId}/ban/${targetUserId}`);
        return response.data;
    },

    getTherapistDashboardStats: async () => {
        const response = await axiosInstance.get('/therapists/dashboard/stats');
        return response.data;
    },

    getMyPatients: async () => {
        const response = await axiosInstance.get('/therapists/my-patients');
        return response.data;
    },

    getPatientDetails: async (patientId: string) => {
        const response = await axiosInstance.get(`/therapists/patients/${patientId}`);
        return response.data;
    },

    getEarningsStats: async () => {
        const response = await axiosInstance.get('/therapists/earnings-stats');
        return response.data;
    },

    // User endpoints (Streaks, Notifications)
    getNotifications: async () => {
        const response = await axiosInstance.get('/users/notifications');
        return response.data;
    },

    markNotificationsRead: async () => {
        const response = await axiosInstance.post('/users/notifications/read');
        return response.data;
    },

    updateSignInStreak: async () => {
        const response = await axiosInstance.post('/users/sign-in-streak');
        return response.data;
    },

    getSettings: async () => {
        const response = await axiosInstance.get('/therapists/settings');
        return response.data;
    },

    updateSettings: async (settingsData: any) => {
        const response = await axiosInstance.patch('/therapists/settings', settingsData);
        return response.data;
    },

    changePassword: async (passwordData: any) => {
        const response = await axiosInstance.post('/users/change-password', passwordData);
        return response.data;
    }
};

export default api;
