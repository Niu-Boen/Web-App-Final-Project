import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, MenuItem } from '../../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  userId: number | null;
}

// Helper function to get user-specific cart key
const getCartKey = (userId: number | null) => userId ? `cart_${userId}` : 'cart_guest';

// Helper function to load cart for specific user
const loadCartForUser = (userId: number | null): CartItem[] => {
  const cartKey = getCartKey(userId);
  return JSON.parse(localStorage.getItem(cartKey) || '[]');
};

// Helper function to save cart for specific user
const saveCartForUser = (userId: number | null, items: CartItem[]) => {
  const cartKey = getCartKey(userId);
  localStorage.setItem(cartKey, JSON.stringify(items));
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  userId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<number | null>) => {
      // When user changes, load their cart
      state.userId = action.payload;
      state.items = loadCartForUser(action.payload);
    },
    addToCart: (state, action: PayloadAction<{ menuItem: MenuItem; quantity?: number; special_requests?: string }>) => {
      const { menuItem, quantity = 1, special_requests } = action.payload;
      const existingItem = state.items.find(item => 
        item.menuItem.id === menuItem.id && item.special_requests === special_requests
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          menuItem,
          quantity,
          special_requests,
        });
      }

      saveCartForUser(state.userId, state.items);
    },
    removeFromCart: (state, action: PayloadAction<{ menuItemId: number; special_requests?: string }>) => {
      const { menuItemId, special_requests } = action.payload;
      state.items = state.items.filter(item => 
        !(item.menuItem.id === menuItemId && item.special_requests === special_requests)
      );
      saveCartForUser(state.userId, state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ menuItemId: number; quantity: number; special_requests?: string }>) => {
      const { menuItemId, quantity, special_requests } = action.payload;
      const item = state.items.find(item => 
        item.menuItem.id === menuItemId && item.special_requests === special_requests
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i !== item);
        } else {
          item.quantity = quantity;
        }
        saveCartForUser(state.userId, state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      if (state.userId) {
        const cartKey = getCartKey(state.userId);
        localStorage.removeItem(cartKey);
      }
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setUser, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;