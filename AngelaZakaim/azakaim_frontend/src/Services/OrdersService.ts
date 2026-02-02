// orderService.ts
import axios from "axios";
import { config } from "../Utils/Config";
import type { Order } from "../Models/Order";
import { notificationService } from "./NotificationService";

// ── Request / Response types ──────────────────────────────────────────────

export interface CreateOrderPayload {
    shipping_address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    payment_method?: string;
    customer_notes?: string;
}

export interface OrdersListResponse {
    orders: Order[];
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
}

// ── Service ───────────────────────────────────────────────────────────────

export const ordersService = {

    // ── Customer endpoints ─────────────────────────────────────────────

    // POST /api/orders  — create order from current cart
    async createOrder(payload: CreateOrderPayload): Promise<Order> {
        try {
            const { data } = await axios.post(config.ORDERS_API_URL, payload);
            notificationService.success("Order placed successfully!");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // GET /api/orders  — current user's order history (paginated, no items)
    async getMyOrders(page = 1, perPage = 100): Promise<OrdersListResponse> {
        try {
            const { data } = await axios.get(config.ORDERS_API_URL, {
                params: { page, per_page: perPage }
            });
            return data;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // GET /api/orders/:id  — single order with items (customer sees own, staff sees any)
    async getOrder(orderId: number): Promise<Order> {
        try {
            const { data } = await axios.get(`${config.ORDERS_API_URL}/${orderId}`);
            return data;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // POST /api/orders/:id/cancel  — customer cancels own order
    async cancelOrder(orderId: number): Promise<Order> {
        try {
            const { data } = await axios.post(`${config.ORDERS_API_URL}/${orderId}/cancel`);
            notificationService.success("Order cancelled");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // ── Manager / Admin endpoints ──────────────────────────────────────

    // GET /api/orders/admin  — all orders with optional status filter
    //   Manager: backend auto-limits to last 30 days
    //   Admin:   no time limit
    //   Returns orders WITH customer data (include_customer=True)
    async getAllOrders(page = 1, perPage = 100, status?: string): Promise<OrdersListResponse> {
        try {
            const { data } = await axios.get(`${config.ORDERS_API_URL}/admin`, {
                params: { page, per_page: perPage, ...(status ? { status } : {}) }
            });
            return data;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // PUT /api/orders/:id/status
    async updateStatus(orderId: number, status: string): Promise<Order> {
        try {
            const { data } = await axios.put(`${config.ORDERS_API_URL}/${orderId}/status`, { status });
            notificationService.success("Order status updated");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // PUT /api/orders/:id/payment-status
    async updatePaymentStatus(orderId: number, paymentStatus: string): Promise<Order> {
        try {
            const { data } = await axios.put(`${config.ORDERS_API_URL}/${orderId}/payment-status`, { payment_status: paymentStatus });
            notificationService.success("Payment status updated");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // POST /api/orders/:id/ship
    async shipOrder(orderId: number, trackingNumber?: string): Promise<Order> {
        try {
            const { data } = await axios.post(`${config.ORDERS_API_URL}/${orderId}/ship`, { tracking_number: trackingNumber });
            notificationService.success("Order marked as shipped");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // POST /api/orders/:id/notes  — append internal note (manager/admin)
    async addNotes(orderId: number, notes: string): Promise<Order> {
        try {
            const { data } = await axios.post(`${config.ORDERS_API_URL}/${orderId}/notes`, { notes });
            notificationService.success("Note added");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // POST /api/orders/:id/refund  — admin only
    async processRefund(orderId: number, reason?: string): Promise<Order> {
        try {
            const { data } = await axios.post(`${config.ORDERS_API_URL}/${orderId}/refund`, { reason });
            notificationService.success("Refund processed");
            return data.order;
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },

    // DELETE /api/orders/:id  — admin only, permanent
    async deleteOrder(orderId: number): Promise<void> {
        try {
            await axios.delete(`${config.ORDERS_API_URL}/${orderId}`);
            notificationService.success("Order permanently deleted");
        } catch (error) {
            notificationService.error(error);
            throw error;
        }
    },
};