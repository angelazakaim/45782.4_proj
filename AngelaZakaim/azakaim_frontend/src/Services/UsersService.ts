// UsersService.ts - UPDATED to match backend API
import axios from "axios";
import { config } from "../Utils/Config";
import type {
    User,
    UserWithProfile,
    UsersResponse,
    CustomersResponse,
    UserStatistics,
    UserFilters,
    ProfileUpdateData,
    UserUpdateData,
    RoleChangeData
} from "../Models/User";
import store from "../Redux/store";
import {
    deleteUserAction,
    fillUsersAction,
    updateUserAction
} from "../Redux/UsersSlice";

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

class UsersService {
    
    private isCacheValid(lastUpdated: number | null): boolean {
        if (!lastUpdated) return false;
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
        return (Date.now() - lastUpdated) < CACHE_DURATION;
    }
    
    /**
     * Get all users (Admin only)
     */
    async getAllUsers(
        page: number = 1,
        per_page: number = 20,
        filters: UserFilters = {}
    ): Promise<UsersResponse> {
        const state = store.getState().userStore as UserState;
        const { users, lastUpdated, pagination } = state;
        
        // Only use cache when there is no active filter — a filter changes what the
        // backend returns, so cached (unfiltered) data must not be served.
        const hasFilter = !!filters.role_filter;

        if (!hasFilter && users.length > 0 && this.isCacheValid(lastUpdated) && pagination.currentPage === page) {
            return {
                users: users,
                total: pagination.total,
                pages: pagination.pages,
                current_page: pagination.currentPage,
                per_page: per_page,
                has_next: page < pagination.pages,
                has_prev: page > 1
            };
        }
        
        // Backend reads the query param as 'role', not 'role_filter'
        const response = await axios.get<UsersResponse>(config.USERS_API_URL, {
            params: {
                page,
                per_page,
                role: filters.role_filter  // maps role_filter → role
            }
        });
        
        // Only cache unfiltered results — filtered pages are ephemeral
        if (!hasFilter) {
            store.dispatch(fillUsersAction(response.data));
        }
        
        return response.data;
    }
    
    /**
     * Get all customers (Manager/Admin)
     */
    async getAllCustomers(page: number = 1, per_page: number = 25): Promise<CustomersResponse> {
        const response = await axios.get<CustomersResponse>(
            config.USERS_API_URL + '/customers',
            {
                params: { page, per_page }
            }
        );
        
        return response.data;
    }
    
    /**
     * Get user by ID with profile (Admin only)
     */
    async getUserById(id: number): Promise<UserWithProfile> {
        const response = await axios.get<UserWithProfile>(`${config.USERS_API_URL}/${id}`);
        return response.data;
    }
    
    /**
     * Get own profile (Any authenticated user)
     */
    async getOwnProfile(): Promise<UserWithProfile> {
        const response = await axios.get<UserWithProfile>(config.USERS_API_URL + '/profile');
        return response.data;
    }
    
    /**
     * Update own profile (Any authenticated user)
     */
    async updateOwnProfile(data: ProfileUpdateData): Promise<{ message: string; user: any; profile: any }> {
        const response = await axios.put<{ message: string; user: any; profile: any }>(
            config.USERS_API_URL + '/profile',
            data
        );
        
        return response.data;
    }
    
    /**
     * Update user account (Admin only)
     */
    async updateUser(id: number, data: UserUpdateData): Promise<{ message: string; user: User }> {
        const response = await axios.put<{ message: string; user: User }>(
            `${config.USERS_API_URL}/${id}`,
            data
        );
        
        const updatedUser = response.data.user;
        store.dispatch(updateUserAction(updatedUser));
        
        return response.data;
    }
    
    /**
     * Delete user (Admin only)
     */
    async deleteUser(id: number): Promise<{ message: string }> {
        const response = await axios.delete<{ message: string }>(`${config.USERS_API_URL}/${id}`);
        
        store.dispatch(deleteUserAction(id));
        
        return response.data;
    }
    
    /**
     * Ban user (Manager/Admin)
     */
    async banUser(id: number): Promise<{ message: string; user: User }> {
        const response = await axios.post<{ message: string; user: User }>(
            `${config.USERS_API_URL}/${id}/ban`
        );
        
        const updatedUser = response.data.user;
        store.dispatch(updateUserAction(updatedUser));
        
        return response.data;
    }
    
    /**
     * Unban user (Manager/Admin)
     */
    async unbanUser(id: number): Promise<{ message: string; user: User }> {
        const response = await axios.post<{ message: string; user: User }>(
            `${config.USERS_API_URL}/${id}/unban`
        );
        
        const updatedUser = response.data.user;
        store.dispatch(updateUserAction(updatedUser));
        
        return response.data;
    }
    
    /**
     * Change user role (Admin only)
     */
    async changeUserRole(id: number, data: RoleChangeData): Promise<{ message: string; user: any; profile: any }> {
        const response = await axios.put<{ message: string; user: any; profile: any }>(
            `${config.USERS_API_URL}/${id}/role`,
            data
        );
        
        return response.data;
    }
    
    /**
     * Reset user password (Admin only)
     */
    async resetPassword(id: number, newPassword: string): Promise<{ message: string; user: User }> {
        const response = await axios.post<{ message: string; user: User }>(
            `${config.USERS_API_URL}/${id}/password-reset`,
            { new_password: newPassword }
        );
        
        return response.data;
    }
    
    /**
     * Get user statistics (Admin only)
     */
    async getUserStatistics(): Promise<UserStatistics> {
        const response = await axios.get<UserStatistics>(config.USERS_API_URL + '/statistics');
        return response.data;
    }
}

export const usersService = new UsersService();