import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, ApiResponse, PaginatedResponse } from '../../types';
import api from '../../services/api';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; status?: string } = {}) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
    return response.data.data!;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    items: Array<{ menu_item_id: number; quantity: number; special_requests?: string }>;
    pickup_time?: string;
    special_instructions?: string;
  }) => {
    const response = await api.post<ApiResponse<Order>>('/orders', orderData);
    return response.data.data!;
  }
);

export const fetchOrder = createAsyncThunk('orders/fetchOrder', async (id: number) => {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data.data!;
});

export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (id: number) => {
  const response = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return response.data.data!;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.currentPage = action.payload.current_page;
        state.totalPages = action.payload.last_page;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      })
      // Fetch Order
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      // Cancel Order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;