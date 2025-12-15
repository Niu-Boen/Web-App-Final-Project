import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Clock, CheckCircle, Package, Truck, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  special_requests?: string;
  menu_item: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
}

interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  pickup_time?: string;
  special_instructions?: string;
  created_at: string;
  confirmed_at?: string;
  ready_at?: string;
  completed_at?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  order_items: OrderItem[];
}

const OrderManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'orange' },
    { value: 'ready', label: 'Ready', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'gray' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'ready':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders from /orders/all...');
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      
      const response = await api.get('/orders/all');
      console.log('Orders response:', response.data);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
        console.log('Orders set successfully:', response.data.data?.length || 0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      toast.error(errorMessage);
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh the orders list
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'completed'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const canUpdateStatus = (status: string): boolean => {
    return ['pending', 'confirmed', 'preparing', 'ready'].includes(status);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (!user || user.role !== 'staff') {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {orders.filter(order => order.status === option.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all' ? 'No orders available' : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer: {order.user.name} ({order.user.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    Placed: {new Date(order.created_at).toLocaleString()}
                  </p>
                  {order.pickup_time && (
                    <p className="text-sm text-gray-600">
                      Pickup: {new Date(order.pickup_time).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 mt-2">
                    ฿{parseFloat(order.total_amount.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div className="flex items-center">
                        {item.menu_item.image && (
                          <img
                            src={item.menu_item.image.startsWith('http') 
                              ? item.menu_item.image 
                              : `http://localhost:8000/storage/${item.menu_item.image}`}
                            alt={item.menu_item.name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.menu_item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.special_requests && (
                            <p className="text-sm text-orange-600">Note: {item.special_requests}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-medium">
                        ฿{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {order.special_instructions && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="font-medium text-yellow-800 mb-1">Special Instructions:</h4>
                  <p className="text-yellow-700">{order.special_instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                {canUpdateStatus(order.status) && getNextStatus(order.status) && (
                  <button
                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                    disabled={updatingStatus === order.id}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                  >
                    {updatingStatus === order.id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      getStatusIcon(getNextStatus(order.status)!)
                    )}
                    <span className="ml-1">
                      Mark as {(() => {
                        const nextStatus = getNextStatus(order.status);
                        return nextStatus ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1) : '';
                      })()}
                    </span>
                  </button>
                )}
                
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    disabled={updatingStatus === order.id}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;