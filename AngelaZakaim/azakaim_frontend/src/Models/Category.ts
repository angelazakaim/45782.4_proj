// Category.ts - TypeScript model for categories
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  products_count?: number;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface CategoryUpdate extends Partial<CategoryCreate> {}

export interface CategoriesResponse {
  categories: Category[];
}