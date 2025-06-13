import axios from 'axios';

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
    config => {
        // For multipart form data, don't set Content-Type header
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest?.url;

        // Define auth endpoints that should not trigger refresh
        const authEndpoints = [
            '/auth/login',
            '/auth/register', 
            '/auth/signup',
            '/auth/refresh',
            '/users/simple'
        ];

        const isAuthRequest = authEndpoints.some(endpoint => url?.includes(endpoint));

        // Handle 401 errors
        if (status === 401) {
            // If it's an auth request, trigger auth failed immediately
            if (isAuthRequest) {
                authEvents.triggerAuthFailed();
                return Promise.reject(error);
            }

            // For non-auth requests, try to refresh token
            if (!originalRequest._retry) {
                if (isRefreshing) {
                    // If already refreshing, add to queue
                    return new Promise(resolve => {
                        addSubscriber(() => resolve(axiosClient(originalRequest)));
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Try to refresh token
                    await axiosClient.post('/auth/refresh');
                    
                    isRefreshing = false;
                    onRefreshed();

                    // Retry the original request
                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    // If refresh fails, trigger auth failed event
                    authEvents.triggerAuthFailed();
                    return Promise.reject(refreshError);
                }
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

export default axiosClient;