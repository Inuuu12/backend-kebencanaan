import apiClient from '../client';

export const authService = {
    login: async (credentials) => {
        return apiClient.post('/login', credentials);
    },
    
    register: async (userData) => {
        return apiClient.post('/register', userData);
    },
    
    forgotPassword: async (emailData) => {
        return apiClient.post('/forgot-password', emailData);
    },
    
    me: async () => {
        return apiClient.get('/me');
    },

    // Note: Logout is a backend gap (not implemented in AuthController yet)
    // We handle local cleanup instead for now.
    logout: async () => {
        localStorage.removeItem('sigab_token');
        return { success: true, message: 'Logout berhasil' };
    }
};
