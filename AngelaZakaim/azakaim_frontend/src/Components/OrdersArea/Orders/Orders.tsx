// Orders.tsx
// Two distinct views sharing one route:
//   • Regular user  → own orders, last 3 months only
//   • Admin/Manager → full management panel: search, date range, status tabs
import { useEffect, useState, useMemo } from "react";
import "./Orders.css";
import { OrderCard } from "../OrderCard/OrderCard";
import { ordersService } from "../../../Services/OrdersService";
import type { Order } from "../../../Models/Order";
import { useHasRole } from "../../../Utils/useHasRole";
import { UserRole } from "../../../Models/Enums";
import { useForceLoggedUser } from "../../../Utils/forceLoggedInHook";

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function Orders() {
    useForceLoggedUser();

    const isAdmin  = useHasRole([UserRole.ADMIN]);
    const isManager = useHasRole([UserRole.MANAGER]);
    const isStaff  = isAdmin || isManager;

    const [orders, setOrders]           = useState<Order[]>([]);
    const [loading, setLoading]         = useState(true);

    // ── Admin filter state ──────────────────────────────────────────
    const [customerSearch, setCustomerSearch] = useState("");
    const [startDate, setStartDate]           = useState("");
    const [endDate, setEndDate]               = useState("");
    const [statusFilter, setStatusFilter]     = useState("all");

    // ── Fetch ───────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                if (isStaff) {
                    // /admin returns orders WITH customer object
                    const res = await ordersService.getAllOrders();
                    setOrders(res.orders);
                } else {
                    const res = await ordersService.getMyOrders();
                    // Limit to last 3 months client-side
                    const cutoff = new Date();
                    cutoff.setMonth(cutoff.getMonth() - 3);
                    setOrders(res.orders.filter(o => new Date(o.created_at) >= cutoff));
                }
            } catch {
                /* toast already shown by service */
            } finally {
                setLoading(false);
            }
        })();
    }, [isStaff]);

    // ── Derived filtered sets (admin only) ─────────────────────────
    // Step 1: customer search + date range  →  used for status-tab counts
    const preStatusFiltered = useMemo(() => {
        if (!isStaff) return orders;

        let result = orders;

        // search across customer name, email AND order number
        if (customerSearch.trim()) {
            const q = customerSearch.trim().toLowerCase();
            result = result.filter(o => {
                if (o.order_number.toLowerCase().includes(q)) return true;
                if (!o.customer) return false;
                const name  = `${o.customer.first_name} ${o.customer.last_name}`.toLowerCase();
                const email = (o.customer.email || "").toLowerCase();
                return name.includes(q) || email.includes(q);
            });
        }

        if (startDate) {
            const s = new Date(startDate + "T00:00:00");
            result = result.filter(o => new Date(o.created_at) >= s);
        }
        if (endDate) {
            const e = new Date(endDate + "T23:59:59");
            result = result.filter(o => new Date(o.created_at) <= e);
        }

        return result;
    }, [orders, customerSearch, startDate, endDate, isStaff]);

    // Step 2: apply status on top  →  what actually renders
    const displayedOrders = useMemo(() => {
        if (!isStaff) return orders;
        return statusFilter === "all"
            ? preStatusFiltered
            : preStatusFiltered.filter(o => o.status === statusFilter);
    }, [preStatusFiltered, statusFilter, isStaff, orders]);

    // ── Loading ─────────────────────────────────────────────────────
    if (loading) return <div className="Orders"><p className="orders-loading">Loading orders…</p></div>;

    // ═══════════════════════════════════════════════════════════════
    // ADMIN / MANAGER VIEW
    // ═══════════════════════════════════════════════════════════════
    if (isStaff) {
        return (
            <div className="Orders">
                <h2>Orders Management</h2>

                {/* ── Search + date range filters ─────────────────── */}
                <div className="orders-filters">
                    <div className="orders-filter-group orders-filter-search">
                        <label>Customer / Order #</label>
                        <input
                            type="text"
                            placeholder="Name, email or order number…"
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                        />
                    </div>
                    <div className="orders-filter-group orders-filter-date">
                        <label>From</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="orders-filter-group orders-filter-date">
                        <label>To</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button
                        className="orders-clear-btn"
                        onClick={() => { setCustomerSearch(""); setStartDate(""); setEndDate(""); setStatusFilter("all"); }}
                    >
                        Clear
                    </button>
                </div>

                {/* ── Status navigation tabs ──────────────────────── */}
                <div className="orders-status-tabs">
                    <button
                        className={statusFilter === "all" ? "active" : ""}
                        onClick={() => setStatusFilter("all")}
                    >
                        All <span className="tab-count">{preStatusFiltered.length}</span>
                    </button>
                    {ALL_STATUSES.map(s => (
                        <button
                            key={s}
                            className={statusFilter === s ? "active" : ""}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s} <span className="tab-count">{preStatusFiltered.filter(o => o.status === s).length}</span>
                        </button>
                    ))}
                </div>

                {/* ── Results count ───────────────────────────────── */}
                <p className="orders-results-info">
                    {displayedOrders.length} order{displayedOrders.length !== 1 ? "s" : ""} found
                </p>

                {/* ── Order list ──────────────────────────────────── */}
                {displayedOrders.length === 0 ? (
                    <div className="orders-empty">
                        <p className="orders-empty-icon">🔍</p>
                        <p>No orders match your filters.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {displayedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                )}
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // REGULAR USER VIEW  (own orders, last 3 months)
    // ═══════════════════════════════════════════════════════════════
    return (
        <div className="Orders">
            <h2>My Orders</h2>
            <p className="orders-subtitle">Showing orders from the last 3 months</p>

            {displayedOrders.length === 0 ? (
                <div className="orders-empty">
                    <p className="orders-empty-icon">📦</p>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here after your first purchase.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {displayedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            )}
        </div>
    );
}