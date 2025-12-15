import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TrustedFriend, User, Order } from '../../types';
import api from '../../services/api';

interface TrustedFriendsState {
  trustedFriends: TrustedFriend[];
  pickupOrders: Order[];
  searchResults: User[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
}

const initialState: TrustedFriendsState = {
  trustedFriends: [],
  pickupOrders: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  error: null,
};

// Async thunks
export const fetchTrustedFriends = createAsyncThunk(
  'trustedFriends/fetchTrustedFriends',
  async () => {
    const response = await api.get('/trusted-friends');
    return response.data;
  }
);

export const addTrustedFriend = createAsyncThunk(
  'trustedFriends/addTrustedFriend',
  async (data: {
    friend_student_id: string;
    permission_type: 'permanent' | 'temporary';
    expires_at?: string;
    usage_limit?: number;
  }) => {
    const response = await api.post('/trusted-friends', data);
    return response.data;
  }
);

export const updateTrustedFriend = createAsyncThunk(
  'trustedFriends/updateTrustedFriend',
  async ({ id, data }: {
    id: number;
    data: {
      permission_type?: 'permanent' | 'temporary';
      expires_at?: string;
      usage_limit?: number;
      is_active?: boolean;
    };
  }) => {
    const response = await api.put(`/trusted-friends/${id}`, data);
    return response.data;
  }
);

export const removeTrustedFriend = createAsyncThunk(
  'trustedFriends/removeTrustedFriend',
  async (id: number) => {
    await api.delete(`/trusted-friends/${id}`);
    return id;
  }
);

export const fetchPickupOrders = createAsyncThunk(
  'trustedFriends/fetchPickupOrders',
  async () => {
    const response = await api.get('/trusted-friends/pickup-orders');
    return response.data;
  }
);

export const pickupOrder = createAsyncThunk(
  'trustedFriends/pickupOrder',
  async ({ orderId, pickup_code }: {
    orderId: number;
    pickup_code?: string;
  }) => {
    const response = await api.post(`/trusted-friends/pickup/${orderId}`, {
      pickup_code
    });
    return response.data;
  }
);

export const searchUsers = createAsyncThunk(
  'trustedFriends/searchUsers',
  async (search: string) => {
    const response = await api.get('/trusted-friends/search-users', {
      params: { search }
    });
    return response.data;
  }
);

const trustedFriendsSlice = createSlice({
  name: 'trustedFriends',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trusted Friends
      .addCase(fetchTrustedFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrustedFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.trustedFriends = action.payload.data;
      })
      .addCase(fetchTrustedFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trusted friends';
      })

      // Add Trusted Friend
      .addCase(addTrustedFriend.fulfilled, (state, action) => {
        state.trustedFriends.push(action.payload.data);
      })

      // Update Trusted Friend
      .addCase(updateTrustedFriend.fulfilled, (state, action) => {
        const index = state.trustedFriends.findIndex(
          friend => friend.id === action.payload.data.id
        );
        if (index !== -1) {
          state.trustedFriends[index] = action.payload.data;
        }
      })

      // Remove Trusted Friend
      .addCase(removeTrustedFriend.fulfilled, (state, action) => {
        state.trustedFriends = state.trustedFriends.filter(
          friend => friend.id !== action.payload
        );
      })

      // Fetch Pickup Orders
      .addCase(fetchPickupOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupOrders = action.payload.data.orders;
      })
      .addCase(fetchPickupOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pickup orders';
      })

      // Pickup Order
      .addCase(pickupOrder.fulfilled, (state, action) => {
        // Remove the picked up order from the list
        state.pickupOrders = state.pickupOrders.filter(
          order => order.id !== action.payload.data.id
        );
      })

      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || 'Failed to search users';
      });
  },
});

export const { clearError, clearSearchResults } = trustedFriendsSlice.actions;
export default trustedFriendsSlice.reducer;