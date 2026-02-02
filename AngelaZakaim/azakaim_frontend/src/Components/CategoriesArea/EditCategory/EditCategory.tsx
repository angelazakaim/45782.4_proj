// EditCategory.tsx - Edit existing category
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import categoriesService from "../../../Services/CategoriesService";
import { type Category, type CategoryUpdate } from "../../../Models/Category";
import { notificationService } from "../../../Services/NotificationService";
import "./EditCategory.css";

export function EditCategory() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [category, setCategory] = useState<Category | null>(null);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const { register, handleSubmit, formState, reset } = useForm<CategoryUpdate>({ mode: 'all' });

    useEffect(() => {
        if (id) {
            loadCategory(parseInt(id));
            loadAllCategories();
        }
    }, [id]);

    const loadCategory = async (categoryId: number) => {
        try {
            const data = await categoriesService.getCategoryById(categoryId);
            setCategory(data);
            reset({
                name: data.name,
                description: data.description || '',
                parent_id: data.parent_id,
                is_active: data.is_active
            });
        } catch (err: any) {
            notificationService.error(err.response?.data?.error || 'Failed to load category');
            navigate('/categories');
        } finally {
            setLoading(false);
        }
    };

    const loadAllCategories = async () => {
        try {
            const categories = await categoriesService.getAllCategories();
            setAllCategories(categories);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const onSubmit = async (data: CategoryUpdate) => {
        if (!id) return;

        // Prevent setting parent to self
        if (data.parent_id === category?.id) {
            notificationService.error('Category cannot be its own parent');
            return;
        }

        try {
            const dataToSend: CategoryUpdate = {
                name: data.name?.trim(),
                description: data.description?.trim() || null,
                is_active: data.is_active,
                parent_id: data.parent_id || null
            };

            const updated = await categoriesService.updateCategory(parseInt(id), dataToSend);
            notificationService.success(`Category "${updated.name}" updated successfully!`);
            navigate('/categories');
        } catch (err: any) {
            notificationService.error(err.response?.data?.error || 'Failed to update category');
        }
    };

    if (loading) {
        return <div className="loading">Loading category...</div>;
    }

    if (!category) {
        return <div className="error">Category not found</div>;
    }

    // Filter out current category and its descendants from parent options
    const availableParents = allCategories.filter(cat => 
        cat.id !== category.id && 
        cat.parent_id !== category.id
    );

    return (
        <div className="EditCategory">
            <header>
                <h2>Edit Category: {category.name}</h2>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="category-form">
                {/* Category Name */}
                <div className="form-group">
                    <label htmlFor="name">
                        Category Name <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register('name', { 
                            required: 'Category name is required',
                            maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                        })}
                        className={formState.errors.name ? 'error' : ''}
                    />
                    {formState.errors.name && (
                        <span className="error-message">{formState.errors.name.message}</span>
                    )}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        {...register('description', {
                            maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                        })}
                        rows={4}
                        className={formState.errors.description ? 'error' : ''}
                    />
                    {formState.errors.description && (
                        <span className="error-message">{formState.errors.description.message}</span>
                    )}
                </div>

                {/* Parent Category */}
                <div className="form-group">
                    <label htmlFor="parent_id">Parent Category</label>
                    <select
                        id="parent_id"
                        {...register('parent_id')}
                    >
                        <option value="">-- Root Category --</option>
                        {availableParents.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.parent_id ? '  └─ ' : ''}{cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Is Active */}
                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            {...register('is_active')}
                        />
                        Active (visible to customers)
                    </label>
                </div>

                {/* Current Info */}
                <div className="category-info">
                    <h4>Current Information</h4>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Created:</span>
                            <span className="value">
                                {new Date(category.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Last Updated:</span>
                            <span className="value">
                                {new Date(category.updated_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Slug:</span>
                            <span className="value">/{category.slug}</span>
                        </div>
                        {category.products_count !== undefined && (
                            <div className="info-item">
                                <span className="label">Products:</span>
                                <span className="value">{category.products_count}</span>
                            </div>
                        )}
                        {category.children && category.children.length > 0 && (
                            <div className="info-item">
                                <span className="label">Subcategories:</span>
                                <span className="value">{category.children.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={() => navigate('/categories')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={!formState.isDirty}
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}