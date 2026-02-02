// Employee.ts - UPDATED to match backend
import type { Address } from './User';

export interface Employee {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone: string | null;
  address: Address;
  employee_id: string | null;
  hire_date: string | null;
  shift_start: string | null;
  shift_end: string | null;
  salary?: number; // Optional - privacy control
  created_at: string;
  updated_at: string;
}