import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store/store';
import { fetchCategories, fetchMenuItems } from '../store/slices/menuSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleLike, fetchUserLikes } from '../store/slices/likesSlice';
import { Search, Plus, Clock, AlertTriangle, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { Category, MenuItem } from '../types';

const Menu = () => {
  const dispatch = useDispatch<AppDispatch>();
  const menuState = useSelector((state: RootState) => state.menu) as any;
  const categories = menuState?.categories || [];
  const menuItems = menuState?.menuItems || [];
  const isLoading = menuState?.isLoading || false;
  const { user } = useSelector((state: RootState) => state.auth);
  const { likedItems } = useSelector((state: RootState) => state.likes);
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMenuItems({}));
    if (user) {
      dispatch(fetchUserLikes());
    }
  }, [dispatch, user]);

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    dispatch(fetchMenuItems({ 
      category_id: categoryId || undefined,
      search: searchTerm || undefined 
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(fetchMenuItems({ 
      category_id: selectedCategory || undefined,
      search: term || undefined 
    }));
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    dispatch(addToCart({ menuItem, quantity: 1 }));
    toast.success(`${menuItem.name} added to cart!`);
  };

  const handleToggleLike = async (menuItemId: number) => {
    if (!user) {
      toast.error('Please login to like items');
      return;
    }

    try {
      const result = await dispatch(toggleLike(menuItemId)).unwrap();
      // Refresh liked items to get updated list
      dispatch(fetchUserLikes());
      
      if (result.liked) {
        toast.success('Added to favorites!');
      } else {
        toast.success('Removed from favorites!');
      }
    } catch (error: any) {
      console.error('Like toggle error:', error);
      toast.error(error.message || 'Failed to update like status');
    }
  };

  const isItemLiked = (itemId: number) => {
    return likedItems.some((item: any) => item.id === itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-lg text-gray-600">Fresh, delicious meals prepared daily</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Items
              </button>
              {categories.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading menu...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item: MenuItem) => (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <div className="flex items-center space-x-2">
                      {user && (
                        <button
                          onClick={() => handleToggleLike(item.id)}
                          className={`p-1 rounded-full transition-colors ${
                            isItemLiked(item.id)
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart 
                            size={20} 
                            fill={isItemLiked(item.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                      )}
                      {item.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                      <p className="text-xs text-gray-600">{item.ingredients.join(', ')}</p>
                    </div>
                  )}
                  
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3 flex items-center">
                      <AlertTriangle size={14} className="text-orange-500 mr-1" />
                      <p className="text-xs text-orange-600">
                        Contains: {item.allergens.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      ฿{parseFloat(item.price.toString()).toFixed(2)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      {item.preparation_time} min
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to={`/menu/${item.id}`}
                      className="w-full btn btn-outline flex items-center justify-center text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.is_available}
                      className={`w-full btn flex items-center justify-center ${
                        item.is_available
                          ? 'btn-primary'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={16} className="mr-2" />
                      {item.is_available ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {menuItems.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No menu items found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;