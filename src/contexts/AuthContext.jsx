import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient, { authEvents } from '../API/axiosClient';
import { toast } from 'react-toastify';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
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
                if (showToast) {
                    toast.info("Je bent uitgelogd");
                }
                navigate('/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
                navigate('/login');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [navigate]);

    const checkAuthStatus = useCallback(async () => {
        if (!isMountedRef.current) return;

        setIsLoading(true);
        try {
            const response = await axiosClient.get('/auth/me');
            if (isMountedRef.current) {
                setUser(response.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            if (isMountedRef.current) {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    // Call once on mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Attach auth failed listener immediately on mount (not dependent on auth status)
    useEffect(() => {
        const listenerId = authEvents.onAuthFailed(() => {
            if (isMountedRef.current) {
                handleLogout(false); // Don't show regular logout toast
                toast.error("Je sessie is verlopen, log opnieuw in");
            }
        });

        return () => {
            authEvents.removeListener(listenerId);
        };
    }, [handleLogout]); // Only depend on handleLogout

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
                toast.success("Succesvol ingelogd!");
            }

            return true;
        } catch (error) {
            if (isMountedRef.current) {
                const errorMessage = error.response?.data?.message || "Login mislukt. Probeer het opnieuw.";
                toast.error(errorMessage);
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