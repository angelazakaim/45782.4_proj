// Cart.ts
import type { Product } from "./Product";

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product | null; // Product relationship could be null if deleted
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  customer_id: number;
  total_items: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  items?: CartItem[]; // Conditional based on include_items flag
}