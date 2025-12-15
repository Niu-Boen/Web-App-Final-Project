import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, FinancialReport, DashboardStats, ActivityLog, PaginatedResponse, ApiResponse } from '../../types';
import api from '../../services/api';

interface AdminState {
  users: User[];
  usersLoading: boolean;
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  financialReport: FinancialReport | null;
  financialLoading: boolean;
  activityLogs: ActivityLog[];
  activityLogsLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  usersLoading: false,
  dashboardStats: null,
  dashboardLoading: false,
  financialReport: null,
  financialLoading: false,
  activityLogs: [],
  activityLogsLoading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params?: { role?: string; search?: string }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  }
);

export const updateUserBalance = createAsyncThunk(
  'admin/updateUserBalance',
  async ({ userId, amount, operation, reason }: {
    userId: number;
    amount: number;
    operation: 'add' | 'subtract' | 'set';
    reason: string;
  }) => {
    const response = await api.put(`/admin/users/${userId}/balance`, {
      amount,
      operation,
      reason
    });
    return response.data;
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, is_active, reason }: {
    userId: number;
    is_active: boolean;
    reason?: string;
  }) => {
    const response = await api.put(`/admin/users/${userId}/status`, {
      is_active,
      reason
    });
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role, reason }: {
    userId: number;
    role: 'admin' | 'staff' | 'student';
    reason?: string;
  }) => {
    const response = await api.put(`/admin/users/${userId}/role`, {
      role,
      reason
    });
    return response.data;
  }
);

export const resetUserPassword = createAsyncThunk(
  'admin/resetUserPassword',
  async ({ userId, newPassword, reason }: {
    userId: number;
    newPassword: string;
    reason?: string;
  }) => {
    const response = await api.put(`/admin/users/${userId}/password`, {
      password: newPassword,
      reason
    });
    return response.data;
  }
);

export const updateUserInfo = createAsyncThunk(
  'admin/updateUserInfo',
  async ({ userId, student_id, name, email, reason }: {
    userId: number;
    student_id?: string;
    name?: string;
    email?: string;
    reason?: string;
  }) => {
    const response = await api.put(`/admin/users/${userId}/info`, {
      student_id,
      name,
      email,
      reason
    });
    return response.data;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  }
);

export const fetchFinancialReport = createAsyncThunk(
  'admin/fetchFinancialReport',
  async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/admin/financial-report', { params });
    return response.data;
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'admin/fetchActivityLogs',
  async (params?: {
    user_id?: number;
    action?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.data.data || action.payload.data;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })

      // Update User Balance
      .addCase(updateUserBalance.fulfilled, (state, action) => {
        const updatedUser = action.payload.data.user;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.data;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.data;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Reset User Password
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        // Password reset doesn't need to update user data in state
      })

      // Update User Info
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        const updatedUser = action.payload.data;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      })

      // Financial Report
      .addCase(fetchFinancialReport.pending, (state) => {
        state.financialLoading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => {
        state.financialLoading = false;
        state.financialReport = action.payload.data;
      })
      .addCase(fetchFinancialReport.rejected, (state, action) => {
        state.financialLoading = false;
        state.error = action.error.message || 'Failed to fetch financial report';
      })

      // Activity Logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.activityLogsLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.activityLogsLoading = false;
        state.activityLogs = action.payload.data.data || action.payload.data;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.activityLogsLoading = false;
        state.error = action.error.message || 'Failed to fetch activity logs';
      });
  },
});

export const { clearError, updateUserInList } = adminSlice.actions;
export default adminSlice.reducer;