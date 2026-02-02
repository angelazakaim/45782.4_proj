// Product.ts -
import { config } from "../Utils/Config";
import type { Category } from "./Category";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  discount_percentage: number;
  sku: string;
  barcode: string | null;
  stock_quantity: number;
  is_in_stock: boolean;
  category_id: number;
  weight: number | null;
  dimensions: string | null;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

/**
 * Normalizes product image URLs by prepending the backend base URL 
 * if the path is relative (starts with /static).
 * The backend now handles default images, so we just need to format the URL.
 */
export function formatProductImage(url: string | null | undefined): string {
    // Backend sends default image path if none exists, so just check if it's relative
    if (!url) return config.BASE_URL + '/static/images/product-placeholder.png';
    
    // If it's a relative path from the backend, prepend the Base URL
    if (url.startsWith('/static')) {
        return config.BASE_URL + url;
    }
    
    // Otherwise return as-is (external URL)
    return url;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  price: number;
  compare_price?: number | null;
  sku: string;
  stock_quantity?: number;
  category_id: number;
  weight?: number | null;
  dimensions?: string | null;
  image_url?: string | null;
  images?: string[];
}

export interface ProductUpdate extends Partial<ProductCreate> {}

export interface ProductsResponse {
    products: Product[];
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
}

// Search types
export type SearchType = 'name' | 'id' | 'sku' | 'slug' | 'barcode' | 'category_id';

export interface ProductFilters {
    search_type?: SearchType;
    search_value?: string | number;
    category_id?: number;
    is_featured?: boolean;
    is_active?: boolean;
}