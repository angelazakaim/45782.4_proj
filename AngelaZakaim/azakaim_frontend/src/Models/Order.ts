// Order.ts
import type { Customer } from './Customer';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  total_items: number;
  shipping_address: {
    line1: string;          // nullable=False
    line2: string | null;   // nullable=True
    city: string;           // nullable=False
    state: string | null;   // nullable=True
    postal_code: string;    // nullable=False
    country: string;        // nullable=False
  };
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items?: OrderItem[];      // Conditional relationship
  customer?: Customer;      // Conditional relationship
}