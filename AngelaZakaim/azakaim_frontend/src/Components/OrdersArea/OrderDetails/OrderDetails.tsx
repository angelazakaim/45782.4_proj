// OrderDetails.tsx
// Single order page.
// Customer: sees items, pricing, address, payment, can cancel if status allows.
// Admin/Manager: everything above PLUS an admin-actions panel at the bottom
//   (status update, payment-status update, notes, refund & delete for admin).
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderDetails.css";
import type { Order } from "../../../Models/Order";
import { ordersService } from "../../../Services/OrdersService"
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import { useForceLoggedUser } from "../../../Utils/forceLoggedInHook";

const STATUS_CLASS: Record<string, string> = {
    pending:    "status-pending",
    confirmed:  "status-confirmed",
    processing: "status-processing",
    shipped:    "status-shipped",
    delivered:  "status-delivered",
    cancelled:  "status-cancelled",
    refunded:   "status-refunded",
};

const ORDER_STATUSES   = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

// Customer may cancel in any of these states; backend enforces the same rule.
const CANCELLABLE = ["pending", "confirmed", "processing", "shipped"];

export function OrderDetails() {
    useForceLoggedUser();

    const navigate      = useNavigate();
    const { orderId }   = useParams();
    const id            = Number(orderId);

    const isAdmin   = useHasRole([UserRole.ADMIN]);
    const isManager = useHasRole([UserRole.MANAGER]);
    const isStaff   = isAdmin || isManager;

    const [order, setOrder]                       = useState<Order | null>(null);
    const [loading, setLoading]                   = useState(true);

    // admin action local state
    const [newStatus, setNewStatus]               = useState("");
    const [newPayStatus, setNewPayStatus]         = useState("");
    const [noteText, setNoteText]                 = useState("");

    // ── Fetch ─────────────────────────────────────────────────────
    useEffect(() => {
        if (isNaN(id) || id < 1) { navigate("/orders"); return; }

        ordersService.getOrder(id)
            .then(o => {
                setOrder(o);
                setNewStatus(o.status);
                setNewPayStatus(o.payment_status);
            })
            .catch(() => navigate("/orders"))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Customer: cancel ──────────────────────────────────────────
    async function handleCancel() {
        if (!order) return;
        if (!window.confirm("Cancel this order?")) return;
        try {
            const updated = await ordersService.cancelOrder(id);
            setOrder(updated);
            setNewStatus(updated.status);
        } catch { /* toast shown */ }
    }

    // ── Admin: update order status ────────────────────────────────
    async function handleUpdateStatus() {
        if (!order || newStatus === order.status) return;
        try {
            const updated = await ordersService.updateStatus(id, newStatus);
            setOrder(updated);
        } catch {
            setNewStatus(order.status); // revert dropdown on error
        }
    }

    // ── Admin: update payment status ──────────────────────────────
    async function handleUpdatePayStatus() {
        if (!order || newPayStatus === order.payment_status) return;
        try {
            const updated = await ordersService.updatePaymentStatus(id, newPayStatus);
            setOrder(updated);
        } catch {
            setNewPayStatus(order.payment_status);
        }
    }

    // ── Admin: add internal note ──────────────────────────────────
    async function handleAddNote() {
        if (!noteText.trim()) return;
        try {
            const updated = await ordersService.addNotes(id, noteText);
            setOrder(updated);
            setNoteText("");
        } catch { /* toast shown */ }
    }

    // ── Admin-only: process refund ────────────────────────────────
    async function handleRefund() {
        const reason = window.prompt("Reason for refund (optional):");
        if (reason === null) return; // user cancelled the prompt
        try {
            const updated = await ordersService.processRefund(id, reason || undefined);
            setOrder(updated);
            setNewStatus(updated.status);
            setNewPayStatus(updated.payment_status);
        } catch { /* toast shown */ }
    }

    // ── Admin-only: permanently delete ────────────────────────────
    async function handleDelete() {
        if (!window.confirm("Permanently delete this order? This CANNOT be undone!")) return;
        try {
            await ordersService.deleteOrder(id);
            navigate("/orders");
        } catch { /* toast shown */ }
    }

    // ── Render guards ─────────────────────────────────────────────
    if (loading || !order) return <div className="OrderDetails"><p>Loading…</p></div>;

    const canCancel = !isStaff && CANCELLABLE.includes(order.status);

    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="OrderDetails">

            {/* header: order number + status badge */}
            <div className="od-header">
                <div>
                    <h2>{order.order_number}</h2>
                    <p className="od-date">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`od-status ${STATUS_CLASS[order.status] ?? ""}`}>{order.status}</span>
            </div>

            {/* nav + customer cancel button */}
            <div className="od-actions">
                <button className="od-back-btn" onClick={() => navigate("/orders")}>← Back to Orders</button>
                {canCancel && <button className="od-cancel-btn" onClick={handleCancel}>Cancel Order</button>}
            </div>

            {/* customer info — only present when staff fetches (include_customer) */}
            {order.customer && (
                <div className="od-section">
                    <h3>Customer</h3>
                    <p className="od-customer-name">{order.customer.first_name} {order.customer.last_name}</p>
                    <p className="od-customer-email">{order.customer.email}</p>
                </div>
            )}

            {/* items */}
            <div className="od-section">
                <h3>Items</h3>
                <div className="od-items">
                    {order.items?.map(item => (
                        <div key={item.id} className="od-item">
                            <div className="od-item-info">
                                <span className="od-item-name">{item.product_name}</span>
                                {item.product_sku && <span className="od-item-sku">SKU: {item.product_sku}</span>}
                            </div>
                            <div className="od-item-pricing">
                                <span className="od-item-qty">×{item.quantity}</span>
                                <span className="od-item-unit">${item.unit_price.toFixed(2)} ea</span>
                                <span className="od-item-total">${item.total_price.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* pricing summary */}
            <div className="od-section">
                <h3>Order Summary</h3>
                <div className="od-pricing-row"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                <div className="od-pricing-row"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
                <div className="od-pricing-row"><span>Shipping</span><span>${order.shipping_cost.toFixed(2)}</span></div>
                <div className="od-pricing-row od-pricing-total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>

            {/* shipping address */}
            <div className="od-section">
                <h3>Shipping Address</h3>
                <p className="od-address">
                    {order.shipping_address.line1}<br />
                    {order.shipping_address.line2 && <>{order.shipping_address.line2}<br /></>}
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country}
                </p>
            </div>

            {/* payment */}
            <div className="od-section">
                <h3>Payment</h3>
                <div className="od-payment-row">
                    <span>Method: <strong>{order.payment_method || "—"}</strong></span>
                    <span className={`od-pay-badge ${STATUS_CLASS[order.payment_status] ?? ""}`}>{order.payment_status}</span>
                </div>
            </div>

            {/* customer notes */}
            {order.customer_notes && (
                <div className="od-section">
                    <h3>Customer Notes</h3>
                    <p className="od-notes">{order.customer_notes}</p>
                </div>
            )}

            {/* admin notes (rendered as a distinct block) */}
            {order.admin_notes && (
                <div className="od-section">
                    <h3>Admin Notes</h3>
                    <p className="od-notes od-notes-admin">{order.admin_notes}</p>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                ADMIN / MANAGER ACTIONS PANEL
                ══════════════════════════════════════════════════ */}
            {isStaff && (
                <div className="od-section od-admin-panel">
                    <h3>⚙️ Admin Actions</h3>

                    {/* order status */}
                    <div className="od-admin-row">
                        <label>Order Status</label>
                        <div className="od-admin-input-group">
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button className="od-admin-btn" onClick={handleUpdateStatus} disabled={newStatus === order.status}>
                                Update
                            </button>
                        </div>
                    </div>

                    {/* payment status */}
                    <div className="od-admin-row">
                        <label>Payment Status</label>
                        <div className="od-admin-input-group">
                            <select value={newPayStatus} onChange={e => setNewPayStatus(e.target.value)}>
                                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button className="od-admin-btn" onClick={handleUpdatePayStatus} disabled={newPayStatus === order.payment_status}>
                                Update
                            </button>
                        </div>
                    </div>

                    {/* add note */}
                    <div className="od-admin-row">
                        <label>Add Note</label>
                        <div className="od-admin-note-group">
                            <textarea
                                rows={2}
                                placeholder="Internal note…"
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                            />
                            <button className="od-admin-btn" onClick={handleAddNote} disabled={!noteText.trim()}>
                                Add Note
                            </button>
                        </div>
                    </div>

                    {/* danger zone — admin only */}
                    {isAdmin && (
                        <div className="od-danger-zone">
                            <button className="od-btn-refund" onClick={handleRefund}>Process Refund</button>
                            <button className="od-btn-delete" onClick={handleDelete}>Delete Order</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}