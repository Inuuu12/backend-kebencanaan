import apiClient from '../client';

export const newsService = {
    getAll: async () => {
        return apiClient.get('/news');
    },

    getDetail: async (id) => {
        return apiClient.get(`/news/${id}`);
    }
};
