import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, MenuItem, ApiResponse, PaginatedResponse } from '../../types';
import api from '../../services/api';

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  categories: [],
  menuItems: [],
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk('menu/fetchCategories', async () => {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data.data!;
});

export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (params: { page?: number; category_id?: number; search?: string; featured?: boolean } = {}) => {
    const response = await api.get<ApiResponse<PaginatedResponse<MenuItem>>>('/menu', { params });
    return response.data.data!;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Fetch Menu Items
      .addCase(fetchMenuItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItems = action.payload.data;
        state.currentPage = action.payload.current_page;
        state.totalPages = action.payload.last_page;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch menu items';
      });
  },
});

export const { clearError } = menuSlice.actions;
export default menuSlice.reducer;