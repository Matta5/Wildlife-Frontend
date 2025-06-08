import axios from 'axios';

const BASE_URL = 'http://localhost:7186'; // Fixed typo

const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = () => {
    refreshSubscribers.forEach(callback => callback());
    refreshSubscribers = [];
};

const addSubscriber = callback => {
    refreshSubscribers.push(callback);
};

// Auth event system
export const authEvents = {
    listeners: {},

    onAuthFailed: (callback) => {
        const id = Math.random().toString(36).substring(2, 9);
        authEvents.listeners[id] = callback;
        return id;
    },

    removeListener: (id) => {
        delete authEvents.listeners[id];
    },

    triggerAuthFailed: () => {
        Object.values(authEvents.listeners).forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Auth event callback error:', error);
            }
        });
    }
};

// Request interceptor
axiosClient.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest?.url;

        const isAuthRequest =
            url?.includes('/auth/login') ||
            url?.includes('/auth/register') ||
            url?.includes('/auth/refresh');

        // Only refresh token for 401s on non-auth requests
        if (status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                return new Promise(resolve => {
                    addSubscriber(() => resolve(axiosClient(originalRequest)));
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axiosClient.post('/auth/refresh', {}, {
                    withCredentials: true,
                });

                isRefreshing = false;
                onRefreshed();

                return axiosClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                // Trigger auth failed event when refresh fails
                authEvents.triggerAuthFailed();
                return Promise.reject(refreshError);
            }
        }

        // Also trigger auth failed for 401s on auth requests (like /auth/me)
        if (status === 401 && isAuthRequest && url?.includes('/auth/me')) {
            authEvents.triggerAuthFailed();
        }

        return Promise.reject(error);
    }
);

export default axiosClient;