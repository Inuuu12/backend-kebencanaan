import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './api/services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('sigab_token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.me();
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            // Token invalid or expired
            localStorage.removeItem('sigab_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        if (response.success && response.data.token) {
            localStorage.setItem('sigab_token', response.data.token);
            setUser(response.data);
            return true;
        }
        return false;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (e) {} // ignore errors
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
