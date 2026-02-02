// CategoryCard.tsx - Individual category card component

import {  NavLink } from "react-router-dom";
import { type Category } from "../../../Models/Category";
import "./CategoryCard.css";

interface CategoryCardProps {
    category: Category;
    // onDelete: (id: number) => void;
    isTreeView?: boolean;
}

export function CategoryCard({ category, isTreeView = false }: CategoryCardProps) {
    // const handleDelete = (e: React.MouseEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     onDelete(category.id);
    // };

    const childrenCount = category.children?.length || 0;
    const productsCount = category.products_count || 0;

    return (
        <NavLink to={'/categories/details/' + category.id}>
            <div className={`CategoryCard ${isTreeView ? 'tree-view' : ''}`}>
                <div className="category-header">
                    <h3>
                        {/* <NavLink to={`/categories/details/${category.id}`}> */}
                            {category.name}
                        {/* </NavLink> */}
                    </h3>
                    {!category.is_active && (
                        <span className="badge inactive">Inactive</span>
                    )}
                    {category.parent_id && (
                        <span className="badge subcategory">Subcategory</span>
                    )}
                </div>

                {category.description && (
                    <p className="category-description">{category.description}</p>
                )}

                <div className="category-stats">
                    <div className="stat">
                        <span className="stat-icon">📦</span>
                        <span className="stat-value">{productsCount}</span>
                        <span className="stat-label">Products</span>
                    </div>

                    {childrenCount > 0 && (
                        <div className="stat">
                            <span className="stat-icon">📂</span>
                            <span className="stat-value">{childrenCount}</span>
                            <span className="stat-label">Subcategories</span>
                        </div>
                    )}
                </div>

                <div className="category-meta">
                    <span className="slug">/{category.slug}</span>
                    <span className="date">
                        Created: {new Date(category.created_at).toLocaleDateString()}
                    </span>
                </div>

                {/* <div className="category-actions">
                <NavLink 
                    to={`/categories/details/${category.id}`} 
                    className="btn-view"
                >
                    View
                </NavLink>
                <NavLink 
                    to={`/categories/edit/${category.id}`} 
                    className="btn-edit"
                >
                    Edit
                </NavLink>
                <button 
                    onClick={handleDelete}
                    className="btn-delete"
                    title="Delete category"
                >
                    Delete
                </button>
            </div> */}
            </div>
        </NavLink>
    );
}