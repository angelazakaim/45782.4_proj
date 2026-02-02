import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../Models/Product";
import type { Category } from "../../../Models/Category";
import productService from "../../../Services/ProductsService";
import { notificationService } from "../../../Services/NotificationService";
import "./AddProduct.css";

export function AddProduct() {
    console.log(1);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);

    // ── image ──────────────────────────────────────────────────────────────
    const [imageFile, setImageFile]       = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading]       = useState(false);

    // Ref for the hidden file <input> – replaces document.getElementById
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState } = useForm<Product>({ mode: "all" });

    // ── fetch categories on mount ──────────────────────────────────────────
    useEffect(() => {
        productService.getAllCategories()
            .then((res: any) => {
                const list = Array.isArray(res) ? res : res.categories;
                setCategories(list || []);
            })
            .catch(err => {
                notificationService.error("Could not load categories.");
                console.error(err);
            });
    }, []);

    // ── image handlers ─────────────────────────────────────────────────────
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));   // instant local preview
        }
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
    }

    // ── submit ─────────────────────────────────────────────────────────────
    async function addProduct(product: Product) {
        try {
            setUploading(true);

            // Upload image first (if one was picked), then create the product
            // with the server-returned URL.  No file picked → image_url stays null.
            let imageUrl: string | null = null;
            if (imageFile) {
                imageUrl = await productService.uploadImage(imageFile);
            }

            // react-hook-form returns everything as strings from HTML inputs;
            // convert numeric fields so the server receives proper types.
            const cleanProduct = {
                name:           product.name,
                sku:            product.sku,
                description:    product.description || null,
                category_id:    Number(product.category_id),
                price:          Number(product.price),
                stock_quantity: Number(product.stock_quantity),
                image_url:      imageUrl
            };

            await productService.addNewProduct(cleanProduct as any);
            notificationService.success("Product added successfully");
            navigate("/products");
        } catch (err) {
            notificationService.error(err);
        } finally {
            setUploading(false);
        }
    }

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="AddProduct">
            <header>
                <h2>Add New Product</h2>
            </header>

            <form onSubmit={handleSubmit(addProduct)} className="product-form">
                {/* Name */}
                <div className="form-group">
                    <label htmlFor="name">Name <span className="required">*</span></label>
                    <input
                        type="text"
                        id="name"
                        {...register("name", {
                            required: "Name is required",
                            minLength: { value: 3, message: "Name too short" }
                        })}
                        placeholder="e.g., Wireless Headphones"
                        className={formState.errors.name ? "error" : ""}
                    />
                    {formState.errors.name && (
                        <span className="error-message">{formState.errors.name.message}</span>
                    )}
                </div>

                {/* SKU */}
                <div className="form-group">
                    <label htmlFor="sku">SKU <span className="required">*</span></label>
                    <input
                        type="text"
                        id="sku"
                        {...register("sku", { required: "SKU is required" })}
                        placeholder="e.g., WH-1000"
                        className={formState.errors.sku ? "error" : ""}
                    />
                    {formState.errors.sku && (
                        <span className="error-message">{formState.errors.sku.message}</span>
                    )}
                </div>

                {/* Category */}
                <div className="form-group">
                    <label htmlFor="category_id">Category <span className="required">*</span></label>
                    <select
                        id="category_id"
                        {...register("category_id", { required: "Please select a category" })}
                        className={formState.errors.category_id ? "error" : ""}
                    >
                        <option value="">Select...</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {formState.errors.category_id && (
                        <span className="error-message">{formState.errors.category_id.message}</span>
                    )}
                </div>

                {/* Price */}
                <div className="form-group">
                    <label htmlFor="price">Price <span className="required">*</span></label>
                    <input
                        type="number"
                        id="price"
                        step="0.01"
                        {...register("price", {
                            required: "Price is required",
                            min: { value: 0, message: "Price cannot be negative" }
                        })}
                        placeholder="0.00"
                        className={formState.errors.price ? "error" : ""}
                    />
                    {formState.errors.price && (
                        <span className="error-message">{formState.errors.price.message}</span>
                    )}
                </div>

                {/* Stock Quantity */}
                <div className="form-group">
                    <label htmlFor="stock_quantity">Stock Quantity <span className="required">*</span></label>
                    <input
                        type="number"
                        id="stock_quantity"
                        {...register("stock_quantity", {
                            required: "Stock is required",
                            min: { value: 0, message: "Stock cannot be negative" }
                        })}
                        placeholder="0"
                        className={formState.errors.stock_quantity ? "error" : ""}
                    />
                    {formState.errors.stock_quantity && (
                        <span className="error-message">{formState.errors.stock_quantity.message}</span>
                    )}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        {...register("description")}
                        placeholder="Product description (optional)"
                    />
                </div>

                {/* ── Image Upload ──────────────────────────────────────────
                    Clicking the dashed box opens the native file picker via
                    the ref.  Preview is instant (blob URL); upload only fires
                    on Save. */}
                <div className="form-group">
                    <label>Product Image</label>
                    <div
                        className="image-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {/* hidden file input – controlled via ref */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />

                        {imagePreview ? (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                    title="Remove image"
                                >{"\u00D7"}</button>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="upload-icon">&#128247;</span>
                                <p>Click to upload image</p>
                                <small>PNG, JPG, GIF, WebP - Max 5 MB</small>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" onClick={() => navigate("/products")} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={!formState.isValid || uploading}>
                        {uploading ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}