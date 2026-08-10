import axios from 'axios';

// Konfigurasi API Client Terpusat
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
    // Ambil token dari local storage atau context
    const token = localStorage.getItem('sigab_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor & Error Normalization
apiClient.interceptors.response.use(
    (response) => {
        // Common response handling
        return response.data;
    },
    (error) => {
        // API Error Normalization
        let normalizedError = {
            message: 'Terjadi kesalahan pada sistem.',
            status: error.response?.status || 500,
            data: error.response?.data || null,
        };

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    if (error.response.data?.message && error.response.data.message !== 'Unauthenticated.') {
                        normalizedError.message = error.response.data.message;
                    } else {
                        normalizedError.message = 'Sesi Anda telah berakhir, silakan login kembali.';
                    }
                    // Hapus token jika unauthorized
                    localStorage.removeItem('sigab_token');
                    // Idealnya redirect ke login (bisa dikelola di level UI/Inertia)
                    break;
                case 403:
                    normalizedError.message = 'Anda tidak memiliki akses untuk melakukan aksi ini.';
                    break;
                case 404:
                    normalizedError.message = 'Data yang diminta tidak ditemukan.';
                    break;
                case 422:
                    normalizedError.message = error.response.data?.message || 'Validasi gagal, periksa kembali input Anda.';
                    break;
                case 500:
                    normalizedError.message = 'Terjadi gangguan pada server.';
                    break;
                default:
                    normalizedError.message = error.response.data?.message || normalizedError.message;
            }
        } else if (error.request) {
            normalizedError.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        return Promise.reject(normalizedError);
    }
);

export default apiClient;
