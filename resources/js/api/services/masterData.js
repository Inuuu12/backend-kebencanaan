import apiClient from '../client';

export const masterDataService = {
    getBencana: async () => {
        return apiClient.get('/bencana');
    },

    getBoundaries: async () => {
        return apiClient.get('/boundaries');
    },

    getKabupaten: async () => {
        return apiClient.get('/wilayah/kabupaten');
    },

    getKecamatan: async (idKabupaten = null) => {
        return apiClient.get('/wilayah/kecamatan', {
            params: { id_kabupaten: idKabupaten }
        });
    },

    getKelurahan: async (idKecamatan = null) => {
        return apiClient.get('/wilayah/kelurahan', {
            params: { id_kecamatan: idKecamatan }
        });
    }
};
