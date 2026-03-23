import { create } from 'zustand';

interface AdminUser {
    id: number;
    username: string;
    name: string;
}

interface AuthState {
    token: string | null;
    admin: AdminUser | null;
    setAuth: (token: string, admin: AdminUser) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    admin: null,
    
    setAuth: (token, admin) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(admin));
        }
        set({ token, admin });
    },
    
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        set({ token: null, admin: null });
    },
    
    hydrate: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken');
            const adminStr = localStorage.getItem('adminUser');
            
            if (token && adminStr) {
                try {
                    const admin = JSON.parse(adminStr);
                    set({ token, admin });
                } catch (error) {
                    console.error('Failed to parse admin data:', error);
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                }
            }
        }
    },
}));
