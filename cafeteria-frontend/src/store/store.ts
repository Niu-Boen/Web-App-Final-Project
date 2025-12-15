import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import menuSlice from './slices/menuSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import adminSlice from './slices/adminSlice';
import trustedFriendsSlice from './slices/trustedFriendsSlice';
import likesSlice from './slices/likesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    menu: menuSlice,
    cart: cartSlice,
    orders: orderSlice,
    admin: adminSlice,
    trustedFriends: trustedFriendsSlice,
    likes: likesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;