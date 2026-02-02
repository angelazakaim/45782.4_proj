// cartService.ts
import axios from "axios";
import { config } from "../Utils/Config"
import type { Cart } from "../Models/Cart";
import { notificationService } from "./NotificationService";

export interface AddToCartParams {
  product_id: number;
  quantity?: number;
}

export interface CartValidationResponse {
  valid: boolean;
  message: string;
}

export const cartService = {

  // GET /api/cart
  // Backend returns the Cart directly when it exists,
  // or { message, cart: null } when empty — normalised to Cart | null here.
  async getCart(): Promise<Cart | null> {
    try {
      const { data } = await axios.get(config.CART_API_URL);
      return "cart" in data ? data.cart : data;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },

  // GET /api/cart/validate
  // Backend returns 400 + { valid: false, message } for a failed validation —
  // that's a normal business result, not a server error.
  // validateStatus tells axios to treat 400 as success so we can return it.
  async validateCart(): Promise<CartValidationResponse> {
    try {
      const { data } = await axios.get(`${config.CART_API_URL}/validate`, {
        validateStatus: (status) => status === 200 || status === 400,
      });
      return data;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },

  // POST /api/cart/items
  async addToCart({ product_id, quantity = 1 }: AddToCartParams): Promise<Cart> {
    try {
      const { data } = await axios.post(`${config.CART_API_URL}/items`, {
        product_id,
        quantity,
      });
      notificationService.success("Item added to cart");
      return data.cart;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },

  // PUT /api/cart/items/:productId
  async updateCartItem(productId: number, quantity: number): Promise<Cart> {
    try {
      const { data } = await axios.put(
        `${config.CART_API_URL}/items/${productId}`,
        { quantity }
      );
      notificationService.success("Cart updated");
      return data.cart;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },

  // DELETE /api/cart/items/:productId
  async removeFromCart(productId: number): Promise<Cart | null> {
    try {
      const { data } = await axios.delete(
        `${config.CART_API_URL}/items/${productId}`
      );
      notificationService.success("Item removed from cart");
      return data.cart;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },

  // POST /api/cart/clear
  async clearCart(): Promise<Cart | null> {
    try {
      const { data } = await axios.post(`${config.CART_API_URL}/clear`);
      notificationService.success("Cart cleared");
      return data.cart;
    } catch (error) {
      notificationService.error(error);
      throw error;
    }
  },
};