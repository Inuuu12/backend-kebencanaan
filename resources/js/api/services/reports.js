import apiClient from '../client';

export const reportService = {
    submit: async (reportData) => {
        // Karena ada upload file (image), kita gunakan FormData
        return apiClient.post('/reports/submit', reportData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },

    getMyHistory: async () => {
        return apiClient.get('/reports/my-history');
    },

    getMapReports: async (filters = {}) => {
        return apiClient.get('/reports/map', { params: filters });
    },

    getDetail: async (id) => {
        return apiClient.get(`/reports/${id}`);
    }
};
