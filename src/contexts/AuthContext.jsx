import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { authEvents } from '../API/axiosClient';
import { useToast } from './ToastContext';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const navigate = useNavigate();
    const { showInfo, showError } = useToast();
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleLogout = useCallback(async (showToast = true) => {
        if (!isMountedRef.current) return;

        setIsLoading(true);
        try {
            await axiosClient.post('/auth/logout', {});
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
                setHasCheckedAuth(true);
                if (showToast) {
                    showInfo("Je bent uitgelogd");
                }
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
                setHasCheckedAuth(true);
                navigate('/login');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [navigate, showInfo]);

    const checkAuthStatus = useCallback(async () => {
        if (!isMountedRef.current || hasCheckedAuth) return;

        setIsLoading(true);
        try {
            const response = await axiosClient.get('/auth/me');
            if (isMountedRef.current) {
                setUser(response.data);
                setIsAuthenticated(true);
                setHasCheckedAuth(true);
            }
        } catch (error) {
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
                setHasCheckedAuth(true);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [hasCheckedAuth]);

    // Call once on mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Attach auth failed listener immediately on mount (not dependent on auth status)
    useEffect(() => {
        const listenerId = authEvents.onAuthFailed(() => {
            if (isMountedRef.current) {
                handleLogout(false); // Don't show regular logout toast
                showError("Je sessie is verlopen, log opnieuw in");
            }
        });

        return () => {
            authEvents.removeListener(listenerId);
        };
    }, [handleLogout, showError]); // Only depend on handleLogout and showError

    const login = async (credentials) => {
        if (!isMountedRef.current) return false;

        setIsLoading(true);
        try {
            const response = await axiosClient.post('/auth/login', {
                username: credentials.username,
                password: credentials.password
            });

            if (isMountedRef.current) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                setHasCheckedAuth(true);
            }

            return true;
        } catch (error) {
            if (isMountedRef.current) {
                const errorMessage = error.response?.data?.message || "Login mislukt. Probeer het opnieuw.";
                showError(errorMessage);
            }
            return false;
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout: handleLogout,
                checkAuthStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);