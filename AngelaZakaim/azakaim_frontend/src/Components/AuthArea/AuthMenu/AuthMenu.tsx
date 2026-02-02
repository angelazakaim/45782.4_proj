
import { NavLink, useNavigate } from "react-router-dom";
import "./AuthMenu.css";
import { useEffect, useState, useRef } from "react";
import type { User } from "../../../Models/User";
import type { LocalCartItem } from "../../../Redux/CartsSlice";
import { authService } from "../../../Services/AuthService";
import { fillCartAction, clearCartAction } from "../../../Redux/CartsSlice";
import { notificationService } from "../../../Services/NotificationService";
import { UserRole } from "../../../Models/Enums";
import store from "../../../Redux/store";
import { cartService } from "../../../Services/cartsService";

export function AuthMenu() {
    const [loggedInUser, setLoggedUser] = useState<User | null>(store.getState().authStore.user);
    const [cartCount, setCartCount] = useState(
        store.getState().cartStore.items.reduce((sum, item) => sum + item.quantity, 0)
    );
    const [cartOpen, setCartOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Derived directly from state — no hook needed, and safe to use
    // inside effects or anywhere else.
    const isCustomer = loggedInUser?.role === UserRole.CUSTOMER;

    // Single subscription keeps both user and cart count in sync
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const state = store.getState();
            setLoggedUser(state.authStore.user);
            setCartCount(state.cartStore.items.reduce((sum, item) => sum + item.quantity, 0));
        });
        return () => unsubscribe();
    }, []);

    // Login  → fetch backend cart and fill Redux (customers only)
    // Logout → wipe local cart
    useEffect(() => {
        if (loggedInUser) {
            if (isCustomer) {
                cartService.getCart()
                    .then(cart => {
                        if (!cart?.items) {
                            store.dispatch(fillCartAction([]));
                            return;
                        }
                        const items: LocalCartItem[] = cart.items.map(item => ({
                            product_id: item.product_id,
                            name:       item.product?.name      ?? 'Unknown',
                            price:      item.unit_price,
                            image_url:  item.product?.image_url ?? null,
                            quantity:   item.quantity,
                        }));
                        store.dispatch(fillCartAction(items));
                    })
                    .catch(() => {
                        // Not critical — badge just keeps its current value
                    });
            }
        } else {
            store.dispatch(clearCartAction());
        }
    }, [loggedInUser, isCustomer]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
                setCartOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function logOut() {
        authService.logout();
        notificationService.success('Bye bye, come back soon...');
        navigate('/login');
    }

    // Cart is visible to guests (no user) and customers only.
    // Staff have no customer profile so the icon would be dead weight.
    const showCart = !loggedInUser || isCustomer;

    return (
        <div className="AuthMenu">
            <div className="authContainer">
                {/* Auth text */}
                {!loggedInUser
                    ? <span>Hello guest | <NavLink to="/login">Login</NavLink> | <NavLink to="/register">Register</NavLink></span>
                    : <span>Hello {loggedInUser.username} | <NavLink to="" onClick={logOut}>Logout</NavLink></span>
                }

                {/* Cart icon — guests + customers only */}
                {showCart && (
                    <div className="cart-container" ref={cartRef}>
                        <button className="cart-icon-btn" onClick={() => setCartOpen(!cartOpen)} aria-label="Shopping cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>

                        {cartOpen && (
                            <div className="cart-dropdown">
                                <NavLink to="/cart"     onClick={() => setCartOpen(false)}>View Cart</NavLink>
                                <NavLink to="/checkout" onClick={() => setCartOpen(false)}>Checkout</NavLink>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}