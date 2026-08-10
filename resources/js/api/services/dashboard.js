import apiClient from '../client';

export const dashboardService = {
    /**
     * Get aggregated summary and stats for the dashboard.
     * Uses the backend endpoint /api/dashboard/summary.
     */
    getSummary: async () => {
        const response = await apiClient.get('/dashboard/summary');
        return response.data;
    }
};
