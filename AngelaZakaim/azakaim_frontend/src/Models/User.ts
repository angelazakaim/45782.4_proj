// User.ts - UPDATED to match backend
import type { Customer } from "./Customer";
import type { Employee } from "./Employee";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string; // 'admin' | 'customer' | 'manager' | 'cashier'
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  user: User;
  profile: Customer | Employee | null;
}

export interface UsersResponse {
  users: User[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface EmployeesResponse {
  employees: User[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CustomersResponse {
  customers: CustomerWithUser[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CustomerWithUser {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone: string | null;
  address: Address;
  created_at: string;
  updated_at: string;
  user: User;
}

export interface UserStatistics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  by_role: {
    customers: number;
    managers: number;
    cashiers: number;
    admins: number;
  };
}

export interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

export interface UserFilters {
  role_filter?: string;
}

// Registration/Update interfaces
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  employee_id?: string;
  hire_date?: string;
  salary?: number;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface UserUpdateData {
  email?: string;
  username?: string;
  is_active?: boolean;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

export interface RoleChangeData {
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  employee_id?: string;
  salary?: number;
}

// Legacy form interface for old components
export interface LegacyUserFormData {
  id?: number;
  email?: string;
  username?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
}