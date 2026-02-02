import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetails.css";
import { useEffect, useState } from "react";
import { type Product, formatProductImage } from "../../../Models/Product"; // Added formatProductImage
import productService from "../../../Services/ProductsService";
import { addItemAction } from "../../../Redux/CartsSlice";
import { cartService } from "../../../Services/cartsService";
import { notificationService } from "../../../Services/NotificationService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import store from "../../../Redux/store";

export function ProductDetails() {

    const canEdit = useHasRole([UserRole.ADMIN, UserRole.MANAGER]);
    const navigate = useNavigate();
    const { prodId } = useParams();
    const id = Number(prodId);
    const [product, setProduct] = useState<Product>();

    useEffect(() => {
        if (!isNaN(id) && id > 0) {
            productService.getOneProduct(id)
                .then(prod => setProduct(prod))
                .catch(err => notificationService.error(err));
        } else {
            notificationService.error("Invalid product ID");
        }
    }, [id]);

    async function deleteMe() {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await productService.deleteProduct(id);
            notificationService.success("Product deleted");
            navigate("/products");
        } catch (err: any) {
            notificationService.error(err.message);
        }
    }

    async function handleAddToCart() {
        if (!product) return;
        const isLoggedIn = store.getState().authStore.access_token;
        try {
            if (isLoggedIn) {
                await cartService.addToCart({ product_id: product.id });
            } else {
                notificationService.success("Item added to cart");
            }
            store.dispatch(addItemAction({
                product_id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: 1,
            }));
        } catch (err: any) {
            // Service handles error
        }
    }

    if (!product) return null;

    return (
        <div className="ProductDetails">
            <div className="button-group">
                <button onClick={() => navigate(-1)}>Back</button>
                {canEdit && (
                    <>
                        <button className="edit-btn" onClick={() => navigate(`/products/edit/${id}`)}>Edit Product</button>
                        <button className="delete-btn" onClick={deleteMe}>Delete Product</button>
                    </>
                )}
            </div>

            <header>
                <h2>{product.name}</h2>
                <p className="sku-barcode">SKU: {product.sku} | Barcode: {product.barcode || "N/A"}</p>
            </header>

            <div className="main-info">
                <div className="image-section">
                    <img src={formatProductImage(product.image_url)} alt={product.name} />
                </div>

                <div className="info-section">
                    <h3>Pricing</h3>
                    <p className="price">
                        {product.compare_price && (
                            <span className="strikethrough">${product.compare_price.toFixed(2)}</span>
                        )}
                        <span className="current-price">${product.price.toFixed(2)}</span>
                    </p>

                    {!canEdit && product.is_active && product.stock_quantity > 0 && (
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
                    )}

                    <hr />

                    <h3>Description</h3>
                    <p>{product.description || "No description provided."}</p>

                    <hr />

                    <h3>Inventory & Shipping</h3>
                    <p><strong>Status:</strong> {product.is_in_stock ?
                        <span className="in-stock">In Stock</span> :
                        <span className="out-of-stock">Out of Stock</span>}
                    </p>
                    <p><strong>Stock Quantity:</strong> {product.stock_quantity}</p>
                    <p><strong>Weight:</strong> {product.weight ? `${product.weight}kg` : "N/A"}</p>
                    <p><strong>Dimensions:</strong> {product.dimensions || "N/A\""}</p>

                    <hr />

                    <h3>Metadata</h3>
                    <p><strong>Featured Product:</strong> {product.is_featured ? "Yes" : "No"}</p>
                    <p><strong>Active in Store:</strong> {product.is_active ? "Yes" : "No"}</p>
                    <p><strong>Created:</strong> {new Date(product.created_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(product.updated_at).toLocaleString()}</p>
                </div>
            </div>

            {product.images?.length > 0 && (
                <div className="gallery-section">
                    <h3>Product Gallery</h3>
                    <div className="gallery-grid">
                        {product.images.map((img, index) => (
                            <img key={index} src={formatProductImage(img)} alt={`${product.name} gallery ${index}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}