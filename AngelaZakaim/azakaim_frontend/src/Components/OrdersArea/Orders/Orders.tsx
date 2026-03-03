// Orders.tsx
// Three distinct views sharing one route:
//   • Customer       → own orders, last 3 months only
//   • Cashier        → today's orders + search by order number
//   • Admin/Manager  → full management panel: search, date range, status tabs
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

    const isAdmin      = useHasRole([UserRole.ADMIN]);
    const isManager    = useHasRole([UserRole.MANAGER]);
    const isCashier    = useHasRole([UserRole.CASHIER]);
    const isManagement = isAdmin || isManager;

    const [orders, setOrders]           = useState<Order[]>([]);
    const [loading, setLoading]         = useState(true);

    // ── Admin/Manager filter state ───────────────────────────────
    const [customerSearch, setCustomerSearch] = useState("");
    const [startDate, setStartDate]           = useState("");
    const [endDate, setEndDate]               = useState("");
    const [statusFilter, setStatusFilter]     = useState("all");

    // ── Cashier search state ─────────────────────────────────────
    const [orderNumberSearch, setOrderNumberSearch] = useState("");
    const [searchedOrder, setSearchedOrder]         = useState<Order | null>(null);
    const [searching, setSearching]                 = useState(false);

    // ── Fetch ───────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                if (isManagement) {
                    const res = await ordersService.getAllOrders();
                    setOrders(res.orders);
                } else if (isCashier) {
                    const res = await ordersService.getTodayOrders();
                    setOrders(res.orders);
                } else {
                    const res = await ordersService.getMyOrders();
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
    }, [isManagement, isCashier]);

    // ── Cashier: search by order number ─────────────────────────
    async function handleOrderSearch() {
        const q = orderNumberSearch.trim();
        if (!q) return;
        setSearching(true);
        setSearchedOrder(null);
        try {
            const order = await ordersService.searchOrderByNumber(q);
            setSearchedOrder(order);
        } catch {
            /* toast already shown by service */
        } finally {
            setSearching(false);
        }
    }

    // ── Derived filtered sets (management only) ──────────────────
    const preStatusFiltered = useMemo(() => {
        if (!isManagement) return orders;

        let result = orders;

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
    }, [orders, customerSearch, startDate, endDate, isManagement]);

    const displayedOrders = useMemo(() => {
        if (!isManagement) return orders;
        return statusFilter === "all"
            ? preStatusFiltered
            : preStatusFiltered.filter(o => o.status === statusFilter);
    }, [preStatusFiltered, statusFilter, isManagement, orders]);

    // ── Loading ─────────────────────────────────────────────────────
    if (loading) return <div className="Orders"><p className="orders-loading">Loading orders...</p></div>;

    // =================================================================
    // ADMIN / MANAGER VIEW
    // =================================================================
    if (isManagement) {
        return (
            <div className="Orders">
                <h2>Orders Management</h2>

                {/* ── Search + date range filters ─────────────────── */}
                <div className="orders-filters">
                    <div className="orders-filter-group orders-filter-search">
                        <label>Customer / Order #</label>
                        <input
                            type="text"
                            placeholder="Name, email or order number..."
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

    // =================================================================
    // CASHIER VIEW  (today's orders + search by order number)
    // =================================================================
    if (isCashier) {
        return (
            <div className="Orders">
                <h2>Today's Orders</h2>

                {/* ── Search by order number ──────────────────────── */}
                <div className="orders-filters">
                    <div className="orders-filter-group orders-filter-search">
                        <label>Look up order</label>
                        <input
                            type="text"
                            placeholder="Enter order number..."
                            value={orderNumberSearch}
                            onChange={e => setOrderNumberSearch(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleOrderSearch()}
                        />
                    </div>
                    <button className="orders-clear-btn" onClick={handleOrderSearch} disabled={searching}>
                        {searching ? "Searching..." : "Search"}
                    </button>
                    {searchedOrder && (
                        <button className="orders-clear-btn" onClick={() => { setSearchedOrder(null); setOrderNumberSearch(""); }}>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Search result ───────────────────────────────── */}
                {searchedOrder && (
                    <div className="orders-list">
                        <p className="orders-results-info">Search result:</p>
                        <OrderCard order={searchedOrder} />
                    </div>
                )}

                {/* ── Today's orders ──────────────────────────────── */}
                <p className="orders-results-info">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} today
                </p>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <p>No orders placed today yet.</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => <OrderCard key={order.id} order={order} />)}
                    </div>
                )}
            </div>
        );
    }

    // =================================================================
    // CUSTOMER VIEW  (own orders, last 3 months)
    // =================================================================
    return (
        <div className="Orders">
            <h2>My Orders</h2>
            <p className="orders-subtitle">Showing orders from the last 3 months</p>

            {displayedOrders.length === 0 ? (
                <div className="orders-empty">
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
