import apiClient from '../client';

export const notificationService = {
    getAll: async () => {
        return apiClient.get('/notifications');
    }
};
