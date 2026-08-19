import apiClient from '../client';

export const newsService = {
    getAll: async () => {
        return apiClient.get('/news');
    },

    getDetail: async (id) => {
        return apiClient.get(`/news/${id}`);
    },

    scrapeUrl: async (url) => {
        return apiClient.post('/admin/news/scrape', { url });
    },

    create: async (data) => {
        return apiClient.post('/admin/news', data);
    }
};
