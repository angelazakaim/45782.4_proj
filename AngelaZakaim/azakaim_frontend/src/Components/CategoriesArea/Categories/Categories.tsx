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
    const isManager = useHasRole([UserRole.MANAGER]);

    // ── Reorder mode (admin only) ────────────────────────────────────
    const [reorderMode, setReorderMode] = useState(false);
    const [pendingMoves, setPendingMoves] = useState<Map<number, number | null>>(new Map());
    const [saving, setSaving] = useState(false);

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

    // Enter reorder mode — force tree view, clear search
    function enterReorder() {
        setReorderMode(true);
        setViewMode('tree');
        setSearchTerm('');
        setShowRootOnly(false);
        setPendingMoves(new Map());
    }

    function cancelReorder() {
        setReorderMode(false);
        setPendingMoves(new Map());
    }

    function handleParentChange(categoryId: number, originalParentId: number | null, newParentId: number | null) {
        setPendingMoves(prev => {
            const next = new Map(prev);
            if (newParentId === originalParentId) {
                next.delete(categoryId); // reverted — remove from pending
            } else {
                next.set(categoryId, newParentId);
            }
            return next;
        });
    }

    async function saveReorder() {
        if (pendingMoves.size === 0) return;
        setSaving(true);
        try {
            const updates = Array.from(pendingMoves.entries()).map(([id, parent_id]) => ({ id, parent_id }));
            await categoriesService.reorderCategories(updates);
            notificationService.success(`${updates.length} category(ies) moved successfully`);
            setReorderMode(false);
            setPendingMoves(new Map());
            await loadCategories(); // refresh
        } catch (err: any) {
            notificationService.error(err.response?.data?.error || 'Failed to reorder categories');
        } finally {
            setSaving(false);
        }
    }

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
                <div className="header-actions">
                    {(isAdmin || isManager) && !reorderMode && (
                        <NavLink to="/categories/add" className="btn-add">
                            + Add Category
                        </NavLink>
                    )}
                    {isAdmin && !reorderMode && (
                        <button className="btn-reorder" onClick={enterReorder}>
                            Reorder
                        </button>
                    )}
                </div>
            </header>

            {/* ── Reorder toolbar ─────────────────────────────────────── */}
            {reorderMode && (
                <div className="reorder-toolbar">
                    <p className="reorder-info">
                        Use the dropdowns to change each category's parent.
                        {pendingMoves.size > 0 && <strong> {pendingMoves.size} change{pendingMoves.size !== 1 ? 's' : ''} pending.</strong>}
                    </p>
                    <div className="reorder-actions">
                        <button className="btn-cancel" onClick={cancelReorder} disabled={saving}>Cancel</button>
                        <button className="btn-save" onClick={saveReorder} disabled={pendingMoves.size === 0 || saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {!reorderMode && (
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
            )}

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
                            allCategories={reorderMode ? categories : undefined}
                            pendingMoves={reorderMode ? pendingMoves : undefined}
                            onParentChange={reorderMode ? handleParentChange : undefined}
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

// ── Tree view component ──────────────────────────────────────────────
interface CategoryTreeViewProps {
    categories: Category[];
    level?: number;
    allCategories?: Category[];
    pendingMoves?: Map<number, number | null>;
    onParentChange?: (id: number, originalParent: number | null, newParent: number | null) => void;
}

function CategoryTreeView({ categories, level = 0, allCategories, pendingMoves, onParentChange }: CategoryTreeViewProps) {
    return (
        <div className="category-tree" style={{ marginLeft: level * 20 }}>
            {categories.map(category => {
                const isReordering = !!onParentChange;
                const hasPending = pendingMoves?.has(category.id);

                return (
                    <div key={category.id} className={`category-tree-item ${hasPending ? 'reorder-changed' : ''}`}>
                        <CategoryCard
                            category={category}
                            isTreeView={true}
                        />

                        {/* Reorder: parent dropdown */}
                        {isReordering && allCategories && (
                            <div className="reorder-parent-select">
                                <label>Parent:</label>
                                <select
                                    value={
                                        pendingMoves?.has(category.id)
                                            ? (pendingMoves.get(category.id) ?? '')
                                            : (category.parent_id ?? '')
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        const newParent = val === '' ? null : Number(val);
                                        onParentChange!(category.id, category.parent_id, newParent);
                                    }}
                                >
                                    <option value="">-- Root (no parent) --</option>
                                    {allCategories
                                        .filter(c => c.id !== category.id)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}

                        {category.children && category.children.length > 0 && (
                            <CategoryTreeView
                                categories={category.children}
                                level={level + 1}
                                allCategories={allCategories}
                                pendingMoves={pendingMoves}
                                onParentChange={onParentChange}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
