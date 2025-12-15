import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MenuItem, LikesStatistics } from '../../types';
import api from '../../services/api';

interface LikesState {
  likedItems: MenuItem[];
  popularItems: MenuItem[];
  statistics: LikesStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: LikesState = {
  likedItems: [],
  popularItems: [],
  statistics: null,
  loading: false,
  error: null,
};

// Async thunks
export const toggleLike = createAsyncThunk(
  'likes/toggleLike',
  async (menuItemId: number) => {
    const response = await api.post(`/menu-items/${menuItemId}/like`);
    return { menuItemId, ...response.data.data };
  }
);

export const fetchUserLikes = createAsyncThunk(
  'likes/fetchUserLikes',
  async () => {
    const response = await api.get('/menu-items/liked');
    return response.data.data;
  }
);

export const fetchPopularItems = createAsyncThunk(
  'likes/fetchPopularItems',
  async () => {
    const response = await api.get('/menu-items/popular');
    return response.data.data;
  }
);

export const fetchLikesStatistics = createAsyncThunk(
  'likes/fetchLikesStatistics',
  async () => {
    const response = await api.get('/admin/likes-statistics');
    return response.data.data;
  }
);

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { menuItemId, liked, likes_count } = action.payload;
        
        // Update liked items list
        if (liked) {
          // Add to liked items if not already there
          const existingIndex = state.likedItems.findIndex(item => item.id === menuItemId);
          if (existingIndex === -1) {
            // We don't have the full item data here, so we'll refetch
            // In a real app, you might want to pass the full item data
          }
        } else {
          // Remove from liked items
          state.likedItems = state.likedItems.filter(item => item.id !== menuItemId);
        }
        
        // Update popular items likes count
        const popularItemIndex = state.popularItems.findIndex(item => item.id === menuItemId);
        if (popularItemIndex !== -1) {
          state.popularItems[popularItemIndex].likes_count = likes_count;
          state.popularItems[popularItemIndex].is_liked = liked;
        }
      })

      // Fetch User Likes
      .addCase(fetchUserLikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.likedItems = action.payload;
      })
      .addCase(fetchUserLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch liked items';
      })

      // Fetch Popular Items
      .addCase(fetchPopularItems.fulfilled, (state, action) => {
        state.popularItems = action.payload;
      })

      // Fetch Likes Statistics
      .addCase(fetchLikesStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLikesStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchLikesStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch likes statistics';
      });
  },
});

export const { clearError } = likesSlice.actions;
export default likesSlice.reducer;