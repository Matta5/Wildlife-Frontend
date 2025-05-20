import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

    // Functie om te controleren of de gebruiker is ingelogd
    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            // Gebruik een endpoint om de huidige gebruiker op te halen
            const response = await axiosClient.get('/auth/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            // Als de verificatie faalt, beschouwen we de gebruiker als niet-ingelogd
            setUser(null);
            setIsAuthenticated(false);
            // Optionally clear any auth tokens from localStorage here if you're using them
            localStorage.removeItem("authToken");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Bij het laden van de app, verifieer of de gebruiker is ingelogd
        checkAuthStatus();

        // Luister naar auth errors voor logout
        const listenerId = authEvents.onAuthFailed(() => {
            handleLogout();
            toast.error("Je sessie is verlopen, log opnieuw in");
        });

        return () => {
            authEvents.removeListener(listenerId);
        };
    }, [checkAuthStatus]);

    // Login functie
    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const response = await axiosClient.post('/auth/login', {
                username: credentials.username,
                password: credentials.password
            });

            setUser(response.data.user);
            setIsAuthenticated(true);
            toast.success("Succesvol ingelogd!");
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login mislukt. Probeer het opnieuw.";
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout functie
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await axiosClient.post('/auth/logout', {}, {
                withCredentials: true,
            });

            // Make sure state is updated before navigation
            setUser(null);
            setIsAuthenticated(false);

            // Clear any auth tokens from localStorage
            localStorage.removeItem("authToken");

            toast.info("Je bent uitgelogd");

            // Navigate after state updates
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);

            // Even if the API call fails, we should still clear the local state
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("authToken");

            navigate('/login');
        } finally {
            setIsLoading(false);
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

// Custom hook om de AuthContext gemakkelijk te gebruiken
export const useAuth = () => useContext(AuthContext);