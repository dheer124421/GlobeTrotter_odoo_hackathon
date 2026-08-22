import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if token exists on load
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Fetch current user details from API
                const response = await api.get('/auth/me');
                setUser(response.data.user);
                setIsAuthenticated(true);
            } catch (err) {
                console.error('Auto-auth verification failed', err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Login failed. Please try again.'
            };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/signup', userData);
            const { token, user: newUserData } = response.data;
            localStorage.setItem('token', token);
            setUser(newUserData);
            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.message || 'Signup failed. Please try again.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
