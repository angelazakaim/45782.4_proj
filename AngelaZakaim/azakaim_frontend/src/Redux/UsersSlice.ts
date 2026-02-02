// UsersSlice.ts - UPDATED to match backend
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UsersResponse } from "../Models/User";

interface UserState {
    users: User[];
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
    };
    lastUpdated: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
    pagination: { total: 0, pages: 0, currentPage: 1 },
    loading: false,
    error: null,
    lastUpdated: null
};

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        fillUsersAction(state: UserState, action: PayloadAction<UsersResponse>) {
            state.users = action.payload.users;
            state.pagination = {
                total: action.payload.total,
                pages: action.payload.pages,
                currentPage: action.payload.current_page,
            };
            state.lastUpdated = Date.now();
        },

        addNewUserAction(state: UserState, action: PayloadAction<User>) {
            state.users.push(action.payload);
            state.pagination.total += 1;
        },

        deleteUserAction(state: UserState, action: PayloadAction<number>) {
            state.users = state.users.filter(user => user.id !== action.payload);
            state.pagination.total -= 1;
        },

        updateUserAction(state: UserState, action: PayloadAction<User>) {
            const indexToUpdate = state.users.findIndex(user => user.id === action.payload.id);
            if (indexToUpdate >= 0) {
                state.users[indexToUpdate] = action.payload;
            }
        },

        setLoading(state: UserState, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },

        setError(state: UserState, action: PayloadAction<string | null>) {
            state.error = action.payload;
        }
    }
});

export const {
    fillUsersAction,
    addNewUserAction,
    deleteUserAction,
    updateUserAction,
    setLoading,
    setError
} = usersSlice.actions;