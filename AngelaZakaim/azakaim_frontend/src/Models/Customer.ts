// Customer.ts - UPDATED to match backend
import type { Address } from "./User";

export interface Customer {
  id: number;
  user_id: number;
  email?: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  phone: string | null;
  address: Address;
  created_at: string;
  updated_at: string;
}