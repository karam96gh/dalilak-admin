import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:1996/api/v1',
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle errors/logout
api.interceptors.response.use(
    (response) => {
        // Our API strictly uses `data.data` pattern via ApiResponse wrapper
        if (response.data?.success) {
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error.response?.data?.message || 'حدث خطأ غير متوقع');
    }
);

export default api;
