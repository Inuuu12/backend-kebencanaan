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
        return apiClient.post('/admin/news', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    update: async (id, data) => {
        // Laravel needs POST with _method=PUT to handle FormData files properly
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return apiClient.post(`/admin/news/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return apiClient.put(`/admin/news/${id}`, data);
    },

    delete: async (id) => {
        return apiClient.delete(`/admin/news/${id}`);
    }
};
