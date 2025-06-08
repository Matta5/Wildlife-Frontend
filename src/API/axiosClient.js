// api/axiosClient.js
import axios from 'axios';

// Basis API URL
const BASE_URL = 'http://localhost:7186';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
// Queue voor requests die wachten op een token refresh
let refreshSubscribers = [];

// Functie om subscribers te notificeren zodra het token is ververst
const onRefreshed = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
};

// Functie om een nieuwe subscriber toe te voegen tijdens token refresh
const addSubscriber = callback => {
    refreshSubscribers.push(callback);
};

// Event voor authenticatieproblemen
export const authEvents = {
    listeners: {},

    // Event wanneer authenticatie mislukt
    onAuthFailed: (callback) => {
        const id = Math.random().toString(36).substring(2, 9);
        authEvents.listeners[id] = callback;
        return id;
    },

    // Verwijder een listener
    removeListener: (id) => {
        delete authEvents.listeners[id];
    },

    // Trigger alle auth error listeners
    triggerAuthFailed: () => {
        Object.values(authEvents.listeners).forEach(callback => callback());
    }
};

// Request interceptor
axiosClient.interceptors.request.use(
    async config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;

        // Als we een 401 krijgen en het is geen retry van de refresh token endpoint
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            if (isRefreshing) {
                // Als al een refresh bezig is, voeg deze request toe aan de wachtrij
                return new Promise(resolve => {
                    addSubscriber(() => {
                        resolve(axiosClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Refresh token proberen
                await axiosClient.post('/auth/refresh', {}, {
                    withCredentials: true,
                }

                );

                // Token is ververst, alle wachtende requests uitvoeren
                onRefreshed();
                isRefreshing = false;

                // Originele request opnieuw uitvoeren
                return axiosClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;

                // Trigger auth error event voor de app
                authEvents.triggerAuthFailed();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;