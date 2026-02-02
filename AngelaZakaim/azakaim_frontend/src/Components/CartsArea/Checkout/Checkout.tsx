import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";
import { config } from "../../../Utils/Config";
import { UserRole } from "../../../Models/Enums";
import { ordersService } from "../../../Services/OrdersService";
import { clearCartAction } from "../../../Redux/CartsSlice";
import { useForceLoggedUser } from "../../../Utils/forceLoggedInHook";
import store from "../../../Redux/store";

const PAYMENT_METHODS = ["credit_card", "debit_card", "paypal", "bank_transfer"];

export function Checkout() {
    // Only customers can reach this page.  Staff are redirected to /home
    // and their local cart is cleared by the hook.
    useForceLoggedUser("Please sign in to complete your checkout", [UserRole.CUSTOMER]);

    const navigate = useNavigate();
    const cartItems = store.getState().cartStore.items;

    const [address, setAddress] = useState({
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "USA",
    });
    const [paymentMethod, setPaymentMethod] = useState("credit_card");
    const [notes, setNotes]                 = useState("");
    const [submitting, setSubmitting]       = useState(false);

    // ── Sync local cart → server ──────────────────────────────────────
    // createOrder reads the SERVER cart, not Redux.  A guest who added items
    // before logging in only has them in localStorage / Redux.  This effect
    // runs once on mount: it clears the server cart first so we never
    // double-count, then pushes every local item.  Each item is attempted
    // independently — if one fails (e.g. out of stock) the rest still sync
    // and the failed item stays visible in the local cart.
    useEffect(() => {
        (async () => {
            try {
                await axios.post(`${config.CART_API_URL}/clear`);

                for (const item of cartItems) {
                    try {
                        await axios.post(`${config.CART_API_URL}/items`, {
                            product_id: item.product_id,
                            quantity:   item.quantity,
                        });
                    } catch { /* non-fatal */ }
                }
            } catch { /* if clear itself fails, createOrder will use whatever server cart exists */ }
        })();
    }, []);                                 // runs once when checkout mounts

    // Calculate totals locally to show a summary before submitting.
    // The backend recalculates from the cart anyway — these are preview only.
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        if (name in address) {
            setAddress(prev => ({ ...prev, [name]: value }));
        } else if (name === "paymentMethod") {
            setPaymentMethod(value);
        } else if (name === "notes") {
            setNotes(value);
        }
    }

    async function handleSubmit() {
        if (!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.postal_code.trim() || !address.country.trim()) {
            return; // HTML5 required attrs will show native tooltips
        }

        setSubmitting(true);
        try {
            const order = await ordersService.createOrder({
                shipping_address: address,
                payment_method:   paymentMethod,
                customer_notes:   notes || undefined,
            });

            // Backend cleared the server cart — mirror that locally
            store.dispatch(clearCartAction());

            // Go straight to the new order's detail page
            navigate(`/orders/${order.id}`);
        } catch {
            // ordersService already showed the error toast
        } finally {
            setSubmitting(false);
        }
    }

    // If cart is empty (already submitted or navigated here without items) → redirect
    if (cartItems.length === 0) {
        navigate("/cart");
        return null;
    }

    return (
        <div className="Checkout">
            <h2>Checkout</h2>

            <div className="checkout-layout">
                {/* ── left: form ─────────────────────────────── */}
                <div className="checkout-form">

                    {/* shipping address */}
                    <div className="checkout-section">
                        <h3>Shipping Address</h3>
                        <input  name="line1"       placeholder="Street address *"             required value={address.line1}       onChange={handleChange} />
                        <input  name="line2"       placeholder="Apt, suite, unit (optional)"           value={address.line2}       onChange={handleChange} />
                        <div className="checkout-row">
                            <input name="city"          placeholder="City *"                   required value={address.city}          onChange={handleChange} />
                            <input name="state"         placeholder="State *"                  required value={address.state}         onChange={handleChange} />
                        </div>
                        <div className="checkout-row">
                            <input name="postal_code"  placeholder="Postal / ZIP *"           required value={address.postal_code}  onChange={handleChange} />
                            <input name="country"      placeholder="Country *"                required value={address.country}      onChange={handleChange} />
                        </div>
                    </div>

                    {/* payment method */}
                    <div className="checkout-section">
                        <h3>Payment Method</h3>
                        <select name="paymentMethod" value={paymentMethod} onChange={handleChange}>
                            {PAYMENT_METHODS.map(m => (
                                <option key={m} value={m}>{m.replace("_", " ")}</option>
                            ))}
                        </select>
                    </div>

                    {/* optional notes */}
                    <div className="checkout-section">
                        <h3>Notes (optional)</h3>
                        <textarea name="notes" placeholder="Any special instructions..." rows={3} value={notes} onChange={handleChange} />
                    </div>

                    {/* submit */}
                    <button className="checkout-submit-btn" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Placing order…" : "Place Order"}
                    </button>
                </div>

                {/* ── right: order summary ───────────────────── */}
                <div className="checkout-summary">
                    <h3>Order Summary</h3>
                    <div className="checkout-summary-items">
                        {cartItems.map(item => (
                            <div key={item.product_id} className="checkout-summary-item">
                                <span className="checkout-summary-name">{item.name} ×{item.quantity}</span>
                                <span className="checkout-summary-price">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-summary-divider"></div>
                    <div className="checkout-summary-row">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="checkout-summary-row checkout-summary-note">
                        Tax & shipping calculated at checkout
                    </div>
                </div>
            </div>
        </div>
    );
}