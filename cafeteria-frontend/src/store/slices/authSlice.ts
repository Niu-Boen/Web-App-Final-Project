import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, ApiResponse } from '../../types';
import api from '../../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

console.log('AuthSlice initial state:', {
  token: localStorage.getItem('token'),
  hasToken: !!localStorage.getItem('token')
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/login', credentials);
      console.log('Login API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue({ message: response.data.message || 'Login failed' });
      }
    } catch (error: any) {
      console.error('Login API Error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    student_id: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    gender: 'male' | 'female';
  }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/register', userData);
      return response.data.data!;
    } catch (error: any) {
      console.error('Register API Error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/logout');
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async () => {
  const response = await api.get<ApiResponse<User>>('/profile');
  return response.data.data!;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // Convert account_balance to number if it's a string
        const user = {
          ...action.payload.user,
          account_balance: typeof action.payload.user.account_balance === 'string' 
            ? parseFloat(action.payload.user.account_balance) 
            : action.payload.user.account_balance
        };
        state.user = user;
        state.token = action.payload.token;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        console.log('Login fulfilled - user set:', user);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message?: string };
        state.error = payload?.message || action.error?.message || 'Login failed';
        console.error('Login failed:', payload, action.error);
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message?: string };
        state.error = payload?.message || action.error?.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const user = {
          ...action.payload,
          account_balance: typeof action.payload.account_balance === 'string' 
            ? parseFloat(action.payload.account_balance) 
            : action.payload.account_balance
        };
        state.user = user;
        console.log('Profile fetched - user set:', user);
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;