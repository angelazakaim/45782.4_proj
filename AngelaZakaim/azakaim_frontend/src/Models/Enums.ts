// Enums.ts
export interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

// Modern Enum pattern for User Roles
export const UserRole = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  MANAGER: 'manager',
  CASHIER: 'cashier',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];