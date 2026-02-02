// ProductsService.ts
import axios from "axios";
import type { Product, ProductsResponse, ProductFilters, SearchType } from "../Models/Product";
import type { Category } from "../Models/Category";
import { config } from "../Utils/Config";

class ProductsService {
    /**
     * UNIFIED: Get all products with flexible search options
     */
    async getAllProducts(
        page: number = 1, 
        per_page: number = 20, 
        filters: ProductFilters = {}
    ): Promise<ProductsResponse> {
        const response = await axios.get<ProductsResponse>(config.PRODUCTS_API_URL, {
            params: { page, per_page, ...filters }
        });
        
        return response.data;
    }

    /**
     * Convenience method for searching by a specific field
     */
    async searchProducts(
        searchType: SearchType,
        searchValue: string | number,
        page: number = 1,
        per_page: number = 20
    ): Promise<ProductsResponse> {
        const filters: ProductFilters = {
            search_type: searchType,
            search_value: searchValue
        };
        
        return this.getAllProducts(page, per_page, filters);
    }

    /** Get single product by ID */
    async getOneProduct(id: number): Promise<Product> {
        // validateStatus: () => true makes axios RESOLVE for every HTTP status
        // instead of rejecting on 4xx/5xx.  This bypasses any global response
        // interceptor that would otherwise navigate away before the caller can
        // handle the error.  We check the status manually below.
        const response = await axios.get<any>(config.PRODUCTS_API_URL, {
            params: { page: 1, per_page: 1, search_type: 'id', search_value: id },
            validateStatus: () => true
        });

        if (response.status !== 200) {
            const serverMsg = response.data?.error || response.statusText || `HTTP ${response.status}`;
            throw new Error(serverMsg);
        }

        const products = response.data?.products;
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error(`Product with ID ${id} not found`);
        }

        return products[0];
    }

    /** Get product by SKU */
    async getProductBySku(sku: string): Promise<Product> {
        const response = await this.searchProducts('sku', sku, 1, 1);
        
        if (response.products.length === 0) {
            throw new Error(`Product with SKU ${sku} not found`);
        }
        
        return response.products[0];
    }

    /** Get product by slug */
    async getProductBySlug(slug: string): Promise<Product> {
        const response = await this.searchProducts('slug', slug, 1, 1);
        
        if (response.products.length === 0) {
            throw new Error(`Product with slug ${slug} not found`);
        }
        
        return response.products[0];
    }

    /** Get product by barcode */
    async getProductByBarcode(barcode: string): Promise<Product> {
        const response = await this.searchProducts('barcode', barcode, 1, 1);
        
        if (response.products.length === 0) {
            throw new Error(`Product with barcode ${barcode} not found`);
        }
        
        return response.products[0];
    }
    /**
     * Upload a product image to the server.
     *
     * The file is sent as multipart/form-data (axios sets the Content-Type
     * header automatically when the body is a FormData instance).
     *
     * @param file  – the File object from an <input type="file">
     * @returns     – the public URL, e.g. "/static/uploads/products/abc123.jpg"
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<{ url: string }>(
            config.PRODUCTS_API_URL + '/upload-image',
            formData
        );
        return response.data.url;
    }

    async addNewProduct(product: Product): Promise<Product> {
        console.log(2);
        const response = await axios.post<Product>(config.PRODUCTS_API_URL + "/add", product);
        return response.data;
    }

    async getAllCategories(): Promise<Category[]> {
        const response = await axios.get<Category[]>(config.CATEGORIES_API_URL);
        return response.data;
    }

    async updateProduct(id: number, product: Product): Promise<Product> {
        const response = await axios.put<Product>(`${config.PRODUCTS_API_URL}/${id}`, product);
        return response.data;
    }

    async deleteProduct(id: number): Promise<void> {
        await axios.delete(config.PRODUCTS_API_URL + "/" + id);
    }
}

const productService = new ProductsService();
export default productService;