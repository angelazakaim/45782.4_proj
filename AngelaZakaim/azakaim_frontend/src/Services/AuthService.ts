// AuthService.ts
// The request interceptor in axiosConfig.ts handles setting Authorization headers from Redux store
import axios from "axios";
import { config } from "../Utils/Config";
import store from "../Redux/store";
import { loginAction, logoutAction } from "../Redux/AuthSlice";
import { clearCartAction } from "../Redux/CartsSlice";
import type { CredentialsModel, LoginResponse } from "../Models/CredentialsModel";
import type { RegisterData, PasswordChangeData, UserWithProfile } from "../Models/User";

class AuthService {
    
    /**
     * Login user with email/username and password
     */
    async login(creds: CredentialsModel) {
        const response = await axios.post<LoginResponse>(
            config.AUTH_API_URL + '/login',
            creds
        );
        
        const { access_token, refresh_token, user } = response.data;
        
        // Store tokens and user in Redux (+ localStorage via the slice).
        // The axios request interceptor will automatically pick up the new token.
        store.dispatch(loginAction({
            access_token,
            refresh_token,
            user
        }));
        
        return user;
    }
    
    /**
     * Register new user
     */
    async register(data: RegisterData) {
        const response = await axios.post<{ message: string; user: any; profile: any }>(
            config.AUTH_API_URL + '/register',
            data
        );
        
        return response.data;
    }
    
    /**
     * Logout current user.
     * Clears auth state AND the persisted cart — a logged-out session
     * should not retain another user's shopping data.
     */
    logout() {
        store.dispatch(logoutAction());
        store.dispatch(clearCartAction());
    }
    
    /**
     * Change current user's password
     */
    async changePassword(data: PasswordChangeData) {
        const response = await axios.post<{ message: string }>(
            config.AUTH_API_URL + '/change-password',
            data
        );
        
        return response.data;
    }
    
    /**
     * Get current user with profile
     */
    async getCurrentUser(): Promise<UserWithProfile> {
        const response = await axios.get<UserWithProfile>(
            config.AUTH_API_URL + '/me'
        );
        
        return response.data;
    }
    
    /**
     * Refresh access token using the refresh token
     * Updates Redux store with the new access token
     * Returns the new access token so the interceptor can retry the failed request
     */
    async refreshToken(refreshToken: string): Promise<string> {
        const response = await axios.post<{ access_token: string }>(
            config.AUTH_API_URL + '/refresh',
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            }
        );
        
        const { access_token } = response.data;
        
        // Update store with new access token (keeps existing refresh token and user)
        const currentState = store.getState().authStore;
        store.dispatch(loginAction({
            access_token,
            refresh_token: currentState.refresh_token!,
            user: currentState.user!
        }));
        
        return access_token;
    }
}

export const authService = new AuthService();