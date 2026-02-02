// CategoriesService.ts - API service for categories
import axios from "axios";
import type { Category, CategoryCreate, CategoryUpdate, CategoriesResponse } from "../Models/Category";
import { config } from "../Utils/Config";

class CategoriesService {
    /**
     * Get all categories
     */
    async getAllCategories(parentOnly: boolean = false): Promise<Category[]> {
        const response = await axios.get<CategoriesResponse>(config.CATEGORIES_API_URL, {
            params: { parent_only: parentOnly }
        });
        return response.data.categories;
    }

    /**
     * Get single category by ID
     */
    async getCategoryById(id: number): Promise<Category> {
        const response = await axios.get<Category>(`${config.CATEGORIES_API_URL}/${id}`);
        return response.data;
    }

    /**
     * Get category by slug
     */
    async getCategoryBySlug(slug: string): Promise<Category> {
        const response = await axios.get<Category>(`${config.CATEGORIES_API_URL}/slug/${slug}`);
        return response.data;
    }

    /**
     * Create new category (Admin only)
     */
    async createCategory(category: CategoryCreate): Promise<Category> {
        const response = await axios.post<{ message: string; category: Category }>(
            config.CATEGORIES_API_URL,
            category
        );
        return response.data.category;
    }

    /**
     * Create subcategory under parent (Manager/Admin)
     */
    async createSubcategory(parentId: number, category: CategoryCreate): Promise<Category> {
        const response = await axios.post<{ message: string; category: Category }>(
            `${config.CATEGORIES_API_URL}/${parentId}/subcategory`,
            category
        );
        return response.data.category;
    }

    /**
     * Update category (Manager/Admin)
     */
    async updateCategory(id: number, category: CategoryUpdate): Promise<Category> {
        const response = await axios.put<{ message: string; category: Category }>(
            `${config.CATEGORIES_API_URL}/${id}`,
            category
        );
        return response.data.category;
    }

    /**
     * Delete category (Admin only)
     */
    async deleteCategory(id: number): Promise<void> {
        await axios.delete(`${config.CATEGORIES_API_URL}/${id}`);
    }

    /**
     * Get only root categories (no parent)
     */
    async getRootCategories(): Promise<Category[]> {
        return this.getAllCategories(true);
    }

    /**
     * Build category tree from flat list
     */
    buildCategoryTree(categories: Category[]): Category[] {
        const categoryMap = new Map<number, Category>();
        const rootCategories: Category[] = [];

        // First pass: create map
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Second pass: build tree
        categories.forEach(cat => {
            const category = categoryMap.get(cat.id)!;
            
            if (cat.parent_id === null) {
                rootCategories.push(category);
            } else {
                const parent = categoryMap.get(cat.parent_id);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(category);
                }
            }
        });

        return rootCategories;
    }
}

const categoriesService = new CategoriesService();
export default categoriesService;