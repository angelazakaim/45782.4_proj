import { useNavigate } from "react-router-dom";
import { type Product, formatProductImage } from "../../../Models/Product"; // Added formatProductImage
import { addItemAction } from "../../../Redux/CartsSlice";
import { cartService } from "../../../Services/cartsService";
import { notificationService } from "../../../Services/NotificationService";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import store from "../../../Redux/store";
import "./ProductCard.css";

interface productProps {
    product: Product;
}

export function ProductCard({ product: { id, name, price, compare_price, stock_quantity, image_url, is_active } }: productProps) {
    const navigate = useNavigate();

    const isStaff = useHasRole([UserRole.ADMIN, UserRole.MANAGER]);

    async function handleAddToCart(e: React.MouseEvent) {
        e.stopPropagation(); 

        const isLoggedIn = store.getState().authStore.access_token;

        try {
            if (isLoggedIn) {
                await cartService.addToCart({ product_id: id });
            } else {
                notificationService.success("Item added to cart");
            }

            store.dispatch(addItemAction({
                product_id: id,
                name,
                price,
                image_url,
                quantity: 1,
            }));
        } catch {
            // Error handled by notification service
        }
    }

    const showAddToCart = is_active && stock_quantity > 0 && !isStaff;

    return (
        <div className="ProductCard box" onClick={() => navigate('/products/details/' + id)}>
            <div className="card-content">
                <h3>{name}</h3>
                <h4>
                    {compare_price && <span className="sale">${compare_price.toFixed(2)} </span>}
                    now only ${price.toFixed(2)}
                </h4>
                <h4>Available: {stock_quantity}</h4>

                {showAddToCart && (
                    <button className="card-add-to-cart" onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                )}
            </div>

            <img src={formatProductImage(image_url)} alt={name} />
        </div>
    );
}