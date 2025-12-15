import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { updateQuantity, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { fetchProfile } from '../store/slices/authSlice';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.orders);

  const totalAmount = items.reduce((total, item) => {
    return total + (parseFloat(item.menuItem.price.toString()) * item.quantity);
  }, 0);

  const handleUpdateQuantity = (menuItemId: number, newQuantity: number, special_requests?: string) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ menuItemId, special_requests }));
    } else {
      dispatch(updateQuantity({ menuItemId, quantity: newQuantity, special_requests }));
    }
  };

  const handleRemoveItem = (menuItemId: number, special_requests?: string) => {
    dispatch(removeFromCart({ menuItemId, special_requests }));
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Refresh user profile to get latest balance
    await dispatch(fetchProfile());
    
    // The user state should be updated after fetchProfile, but let's double-check
    if (totalAmount > parseFloat(user.account_balance.toString())) {
      toast.error(`Insufficient account balance. Current balance: ฿${user.account_balance.toFixed(2)}, Required: ฿${totalAmount.toFixed(2)}`);
      return;
    }

    try {
      const orderData = {
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_requests: item.special_requests
        }))
      };

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={`${item.menuItem.id}-${item.special_requests || 'no-requests'}-${index}`} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.menuItem.name}</h3>
                    <p className="text-sm text-gray-600">{item.menuItem.description}</p>
                    {item.special_requests && (
                      <p className="text-sm text-blue-600 mt-1">
                        Special requests: {item.special_requests}
                      </p>
                    )}
                    <p className="text-lg font-semibold text-primary-600 mt-2">
                      ฿{parseFloat(item.menuItem.price.toString()).toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItem.id, item.quantity - 1, item.special_requests)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.menuItem.id, item.quantity + 1, item.special_requests)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ฿{(parseFloat(item.menuItem.price.toString()) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.menuItem.id, item.special_requests)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary-600">
                ฿{totalAmount.toFixed(2)}
              </span>
            </div>
            
            {user && (
              <div className="mb-4 text-sm text-gray-600">
                Account Balance: ฿{parseFloat(user.account_balance.toString()).toFixed(2)}
                {totalAmount > parseFloat(user.account_balance.toString()) && (
                  <span className="text-red-600 ml-2">Insufficient balance</span>
                )}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => dispatch(clearCart())}
                className="flex-1 btn btn-secondary"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isLoading || (user && totalAmount > parseFloat(user.account_balance.toString()))}
                className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

