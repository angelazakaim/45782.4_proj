// AddCategory.tsx - Add new category
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import "./AddCategory.css";
import categoriesService from "../../../Services/CategoriesService";
import { type Category, type CategoryCreate } from "../../../Models/Category";
import { notificationService } from "../../../Services/NotificationService";


export function AddCategory() {
    const navigate = useNavigate();
    const { parentId } = useParams<{ parentId: string }>();
    
    const { register, handleSubmit, formState, setValue, watch } = useForm<CategoryCreate>({
        mode: 'all',
        defaultValues: {
            name: '',
            description: '',
            parent_id: parentId ? parseInt(parentId) : null,
            is_active: true
        }
    });
    
    const [parentCategory, setParentCategory] = useState<Category | null>(null);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const watchedName = watch('name');

    useEffect(() => {
        loadCategories();
        if (parentId) {
            loadParentCategory(parseInt(parentId));
        }
    }, [parentId]);

    const loadCategories = async () => {
        try {
            const categories = await categoriesService.getAllCategories();
            setAllCategories(categories);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const loadParentCategory = async (id: number) => {
        try {
            const category = await categoriesService.getCategoryById(id);
            setParentCategory(category);
            setValue('parent_id', id);
        } catch (err) {
            notificationService.error('Failed to load parent category');
        }
    };

    const onSubmit = async (data: CategoryCreate) => {
        try {
            const dataToSend: CategoryCreate = {
                name: data.name.trim(),
                description: data.description?.trim() || null,
                is_active: data.is_active,
                parent_id: data.parent_id || null
            };

            let newCategory: Category;

            if (parentId) {
                newCategory = await categoriesService.createSubcategory(
                    parseInt(parentId), 
                    dataToSend
                );
            } else {
                newCategory = await categoriesService.createCategory(dataToSend);
            }

            notificationService.success(`Category "${newCategory.name}" created successfully!`);
            navigate('/categories');
        } catch (err: any) {
            notificationService.error(err.response?.data?.error || 'Failed to create category');
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const isSubcategory = !!parentId;

    return (
        <div className="AddCategory">
            <header>
                <h2>
                    {isSubcategory 
                        ? `Add Subcategory${parentCategory ? ` to "${parentCategory.name}"` : ''}` 
                        : 'Add New Category'
                    }
                </h2>
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
                        placeholder="e.g., Electronics, Clothing"
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
                        placeholder="Category description (optional)"
                        rows={4}
                        className={formState.errors.description ? 'error' : ''}
                    />
                    {formState.errors.description && (
                        <span className="error-message">{formState.errors.description.message}</span>
                    )}
                </div>

                {/* Parent Category (only if not creating subcategory) */}
                {!isSubcategory && (
                    <div className="form-group">
                        <label htmlFor="parent_id">Parent Category (Optional)</label>
                        <select
                            id="parent_id"
                            {...register('parent_id')}
                        >
                            <option value="">-- Root Category --</option>
                            {allCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.parent_id ? '  └─ ' : ''}{cat.name}
                                </option>
                            ))}
                        </select>
                        <small>Leave empty to create a root category</small>
                    </div>
                )}

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

                {/* Preview */}
                <div className="category-preview">
                    <h4>Preview</h4>
                    <div className="preview-content">
                        <p><strong>Name:</strong> {watchedName || '(not set)'}</p>
                        <p><strong>Slug:</strong> /{generateSlug(watchedName || '')}</p>
                        {parentCategory && (
                            <p><strong>Parent:</strong> {parentCategory.name}</p>
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
                        disabled={!formState.isValid}
                    >
                        Create Category
                    </button>
                </div>
            </form>
        </div>
    );
}