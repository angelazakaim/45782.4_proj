// CategoryDetails.tsx - View category details with products
import "./CategoryDetails.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import categoriesService from "../../../Services/CategoriesService";
import productService from "../../../Services/ProductsService";
import { type Category } from "../../../Models/Category";
import { type Product } from "../../../Models/Product";
import { ProductCard } from "../../ProductsArea/ProductCard/ProductCard";
import { notificationService } from "../../../Services/NotificationService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";


export function CategoryDetails() {
    const canEdit = useHasRole([UserRole.ADMIN, UserRole.MANAGER]);
    
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const categoryId = Number(id);
    
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!isNaN(categoryId) && categoryId > 0) {
            loadCategoryDetails();
        } else {
            notificationService.error("Invalid category ID");
            navigate('/categories');
        }
    }, [categoryId]);

    const loadCategoryDetails = async () => {
        try {
            // Load category
            const cat = await categoriesService.getCategoryById(categoryId);
            setCategory(cat);

            // Load products in this category
            const productsResponse = await productService.getAllProducts(1, 100, {
                category_id: categoryId
            });
            setProducts(productsResponse.products);
        } catch (err: any) {
            notificationService.error("Error loading category details");
            navigate('/categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await categoriesService.deleteCategory(categoryId);
            notificationService.success("Category deleted");
            navigate("/categories");
        } catch (err: any) {
            notificationService.error(err.response?.data?.error || "Failed to delete category");
        }
    };

    if (loading) return <div className="loading">Loading category...</div>;
    if (!category) return <div className="error">Category not found</div>;

    return (
        <div className="CategoryDetails">
            {canEdit && (
                <div className="button-group">
                    <button onClick={() => navigate('/categories')}>Back</button>
                    <button className="edit-btn" onClick={() => navigate(`/categories/edit/${categoryId}`)}>
                        Edit
                    </button>
                    <button className="delete-btn" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            )}

            <header>
                <h2>{category.name}</h2>
                <p className="slug">URL Slug: /{category.slug}</p>
                {!category.is_active && (
                    <span className="badge inactive">Inactive</span>
                )}
            </header>

            <div className="main-content">
                <div className="info-section">
                    <h3>Category Information</h3>
                    <p><strong>Description:</strong> {category.description || "No description provided."}</p>
                    
                    <hr />

                    <h3>Hierarchy</h3>
                    {category.parent_id ? (
                        <p><strong>Parent Category:</strong> Has parent (ID: {category.parent_id})</p>
                    ) : (
                        <p><strong>Level:</strong> Root Category</p>
                    )}
                    
                    {category.children && category.children.length > 0 && (
                        <div>
                            <p><strong>Subcategories:</strong> {category.children.length}</p>
                            <ul className="subcategories-list">
                                {category.children.map(child => (
                                    <li key={child.id}>
                                        <NavLink to={`/categories/details/${child.id}`}>
                                            {child.name}
                                        </NavLink>
                                        {!child.is_active && <span className="badge-small inactive">Inactive</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <hr />

                    <h3>Statistics</h3>
                    <p><strong>Total Products:</strong> {products.length}</p>
                    <p><strong>Active Products:</strong> {products.filter(p => p.is_active).length}</p>
                    
                    <hr />

                    <h3>Metadata</h3>
                    <p><strong>Created:</strong> {new Date(category.created_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(category.updated_at).toLocaleString()}</p>
                </div>
            </div>

            {/* Products in this category */}
            <div className="products-section">
                <div className="section-header">
                    <h3>Products in this Category</h3>
                    {canEdit && (
                        <NavLink to="/products/add" className="btn-add-product">
                            + Add Product
                        </NavLink>
                    )}
                </div>
                
                {products.length === 0 ? (
                    <div className="no-products">
                        <p>No products in this category yet.</p>
                        {canEdit && (
                            <NavLink to="/products/add">Add your first product</NavLink>
                        )}
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}