import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1996/api/v1',
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Don't override Content-Type for FormData (let axios set it)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    return config;
});

// Response interceptor to handle errors/logout
api.interceptors.response.use(
    (response) => {
        if (response.data?.success) {
            // Paginated response: return { data: [...], meta: {...} }
            if (response.data.meta) {
                return { data: response.data.data, meta: response.data.meta };
            }
            // Upload response is array directly, don't strip it
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
            return response.data.data;
        }
        return response.data;
    },
    (error) => {
        console.error('API Error:', error); // Debug log
        
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
            }
        }
        
        const message = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع';
        return Promise.reject(new Error(message));
    }
);

export default api;
