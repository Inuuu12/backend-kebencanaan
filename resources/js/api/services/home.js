import apiClient from '../client';

export const homeService = {
    getWeather: async (lat, lng) => {
        return apiClient.get('/weather', {
            params: { lat, lng }
        });
    },

    getEmergencyContacts: async () => {
        return apiClient.get('/emergency-contacts');
    }
};
