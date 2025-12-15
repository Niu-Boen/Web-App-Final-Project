import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchDashboardStats, fetchUsers, updateUserBalance, updateUserStatus, updateUserRole, resetUserPassword, updateUserInfo } from '../store/slices/adminSlice';
import { User } from '../types';
import { toast } from 'react-toastify';

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardStats, dashboardLoading, users, usersLoading } = useSelector((state: RootState) => state.admin);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceModal, setBalanceModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    operation: 'add' as 'add' | 'subtract' | 'set',
    reason: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    reason: ''
  });
  const [editForm, setEditForm] = useState({
    student_id: '',
    name: '',
    email: '',
    reason: ''
  });

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !balanceForm.amount || !balanceForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await dispatch(updateUserBalance({
        userId: selectedUser.id,
        amount: parseFloat(balanceForm.amount),
        operation: balanceForm.operation,
        reason: balanceForm.reason
      })).unwrap();
      
      toast.success('Balance updated successfully');
      setBalanceModal(false);
      setBalanceForm({ amount: '', operation: 'add', reason: '' });
      setSelectedUser(null);
      dispatch(fetchUsers()); // Refresh users list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update balance');
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await dispatch(updateUserStatus({
        userId: user.id,
        is_active: !user.is_active,
        reason: `Status ${!user.is_active ? 'activated' : 'deactivated'} by admin`
      })).unwrap();
      
      toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (user: User, newRole: 'admin' | 'staff' | 'student') => {
    if (user.role === newRole) return;

    try {
      await dispatch(updateUserRole({
        userId: user.id,
        role: newRole,
        reason: `Role changed from ${user.role} to ${newRole} by admin`
      })).unwrap();
      
      toast.success('User role updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !passwordForm.newPassword || !passwordForm.confirmPassword || !passwordForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await dispatch(resetUserPassword({
        userId: selectedUser.id,
        newPassword: passwordForm.newPassword,
        reason: passwordForm.reason
      })).unwrap();
      
      toast.success('Password reset successfully');
      setPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '', reason: '' });
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const handleUserInfoUpdate = async () => {
    if (!selectedUser || !editForm.reason) {
      toast.error('Please provide a reason for the update');
      return;
    }

    try {
      await dispatch(updateUserInfo({
        userId: selectedUser.id,
        student_id: editForm.student_id || undefined,
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        reason: editForm.reason
      })).unwrap();
      
      toast.success('User information updated successfully');
      setEditModal(false);
      setEditForm({ student_id: '', name: '', email: '', reason: '' });
      setSelectedUser(null);
      dispatch(fetchUsers()); // Refresh users list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user information');
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Statistics Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.stats.active_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardStats.stats.total_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">฿{dashboardStats.stats.total_revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
        
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">ID: {user.student_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'staff' | 'student')}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">฿{user.account_balance.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditForm({
                              student_id: user.student_id,
                              name: user.name,
                              email: user.email,
                              reason: ''
                            });
                            setEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit Info
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setPasswordModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`${
                            user.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {passwordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for {selectedUser.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Confirm new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={passwordForm.reason}
                    onChange={(e) => setPasswordForm({...passwordForm, reason: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Reason for password reset..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setPasswordModal(false);
                    setPasswordForm({ newPassword: '', confirmPassword: '', reason: '' });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Info Modal */}
      {editModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit User Information for {selectedUser.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input
                    type="text"
                    value={editForm.student_id}
                    onChange={(e) => setEditForm({...editForm, student_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Student ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason *</label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Reason for information update..."
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditModal(false);
                    setEditForm({ student_id: '', name: '', email: '', reason: '' });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUserInfoUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Information
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


