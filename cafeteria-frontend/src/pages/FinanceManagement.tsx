import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchUsers, updateUserBalance, fetchFinancialReport } from '../store/slices/adminSlice';
import { User } from '../types';
import { toast } from 'react-toastify';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import api from '../services/api';

const FinanceManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, usersLoading, financialReport } = useSelector((state: RootState) => state.admin);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    operation: 'add' as 'add' | 'subtract' | 'set',
    reason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.email === 'finance@apiu.edu') {
      // Fetch users directly using API call since finance manager needs access
      fetchAllUsers();
      dispatch(fetchFinancialReport());
    }
  }, [dispatch, user]);

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      // Update the users in the admin slice manually
      dispatch({ type: 'admin/fetchUsers/fulfilled', payload: response.data });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

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
      dispatch(fetchUsers());
    } catch (error: any) {
      toast.error(error.message || 'Failed to update balance');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.email !== 'finance@apiu.edu') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Management</h1>

      {/* Financial Overview Cards */}
      {financialReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">฿{financialReport.total_revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{financialReport.total_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{financialReport.completed_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{financialReport.completion_rate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Balance Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">User Balance Management</h2>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">฿{user.account_balance.toFixed(2)}</div>
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
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setBalanceModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Update Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balance Update Modal */}
      {balanceModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Update Balance for {selectedUser.name}
              </h3>
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Current Balance: <span className="font-semibold">฿{selectedUser.account_balance.toFixed(2)}</span></p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Operation</label>
                  <select
                    value={balanceForm.operation}
                    onChange={(e) => setBalanceForm({...balanceForm, operation: e.target.value as 'add' | 'subtract' | 'set'})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="add">Add to balance</option>
                    <option value="subtract">Subtract from balance</option>
                    <option value="set">Set balance to</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (฿)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceForm.amount}
                    onChange={(e) => setBalanceForm({...balanceForm, amount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={balanceForm.reason}
                    onChange={(e) => setBalanceForm({...balanceForm, reason: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Reason for balance update..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setBalanceModal(false);
                    setBalanceForm({ amount: '', operation: 'add', reason: '' });
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBalanceUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;


