import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchMenuItems } from '../store/slices/menuSlice';
import { Clock, Star, ShoppingCart } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { menuItems, isLoading } = useSelector((state: RootState) => state.menu);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchMenuItems({ featured: true })).catch(error => {
      console.error('Failed to fetch menu items:', error);
    });
  }, [dispatch]);

  const featuredItems = menuItems.filter(item => item.is_featured).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              APIU Cafeteria System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Fast, convenient, and delicious meals for students
            </p>
            {user ? (
              <div className="space-y-4">
                <p className="text-lg">
                  Welcome back, {user.name}! Your balance: ฿{parseFloat(user.account_balance.toString()).toFixed(2)}
                </p>
                <Link to="/menu" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Order Now
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/register" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Get Started
                </Link>
                <Link to="/menu" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                  View Menu
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our System?</h2>
            <p className="text-lg text-gray-600">Experience the future of cafeteria dining</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">No more waiting in long queues. Order online and pick up when ready.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
              <p className="text-gray-600">Browse menu, customize orders, and pay directly from your account.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600">Fresh ingredients, clear allergen information, and consistent quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
              <p className="text-lg text-gray-600">Try our most popular dishes</p>
            </div>
            
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map((item) => (
                  <div key={item.id} className="card hover:shadow-lg transition-shadow">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary-600">
                          ฿{parseFloat(item.price.toString()).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.preparation_time} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link to="/menu" className="btn btn-primary">
                View Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

