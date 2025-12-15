import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { ShoppingCart, User, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemsCount = items.reduce((total: number, item: any) => total + item.quantity, 0);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">APIU Cafeteria</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/menu" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Menu
            </Link>
            
            {user ? (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  My Orders
                </Link>
                <Link to="/trusted-friends" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Trusted Friends
                </Link>
                <Link to="/statistics" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Statistics
                </Link>
                {user.role === 'admin' && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Admin Dashboard
                  </Link>
                )}
                {user.role === 'finance' && (
                  <Link to="/finance-management" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Finance Management
                  </Link>
                )}
                {user.role === 'staff' && (
                  <>
                    <Link to="/menu-management" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                      Menu Management
                    </Link>
                    <Link to="/order-management" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                      Order Management
                    </Link>
                  </>
                )}
                <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 p-2">
                  <ShoppingCart size={20} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Balance: ฿{parseFloat(user.account_balance.toString()).toFixed(2)}
                  </span>
                  <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 p-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000/storage/${user.avatar}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 p-2"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/menu" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                Menu
              </Link>
              
              {user ? (
                <>
                  <Link to="/orders" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    My Orders
                  </Link>
                  <Link to="/trusted-friends" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Trusted Friends
                  </Link>
                  <Link to="/statistics" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Statistics
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/dashboard" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'finance' && (
                    <Link to="/finance-management" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                      Finance Management
                    </Link>
                  )}
                  {user.role === 'staff' && (
                    <>
                      <Link to="/menu-management" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                        Menu Management
                      </Link>
                      <Link to="/order-management" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                        Order Management
                      </Link>
                    </>
                  )}
                  <Link to="/cart" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Cart ({cartItemsCount})
                  </Link>
                  <Link to="/profile" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Profile
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    Balance: ฿{parseFloat(user.account_balance.toString()).toFixed(2)}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="block text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

