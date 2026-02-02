// AuthSlice.ts - UPDATED to match backend
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../Models/User";

interface AuthState {
    user: User | null;
    access_token: string | null;
    refresh_token: string | null;
}

const initialState: AuthState = {
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        loginAction(state: AuthState, action: PayloadAction<{ access_token: string; refresh_token: string; user: User }>) {
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.user = action.payload.user;
            
            localStorage.setItem('access_token', state.access_token);
            localStorage.setItem('refresh_token', state.refresh_token);
            localStorage.setItem('user', JSON.stringify(state.user));
        },
        logoutAction(state: AuthState) {
            state.access_token = null;
            state.refresh_token = null;
            state.user = null;
            
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        },
        updateUserAction(state: AuthState, action: PayloadAction<User>) {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(state.user));
        }
    }
});

export const { loginAction, logoutAction, updateUserAction } = authSlice.actions;