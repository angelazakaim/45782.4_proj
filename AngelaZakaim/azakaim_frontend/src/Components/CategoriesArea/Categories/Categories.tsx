// Categories.tsx - Main categories list component
import "./Categories.css";

import { useEffect, useState } from "react";
import categoriesService from "../../../Services/CategoriesService";
import { type Category } from "../../../Models/Category";
import { CategoryCard } from "../CategoryCard/CategoryCard";
import { notificationService } from "../../../Services/NotificationService";
import { NavLink } from "react-router-dom";
import { UserRole } from "../../../Models/Enums";
import { useHasRole } from "../../../Utils/useHasRole";

export function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showRootOnly, setShowRootOnly] = useState<boolean>(false);

    const isAdmin = useHasRole([UserRole.ADMIN]);

    useEffect(() => {
        loadCategories();
    }, [showRootOnly]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await categoriesService.getAllCategories(showRootOnly);
            setCategories(data);
        } catch (err: any) {
            notificationService.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };


    // Filter categories by search term
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Build tree view
    const categoryTree = viewMode === 'tree'
        ? categoriesService.buildCategoryTree(filteredCategories)
        : filteredCategories;

    if (loading) return <div className="loading">Loading categories...</div>;

    return (
        <div className="Categories">
            <header className="categories-header">
                <h2>Category Management</h2>
                {isAdmin && <><div className="header-actions">
                    <NavLink to="/categories/add" className="btn-add">
                        + Add Category
                    </NavLink>
                </div></>}
            </header>

            <div className="categories-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="clear-search"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="view-controls">
                    <button
                        className={`view-btn ${viewMode === 'flat' ? 'active' : ''}`}
                        onClick={() => setViewMode('flat')}
                    >
                        List View
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                        onClick={() => setViewMode('tree')}
                    >
                        Tree View
                    </button>
                </div>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showRootOnly}
                        onChange={(e) => setShowRootOnly(e.target.checked)}
                    />
                    Show root categories only
                </label>
            </div>

            <div className="categories-stats">
                <p>Total Categories: {categories.length}</p>
                {searchTerm && <p>Filtered: {filteredCategories.length}</p>}
            </div>

            {filteredCategories.length === 0 ? (
                <div className="no-categories">
                    <p>No categories found.</p>
                    <NavLink to="/categories/add">Create your first category</NavLink>
                </div>
            ) : (
                <div className={`categories-container ${viewMode}`}>
                    {viewMode === 'tree' ? (
                        <CategoryTreeView
                            categories={categoryTree}

                        />
                    ) : (
                        <div className="categories-grid">
                            {filteredCategories.map(category => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}

                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Tree view component for hierarchical display
interface CategoryTreeViewProps {
    categories: Category[];
    level?: number;
}

function CategoryTreeView({ categories, level = 0 }: CategoryTreeViewProps) {
    return (
        <div className="category-tree" style={{ marginLeft: level * 20 }}>
            {categories.map(category => (
                <div key={category.id} className="category-tree-item">
                    <CategoryCard
                        category={category}

                        isTreeView={true}
                    />
                    {category.children && category.children.length > 0 && (
                        <CategoryTreeView
                            categories={category.children}

                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}