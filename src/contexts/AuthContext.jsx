import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../API/axiosClient';
import { toast } from 'react-toastify';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isMountedRef = useRef(true);
    const navigate = useNavigate();

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleLogout = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            if (isAuthenticated) {
                await axiosClient.post('/auth/logout', {});
                setUser(null);
                setIsAuthenticated(false);
                toast.info("You have been logged out");
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            setIsAuthenticated(false);
        }
    }, [navigate, isAuthenticated]);

    const checkAuthStatus = useCallback(async () => {
        if (!isMountedRef.current) return false;

        try {
            const response = await axiosClient.get('/auth/me');
            if (isMountedRef.current) {
                setUser(response.data);
                setIsAuthenticated(true);
                return true;
            }
        } catch (error) {
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
            }
            return false;
        }
    }, []);

    const login = async (credentials) => {
        if (!isMountedRef.current) return false;

        try {
            const response = await axiosClient.post('/auth/login', {
                username: credentials.username,
                password: credentials.password
            });

            if (isMountedRef.current) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
            toast.error(errorMessage);
            return false;
        }
    };

    const signup = async (userData) => {
        if (!isMountedRef.current) return false;

        try {
            // First create the user
            await axiosClient.post('/users/simple', userData);
            
            // Then automatically log in the user
            const loginResponse = await axiosClient.post('/auth/login', {
                username: userData.username,
                password: userData.password
            });

            if (isMountedRef.current) {
                setUser(loginResponse.data.user);
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Sign up failed. Please try again.";
            toast.error(errorMessage);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout: handleLogout,
                checkAuthStatus,
                signup
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);