import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const TestFeatures: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Feature Test Page</h1>
      
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        {user ? (
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar ? 
                (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000/storage/${user.avatar}`) :
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
              }
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Student ID:</strong> {user.student_id}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Balance:</strong> гд{user.account_balance.toFixed(2)}</p>
              <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
      </div>

      {/* Cart Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cart Status</h2>
        <p><strong>Items in cart:</strong> {items.length}</p>
        <p><strong>Total quantity:</strong> {items.reduce((total, item) => total + item.quantity, 0)}</p>
        <p><strong>Total value:</strong> гд{items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0).toFixed(2)}</p>
        
        {items.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Cart Items:</h3>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{item.menuItem.name} x{item.quantity}</span>
                  <span>гд{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feature Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Feature Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Password visibility toggle</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>User-specific cart storage</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Avatar upload & display</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>React-toastify integration</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Financial management (Admin)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Trusted friends system</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Proxy pickup functionality</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Enhanced error handling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFeatures;


