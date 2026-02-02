// CartsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LocalCartItem {
    product_id: number;
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
}

interface CartState {
    items: LocalCartItem[];
}

// ── localStorage helpers ──────────────────────────────────────────────
// Same pattern AuthSlice uses for tokens/user: read once on init,
// write on every mutation.  Guest cart survives page reloads and
// the redirect to /login without any extra middleware.
const STORAGE_KEY = 'cart_items';

function loadCart(): LocalCartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];                          // corrupt JSON → start fresh
    }
}

function saveCart(items: LocalCartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
// ──────────────────────────────────────────────────────────────────────

const initialState: CartState = {
    items: loadCart(),              // hydrate from storage instead of []
};

export const cartsSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Replace the entire cart — called after fetching from backend on login
        fillCartAction(state: CartState, action: PayloadAction<LocalCartItem[]>) {
            state.items = action.payload;
            saveCart(state.items);
        },

        // Add a new item, or increment quantity if it already exists
        addItemAction(state: CartState, action: PayloadAction<LocalCartItem>) {
            const existing = state.items.find(i => i.product_id === action.payload.product_id);
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            saveCart(state.items);
        },

        // Remove an item by product_id
        removeItemAction(state: CartState, action: PayloadAction<number>) {
            state.items = state.items.filter(i => i.product_id !== action.payload);
            saveCart(state.items);
        },

        // Wipe everything (also called on logout via AuthService)
        clearCartAction(state: CartState) {
            state.items = [];
            localStorage.removeItem(STORAGE_KEY);   // delete the key entirely
        },
    }
});

export const { fillCartAction, addItemAction, removeItemAction, clearCartAction } = cartsSlice.actions;