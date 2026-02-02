// axiosConfig.ts - Setup axios interceptors for JWT authentication
import axios from "axios";
import store from "../Redux/store";
import { logoutAction } from "../Redux/AuthSlice";
import { authService } from "../Services/AuthService";

/**
 * Setup axios to automatically include JWT token in all requests
 * Call this ONCE when your app starts (in main.tsx or App.tsx)
 */
export function setupAxiosInterceptors() {
    
    // REQUEST INTERCEPTOR - Add token to every request from Redux store
    axios.interceptors.request.use(
        (config) => {
            const state = store.getState().authStore;
            const token = state.access_token;
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // RESPONSE INTERCEPTOR - Handle 401 errors (token expired)
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // If 401 and we haven't tried to refresh yet
            // AND this isn't the refresh endpoint itself (prevents infinite loop)
            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes('/auth/refresh')
            ) {
                originalRequest._retry = true;

                const refreshToken = store.getState().authStore.refresh_token;

                if (refreshToken) {
                    try {
                        // Use AuthService - it handles updating store and headers
                        const newAccessToken = await authService.refreshToken(refreshToken);

                        // Retry the original request with the new token
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed - logout user
                        store.dispatch(logoutAction());
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                } else {
                    // No refresh token available - logout
                    store.dispatch(logoutAction());
                    window.location.href = '/login';
                }
            }

            return Promise.reject(error);
        }
    );
}