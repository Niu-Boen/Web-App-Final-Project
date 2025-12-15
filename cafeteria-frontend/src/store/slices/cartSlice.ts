import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, MenuItem } from '../../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
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

      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<{ menuItemId: number; special_requests?: string }>) => {
      const { menuItemId, special_requests } = action.payload;
      state.items = state.items.filter(item => 
        !(item.menuItem.id === menuItemId && item.special_requests === special_requests)
      );
      localStorage.setItem('cart', JSON.stringify(state.items));
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
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;