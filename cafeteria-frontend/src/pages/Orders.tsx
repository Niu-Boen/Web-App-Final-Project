import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchOrders, cancelOrder } from '../store/slices/orderSlice';
import { Clock, CheckCircle, XCircle, Package, Utensils } from 'lucide-react';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, isLoading } = useSelector((state: RootState) => state.orders);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchOrders({}));
  }, [dispatch]);

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        toast.success('Order cancelled successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to cancel order');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'confirmed':
      case 'preparing':
        return <Utensils className="text-blue-500" size={20} />;
      case 'ready':
        return <Package className="text-green-500" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['all', 'pending', 'confirmed', 'preparing', 'ready', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600">
              {filter === 'all' ? "You haven't placed any orders yet." : `No ${filter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </div>
                      </span>
                      {order.canBeCancelled && order.canBeCancelled() && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.menu_item?.name}</span>
                          <span className="text-gray-600 ml-2">x{item.quantity}</span>
                          {item.special_requests && (
                            <p className="text-sm text-blue-600">Note: {item.special_requests}</p>
                          )}
                        </div>
                        <span className="font-semibold">
                          ฿{parseFloat(item.total_price.toString()).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ฿{parseFloat(order.total_amount.toString()).toFixed(2)}
                      </span>
                    </div>
                    
                    {order.special_instructions && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Special Instructions:</strong> {order.special_instructions}
                        </p>
                      </div>
                    )}
                    
                    {order.pickup_time && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Pickup Time:</strong> {new Date(order.pickup_time).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

