import api from './api';

export interface AuditLogItem {
    _id: string;
    adminId: {
        _id: string;
        name: string;
        email: string;
    };
    action: string;
    targetId: string;
    targetType: string;
    details: string;
    ipAddress: string;
    createdAt: string;
}

export interface AdminStats {
    activePatients: number;
    verifiedTherapists: number;
    sessionsCount: number;
    pendingApprovals: number;
    totalRevenue: number;
}

export interface AdminCharts {
    userGrowth: { _id: string; count: number }[];
    categoryStats: { _id: string; count: number }[];
}

export const adminService = {
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getCharts: async (): Promise<AdminCharts> => {
        const response = await api.get('/admin/charts');
        return response.data;
    },

    getVerificationQueue: async () => {
        const response = await api.get('/admin/queue');
        return response.data;
    },

    verifyTherapist: async (id: string) => {
        const response = await api.post(`/admin/verify/${id}`);
        return response.data;
    },

    rejectTherapist: async (id: string, reason: string) => {
        const response = await api.post(`/admin/reject/${id}`, { reason });
        return response.data;
    },

    getAuditLogs: async (): Promise<AuditLogItem[]> => {
        const response = await api.get('/admin/audit-logs');
        return response.data;
    }
};
