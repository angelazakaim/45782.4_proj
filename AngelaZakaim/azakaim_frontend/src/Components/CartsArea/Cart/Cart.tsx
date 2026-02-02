import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import type { LocalCartItem } from "../../../Redux/CartsSlice";
import { removeItemAction, clearCartAction } from "../../../Redux/CartsSlice";
import { cartService } from "../../../Services/cartsService";
import { notificationService } from "../../../Services/NotificationService";
import store from "../../../Redux/store";

export function Cart() {
    const navigate = useNavigate();
    const [items, setItems] = useState<LocalCartItem[]>(store.getState().cartStore.items);

    // Stay in sync with Redux whenever any component changes the cart
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setItems(store.getState().cartStore.items);
        });
        return () => unsubscribe();
    }, []);

    async function handleRemove(productId: number) {
        const isLoggedIn = store.getState().authStore.access_token;
        try {
            if (isLoggedIn) {
                await cartService.removeFromCart(productId);
            } else {
                notificationService.success("Item removed from cart");
            }
            store.dispatch(removeItemAction(productId));
        } catch {
            // cartService already showed the error toast
        }
    }

    async function handleClear() {
        const isLoggedIn = store.getState().authStore.access_token;
        try {
            if (isLoggedIn) {
                await cartService.clearCart();
            } else {
                notificationService.success("Cart cleared");
            }
            store.dispatch(clearCartAction());
        } catch {
            // cartService already showed the error toast
        }
    }

    function handleCheckout() {
        if (!store.getState().authStore.access_token) {
            notificationService.error("Please log in to proceed to checkout");
            navigate("/login");
            return;
        }
        navigate("/checkout");
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // ── Empty state ─────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="Cart">
                <div className="cart-empty">
                    <p className="cart-empty-icon">🛒</p>
                    <h2>Your cart is empty</h2>
                    <p>Add some products and come back!</p>
                    <button className="cart-browse-btn" onClick={() => navigate("/products")}>
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    // ── Cart with items ─────────────────────────────────────
    return (
        <div className="Cart">
            <h2>Shopping Cart <span className="cart-count">({totalItems} item{totalItems !== 1 ? 's' : ''})</span></h2>

            <div className="cart-items">
                {items.map(item => (
                    <div key={item.product_id} className="cart-item">

                        <div className="cart-item-image">
                            {item.image_url
                                ? <img src={item.image_url} alt={item.name} />
                                : <div className="cart-item-no-image">No Image</div>
                            }
                        </div>

                        <div className="cart-item-info">
                            <h3>{item.name}</h3>
                            <p>${item.price.toFixed(2)} each</p>
                            <p className="cart-item-qty">Qty: {item.quantity}</p>
                        </div>

                        <div className="cart-item-total">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>

                        <button className="cart-remove-btn" onClick={() => handleRemove(item.product_id)}>✕</button>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div className="cart-summary-row">
                    <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''}):</span>
                    <span className="cart-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-actions">
                    <button className="cart-clear-btn" onClick={handleClear}>Clear Cart</button>
                    <button className="cart-checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
            </div>
        </div>
    );
}