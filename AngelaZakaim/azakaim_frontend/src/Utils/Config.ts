// Config.ts - Updated to use environment variables
// This allows different API URLs for dev, preview, and production

class Config {
    INTERVAL_TIME = 2000;
}

// Single configuration class that uses environment variables
class AppConfig extends Config {
    /**
     * Get base URL from environment variable or use defaults
     * Priority:
     * 1. VITE_API_BASE_URL environment variable
     * 2. Development default (localhost:5000)
     * 3. Production default (update before deploying!)
     */
    private getBaseUrl(): string {
        // Check for environment variable first
        const envUrl = import.meta.env.VITE_API_BASE_URL;
        
        if (envUrl) {
            return envUrl;
        }
        
        // Development mode default
        if (import.meta.env.DEV) {
            return 'http://localhost:5000';
        }
        
        // Production mode default
        // UPDATE THIS URL BEFORE DEPLOYING TO PRODUCTION!
        // Or set VITE_API_BASE_URL in your deployment platform
        return 'https://your-backend-api.onrender.com';
    }

    BASE_URL = this.getBaseUrl();
    AUTH_API_URL = `${this.BASE_URL}/api/auth`;
    USERS_API_URL = `${this.BASE_URL}/api/users`;
    PRODUCTS_API_URL = `${this.BASE_URL}/api/products`;
    CATEGORIES_API_URL = `${this.BASE_URL}/api/categories`;
    CART_API_URL = `${this.BASE_URL}/api/cart`;
    ORDERS_API_URL = `${this.BASE_URL}/api/orders`;

    constructor() {
        super();
        // Log configuration in development for debugging
        if (import.meta.env.DEV) {
            console.log('🔧 API Configuration:', {
                mode: import.meta.env.MODE,
                baseUrl: this.BASE_URL,
                isDev: import.meta.env.DEV,
                isProd: import.meta.env.PROD
            });
        }
    }
}

export const config = new AppConfig();