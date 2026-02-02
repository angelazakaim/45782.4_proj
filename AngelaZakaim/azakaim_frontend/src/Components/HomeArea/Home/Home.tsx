// Home.tsx - Homepage with featured products and category showcases
import  { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import productService from "../../../Services/ProductsService";
import categoriesService from "../../../Services/CategoriesService";
import type { Product } from "../../../Models/Product";
import type { Category } from "../../../Models/Category";
import { ProductCard } from "../../ProductsArea/ProductCard/ProductCard"
import { notificationService } from "../../../Services/NotificationService";
import "./Home.css";

export function Home() {
    const [saleProducts, setSaleProducts] = useState<Product[]>([]);
    const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
    const [homeProducts, setHomeProducts] = useState<Product[]>([]);
    const [electronicsCategory, setElectronicsCategory] = useState<Category | null>(null);
    const [homeCategory, setHomeCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadHomePageData();
    }, []);

    const loadHomePageData = async () => {
        try {
            setLoading(true);

            // 1. Get products on sale (compare_price exists and > price)
            const allProductsResponse = await productService.getAllProducts(1, 100);
            const onSale = allProductsResponse.products.filter(
                p => p.compare_price && p.compare_price > p.price
            );
            setSaleProducts(onSale.slice(0, 6)); // Show first 6 sale items

            // 2. Find Electronics category
            const categories = await categoriesService.getAllCategories();
            const electronics = categories.find(
                c => c.name.toLowerCase().includes('electronic')
            );
            
            if (electronics) {
                setElectronicsCategory(electronics);
                // Get electronics products
                const electronicsResponse = await productService.getAllProducts(1, 10, {
                    category_id: electronics.id
                });
                setElectronicsProducts(electronicsResponse.products);
            }

            // 3. Find Home category
            const home = categories.find(
                c => c.name.toLowerCase().includes('home')
            );
            
            if (home) {
                setHomeCategory(home);
                // Get home products
                const homeResponse = await productService.getAllProducts(1, 10, {
                    category_id: home.id
                });
                setHomeProducts(homeResponse.products);
            }

        } catch (err: any) {
            notificationService.error("Failed to load homepage content");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="Home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to Our Supermarket</h1>
                    <p>Quality products at unbeatable prices</p>
                    <NavLink to="/products" className="hero-btn">
                        Shop Now
                    </NavLink>
                </div>
            </section>

            {/* Special Products on Sale */}
            <section className="sale-section">
                <div className="section-header">
                    <h2>🔥 Special Offers</h2>
                    <NavLink to="/products" className="view-all">View All →</NavLink>
                </div>
                
                {saleProducts.length === 0 ? (
                    <p className="no-products">No products on sale at the moment</p>
                ) : (
                    <div className="products-grid">
                        {saleProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Electronics Category Section */}
            {electronicsCategory && (
                <section className="category-section electronics-section">
                    <div className="section-header">
                        <h2>⚡ {electronicsCategory.name}</h2>
                        <NavLink 
                            to={`/categories/details/${electronicsCategory.id}`} 
                            className="view-all"
                        >
                            View All →
                        </NavLink>
                    </div>
                    
                    {electronicsProducts.length === 0 ? (
                        <p className="no-products">No electronics products available</p>
                    ) : (
                        <div className="products-scroll">
                            <div className="scroll-container">
                                {electronicsProducts.map(product => (
                                    <div key={product.id} className="scroll-item">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Home Category Section */}
            {homeCategory && (
                <section className="category-section home-section">
                    <div className="section-header">
                        <h2>🏠 {homeCategory.name}</h2>
                        <NavLink 
                            to={`/categories/details/${homeCategory.id}`} 
                            className="view-all"
                        >
                            View All →
                        </NavLink>
                    </div>
                    
                    {homeProducts.length === 0 ? (
                        <p className="no-products">No home products available</p>
                    ) : (
                        <div className="products-scroll">
                            <div className="scroll-container">
                                {homeProducts.map(product => (
                                    <div key={product.id} className="scroll-item">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}