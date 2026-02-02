import { useNavigate } from "react-router-dom";
import type { Order } from "../../../Models/Order";
import "./OrderCard.css";

interface OrderCardProps {
    order: Order;
}

// Maps every status the backend can return to a CSS class
const STATUS_CLASS: Record<string, string> = {
    pending:    "status-pending",
    confirmed:  "status-confirmed",
    processing: "status-processing",
    shipped:    "status-shipped",
    delivered:  "status-delivered",
    cancelled:  "status-cancelled",
    refunded:   "status-refunded",
};

export function OrderCard({ order }: OrderCardProps) {
    const navigate = useNavigate();

    return (
        <div className="OrderCard" onClick={() => navigate(`/orders/${order.id}`)}>
            <div className="order-card-header">
                <span className="order-card-number">{order.order_number}</span>
                <span className={`order-card-status ${STATUS_CLASS[order.status] ?? ""}`}>
                    {order.status}
                </span>
            </div>

            <div className="order-card-body">
                <span className="order-card-date">
                    {new Date(order.created_at).toLocaleDateString()}
                </span>
                <span className="order-card-items">
                    {order.total_items} item{order.total_items !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="order-card-footer">
                <span className="order-card-total">${order.total.toFixed(2)}</span>
                <span className="order-card-arrow">→</span>
            </div>
        </div>
    );
}