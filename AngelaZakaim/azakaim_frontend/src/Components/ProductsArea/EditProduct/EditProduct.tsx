import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../../../Models/Product";
import type { Category } from "../../../Models/Category";
import productService from "../../../Services/ProductsService";
import { notificationService } from "../../../Services/NotificationService";
import { config } from "../../../Utils/Config"; // Added config import
import "./EditProduct.css";

export function EditProduct() {
    const { prodId } = useParams();
    const id = Number(prodId);
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);       // blocks render until product is fetched
    const [fetchError, setFetchError] = useState<string | null>(null); // tracks fetch failure

    // ── image ──────────────────────────────────────────────────────────────
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Ref for the hidden file <input>
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState, reset, setError } =
        useForm<Product>({ mode: "all" });

    // ── helper: normalise image_url from the backend ───────────────────────
    function sanitizeImageUrl(url: string | null | undefined): string | null {
        if (!url || url.trim() === "" || url === "null" || url === "undefined") {
            return null;
        }
        
        // If it's a relative path from the backend, prepend the Base URL
        if (url.startsWith('/static')) {
            return config.BASE_URL + url;
        }
        
        return url;
    }

    // ── fetch on mount ─────────────────────────────────────────────────────
    useEffect(() => {
        productService.getAllCategories()
            .then((res: any) => {
                const list = Array.isArray(res) ? res : res.categories;
                setCategories(list || []);
            })
            .catch(err => {
                console.error("Failed to fetch categories:", err);
                setCategories([]);
            });

        if (id && !isNaN(id)) {
            productService.getOneProduct(id)
                .then(product => {
                    reset(product);
                    const safeUrl = sanitizeImageUrl(product.image_url);
                    setOriginalImageUrl(safeUrl);
                    setImagePreview(safeUrl);
                })
                .catch(err => {
                    setFetchError(err.message || "Failed to load product.");
                    console.error("Error loading product:", err);
                })
                .finally(() => setLoading(false));
        } else {
            setFetchError("Invalid product ID.");
            setLoading(false);
        }
    }, [id, reset]);

    // ── image handlers ─────────────────────────────────────────────────────
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Local blob preview doesn't need base URL
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
    }

    const imageChanged = imagePreview !== originalImageUrl;
    const canSubmit = formState.isDirty || imageChanged;

    // ── submit ─────────────────────────────────────────────────────────────
    async function send(product: Product) {
        try {
            setUploading(true);

            let finalImageUrl: string | null = imagePreview;

            if (imageFile) {
                // 1. Upload new file and get back relative path (e.g. /static/...)
                finalImageUrl = await productService.uploadImage(imageFile);
            } else if (imagePreview && imagePreview.startsWith(config.BASE_URL)) {
                // 2. If keeping existing image, strip BASE_URL to save relative path only
                finalImageUrl = imagePreview.replace(config.BASE_URL, "");
            }

            const payload = {
                name: product.name,
                description: product.description,
                price: Number(product.price),
                compare_price: product.compare_price ? Number(product.compare_price) : null,
                stock_quantity: Number(product.stock_quantity),
                category_id: Number(product.category_id),
                sku: product.sku,
                is_active: product.is_active,
                is_featured: product.is_featured,
                image_url: finalImageUrl
            };

            await productService.updateProduct(id, payload as any);
            notificationService.success("Product updated successfully");
            navigate(`/products/details/${id}`);
        } catch (err: any) {
            const serverErrors = err.response?.data?.details;
            if (serverErrors) {
                Object.keys(serverErrors).forEach(field => {
                    setError(field as keyof Product, {
                        type: "server",
                        message: serverErrors[field][0]
                    });
                });
                notificationService.error("Please fix errors.");
            } else {
                notificationService.error(err.message || "Update failed");
            }
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <p>Loading...</p>;

    if (fetchError) {
        return (
            <div className="EditProduct">
                <header><h2>Edit Product</h2></header>
                <div className="fetch-error">
                    <p className="error-message">{fetchError}</p>
                    <button type="button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="EditProduct">
            <header>
                <h2>Edit Product #{id}</h2>
            </header>

            <form onSubmit={handleSubmit(send)} className="product-form">
                <div className="form-group">
                    <label htmlFor="name">Name <span className="required">*</span></label>
                    <input
                        type="text"
                        id="name"
                        {...register("name", { required: "Name is required" })}
                        className={formState.errors.name ? "error" : ""}
                    />
                    {formState.errors.name && <span className="error-message">{formState.errors.name.message}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" {...register("description")} />
                </div>

                <div className="form-group">
                    <label htmlFor="category_id">Category <span className="required">*</span></label>
                    <select id="category_id" {...register("category_id")}>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price ($) <span className="required">*</span></label>
                    <input type="number" id="price" step="0.01" {...register("price")} />
                </div>

                <div className="form-group">
                    <label htmlFor="compare_price">Compare Price ($)</label>
                    <input type="number" id="compare_price" step="0.01" {...register("compare_price")} />
                </div>

                <div className="form-group">
                    <label htmlFor="stock_quantity">Stock</label>
                    <input type="number" id="stock_quantity" {...register("stock_quantity")} />
                </div>

                <div className="form-group">
                    <label htmlFor="sku">SKU <span className="required">*</span></label>
                    <input type="text" id="sku" {...register("sku")} />
                </div>

                <div className="form-group">
                    <label>Product Image</label>
                    <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />
                        {imagePreview ? (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button type="button" className="remove-image-btn" onClick={(e) => { e.stopPropagation(); removeImage(); }}>×</button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-icon">📷</span>
                                <p>Click to upload image</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label><input type="checkbox" {...register("is_active")} /> Active</label>
                </div>

                <div className="form-group checkbox-group">
                    <label><input type="checkbox" {...register("is_featured")} /> Featured</label>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="btn-cancel">Cancel</button>
                    <button type="submit" className="btn-submit" disabled={!canSubmit || uploading}>
                        {uploading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}