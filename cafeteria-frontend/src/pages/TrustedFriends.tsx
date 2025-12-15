import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  fetchTrustedFriends,
  addTrustedFriend,
  updateTrustedFriend,
  removeTrustedFriend,
  fetchPickupOrders,
  pickupOrder,
  clearSearchResults
} from '../store/slices/trustedFriendsSlice';
import { TrustedFriend, User, Order } from '../types';
import { toast } from 'react-toastify';
import api from '../services/api';

const TrustedFriends: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trustedFriends, pickupOrders, loading } = useSelector(
    (state: RootState) => state.trustedFriends
  );

  const [activeTab, setActiveTab] = useState<'friends' | 'pickup'>('friends');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const [addForm, setAddForm] = useState({
    friend_student_id: '',
    friend_name: '',
    permission_type: 'permanent' as 'permanent' | 'temporary',
    expires_at: '',
    usage_limit: ''
  });

  useEffect(() => {
    dispatch(fetchTrustedFriends());
    if (activeTab === 'pickup') {
      dispatch(fetchPickupOrders());
    }
    fetchAllUsers();
  }, [dispatch, activeTab]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users...');
      const response = await api.get('/trusted-friends/search-users'); // Get all users
      console.log('API response:', response.data);
      const users = response.data.data || [];
      console.log('Users received:', users);
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set loading state
    setSearchLoading(true);
    
    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Search from database for real-time results
        const response = await api.get(`/trusted-friends/search-users?search=${encodeURIComponent(query)}`);
        const users = response.data.data || [];
        
        // Show all users (temporarily remove balance filter for debugging)
        console.log('API returned users:', users);
        setFilteredUsers(users);
        
        // Debug: log the response
        console.log('Search API response:', response.data);
        console.log('Users found:', users.length);
        
        // Also update allUsers for consistency
        setAllUsers(users);
      } catch (error: any) {
        console.error('Failed to search users:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(`Failed to search users: ${error.response?.data?.message || error.message}`);
        
        // Fallback to local filtering if API fails (temporarily remove balance filter)
        if (query.length === 0) {
          setFilteredUsers(allUsers);
        } else {
          const filtered = allUsers.filter((user: User) => {
            const searchTerm = query.toLowerCase();
            return (
              user.name.toLowerCase().includes(searchTerm) ||
              user.student_id.toLowerCase().includes(searchTerm) ||
              user.email.toLowerCase().includes(searchTerm)
            );
          });
          setFilteredUsers(filtered);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce
  };



  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id.toString());
    setAddForm({
      ...addForm,
      friend_student_id: user.student_id,
      friend_name: user.name
    });
    setSearchQuery(`${user.name} (${user.student_id})`);
    setShowSearchResults(false);
  };

  const handleAddFriend = async () => {
    if (!addForm.friend_student_id || !addForm.friend_name) {
      toast.error('Please select a user from the dropdown');
      return;
    }

    // Verify that the selected user exists
    const selectedUser = allUsers.find(user => 
      user.student_id === addForm.friend_student_id && 
      user.name === addForm.friend_name
    );

    if (!selectedUser) {
      toast.error('Please select a valid user from the dropdown.');
      return;
    }

    try {
      await dispatch(addTrustedFriend({
        friend_student_id: addForm.friend_student_id,
        permission_type: addForm.permission_type,
        expires_at: addForm.expires_at || undefined,
        usage_limit: addForm.usage_limit ? parseInt(addForm.usage_limit) : undefined
      })).unwrap();

      toast.success('Trusted friend added successfully');
      setShowAddModal(false);
      setAddForm({
        friend_student_id: '',
        friend_name: '',
        permission_type: 'permanent',
        expires_at: '',
        usage_limit: ''
      });
      setSelectedUserId('');
      setSearchQuery('');
      setShowSearchResults(false);
      setSearchLoading(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      dispatch(clearSearchResults());
    } catch (error: any) {
      toast.error(error.message || 'Failed to add trusted friend');
    }
  };

  const handleRemoveFriend = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this trusted friend?')) {
      try {
        await dispatch(removeTrustedFriend(id)).unwrap();
        toast.success('Trusted friend removed successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to remove trusted friend');
      }
    }
  };

  const handleToggleStatus = async (friend: TrustedFriend) => {
    try {
      await dispatch(updateTrustedFriend({
        id: friend.id,
        data: { is_active: !friend.is_active }
      })).unwrap();
      
      toast.success(`Friend ${!friend.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update friend status');
    }
  };

  const handlePickupOrder = async (order: Order) => {
    if (window.confirm(`Are you sure you want to pick up order #${order.order_number} for ${order.user?.name}?`)) {
      try {
        await dispatch(pickupOrder({ orderId: order.id })).unwrap();
        toast.success('Order picked up successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to pick up order');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Trusted Friends & Proxy Pickup</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'friends'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Trusted Friends
        </button>
        <button
          onClick={() => setActiveTab('pickup')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'pickup'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available Pickups
        </button>
      </div>

      {/* Trusted Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Manage Trusted Friends</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add Trusted Friend
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Testing search API...');
                    const response = await api.get('/trusted-friends/search-users?search=a');
                    console.log('Direct API test result:', response.data);
                    toast.success(`Found ${response.data.data?.length || 0} users`);
                  } catch (error) {
                    console.error('Direct API test failed:', error);
                    toast.error('API test failed');
                  }
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Test API
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : trustedFriends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No trusted friends added yet.</p>
                <p className="text-sm mt-2">Add friends who can pick up orders on your behalf.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trustedFriends.map((friend) => (
                  <div key={friend.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={friend.friend?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.friend?.name || '')}&background=random`}
                        alt={friend.friend?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{friend.friend?.name}</h3>
                        <p className="text-sm text-gray-500">ID: {friend.friend?.student_id}</p>
                        <p className="text-sm text-green-600">Balance: ฿{parseFloat(friend.friend?.account_balance?.toString() || '0').toFixed(2)}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span className={`px-2 py-1 rounded ${
                            friend.permission_type === 'permanent' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {friend.permission_type === 'permanent' ? 'Long-term' : 'Short-term'}
                          </span>
                          {friend.usage_limit && (
                            <span>Usage: {friend.usage_count}/{friend.usage_limit}</span>
                          )}
                          {friend.expires_at && (
                            <span>Expires: {formatDate(friend.expires_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(friend)}
                        className={`px-3 py-1 rounded text-sm ${
                          friend.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {friend.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pickup Orders Tab */}
      {activeTab === 'pickup' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Orders Available for Pickup</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : pickupOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders available for pickup.</p>
                <p className="text-sm mt-2">Orders from friends who trust you will appear here when ready.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pickupOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">For: {order.user?.name} ({order.user?.student_id})</p>
                        <p className="text-sm text-gray-500">Total: ฿{order.total_amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Ready since: {order.ready_at ? formatDate(order.ready_at) : 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => handlePickupOrder(order)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Pick Up Order
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm text-gray-600">
                            <span>{item.quantity}x {item.menu_item?.name}</span>
                            <span>฿{item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Trusted Friend</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search & Select Friend *</label>
                  <div className="relative" ref={searchRef}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowSearchResults(true)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                      placeholder="Search by name, student ID, or email..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Searching users...</p>
                          </div>
                        ) : filteredUsers.length > 0 ? (
                          <>
                            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                              {searchQuery && <span className="font-medium"> for "{searchQuery}"</span>}
                            </div>
                            {filteredUsers
                              .sort((a, b) => {
                                // Sort by student ID first, then by name
                                if (a.student_id !== b.student_id) {
                                  return a.student_id.localeCompare(b.student_id);
                                }
                                return a.name.localeCompare(b.name);
                              })
                              .map((user) => (
                                <div
                                  key={user.id}
                                  onClick={() => handleUserSelect(user)}
                                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b last:border-b-0"
                                >
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                      alt={user.name}
                                      className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                      <p className="text-xs text-gray-500">ID: {user.student_id}</p>
                                      <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-green-600">฿{parseFloat(user.account_balance.toString()).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Balance</p>
                                  </div>
                                </div>
                              ))}
                          </>
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            {searchQuery ? `No users found matching "${searchQuery}"` : 'Start typing to search for users'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected User Display */}
                  {selectedUserId && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">✓ Selected Friend:</h4>
                      <div className="flex items-center space-x-3">
                        <img
                          src={allUsers.find(u => u.id.toString() === selectedUserId)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(addForm.friend_name)}&background=random`}
                          alt={addForm.friend_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{addForm.friend_name}</p>
                          <p className="text-xs text-gray-600">ID: {addForm.friend_student_id}</p>
                          <p className="text-xs text-green-600">Balance: ฿{parseFloat(allUsers.find(u => u.id.toString() === selectedUserId)?.account_balance.toString() || '0').toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Permission Type</label>
                  <select
                    value={addForm.permission_type}
                    onChange={(e) => setAddForm({...addForm, permission_type: e.target.value as 'permanent' | 'temporary', expires_at: ''})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="permanent">Long-term (up to 5 years)</option>
                    <option value="temporary">Short-term (up to 2 weeks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expires At {addForm.permission_type === 'temporary' ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="datetime-local"
                    value={addForm.expires_at}
                    onChange={(e) => setAddForm({...addForm, expires_at: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                    max={addForm.permission_type === 'temporary' 
                      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                      : new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required={addForm.permission_type === 'temporary'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {addForm.permission_type === 'temporary' 
                      ? 'Short-term permissions can be set for up to 2 weeks maximum'
                      : 'Long-term permissions can be set for up to 5 years (leave empty for no expiration)'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    value={addForm.usage_limit}
                    onChange={(e) => setAddForm({...addForm, usage_limit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm({
                      friend_student_id: '',
                      friend_name: '',
                      permission_type: 'permanent',
                      expires_at: '',
                      usage_limit: ''
                    });
                    setSelectedUserId('');
                    setSearchQuery('');
                    setShowSearchResults(false);
                    setSearchLoading(false);
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    dispatch(clearSearchResults());
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFriend}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustedFriends;


