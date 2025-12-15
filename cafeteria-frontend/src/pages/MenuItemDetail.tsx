import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addToCart } from '../store/slices/cartSlice';
import { toggleLike, fetchUserLikes } from '../store/slices/likesSlice';
import { Heart, Clock, AlertTriangle, Plus, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface MenuItemDetailType {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  is_available: boolean;
  is_featured: boolean;
  preparation_time: number;
  stock_quantity?: number;
  likes_count?: number;
  average_rating?: number;
  reviews_count?: number;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: {
    name: string;
    avatar?: string;
  };
  created_at: string;
}

const MenuItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { likedItems } = useSelector((state: RootState) => state.likes);
  
  const [menuItem, setMenuItem] = useState<MenuItemDetailType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [statsData, setStatsData] = useState<any>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (id) {
      fetchMenuItemDetail();
      fetchMenuItemReviews();
    }
    if (user) {
      dispatch(fetchUserLikes());
    }
  }, [id, user, dispatch]);

  const fetchMenuItemDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/menu/${id}`);
      setMenuItem(response.data.data);
      
      // Fetch additional statistics
      try {
        const statsResponse = await api.get(`/menu-items/${id}/stats`);
        setStatsData(statsResponse.data.data);
        setMenuItem(prev => prev ? {
          ...prev,
          ...statsResponse.data.data.item_stats
        } : null);
      } catch (statsError) {
        console.log('Stats not available:', statsError);
      }
    } catch (error) {
      console.error('Failed to fetch menu item:', error);
      toast.error('Failed to load menu item details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItemReviews = async () => {
    try {
      const response = await api.get(`/menu-items/${id}/reviews`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    if (!menuItem) return;

    dispatch(addToCart({ 
      menuItem, 
      quantity, 
      special_requests: specialRequests || undefined 
    }));
    toast.success(`${menuItem.name} added to cart!`);
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please login to like items');
      return;
    }

    if (!menuItem) return;

    try {
      const result = await dispatch(toggleLike(menuItem.id)).unwrap();
      dispatch(fetchUserLikes());
      
      if (result.liked) {
        toast.success('Added to favorites!');
      } else {
        toast.success('Removed from favorites!');
      }
      
      // Update local state
      setMenuItem(prev => prev ? {
        ...prev,
        likes_count: result.likes_count
      } : null);
    } catch (error: any) {
      console.error('Like toggle error:', error);
      toast.error(error.message || 'Failed to update like status');
    }
  };

  const isItemLiked = () => {
    return menuItem ? likedItems.some(item => item.id === menuItem.id) : false;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading menu item...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Item Not Found</h2>
            <button
              onClick={() => navigate('/menu')}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Menu
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/2">
              {menuItem.image ? (
                <img
                  src={menuItem.image.startsWith('http') ? menuItem.image : `http://localhost:8000/storage/${menuItem.image}`}
                  alt={menuItem.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{menuItem.name}</h1>
                  {menuItem.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {menuItem.category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {user && (
                    <button
                      onClick={handleToggleLike}
                      className={`p-2 rounded-full transition-colors ${
                        isItemLiked()
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={24} 
                        fill={isItemLiked() ? 'currentColor' : 'none'}
                      />
                    </button>
                  )}
                  {menuItem.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Price and Rating */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  ฿{parseFloat(menuItem.price.toString()).toFixed(2)}
                </span>
                
                {menuItem.average_rating && menuItem.reviews_count ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {renderStars(Math.round(menuItem.average_rating))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {menuItem.average_rating.toFixed(1)} ({menuItem.reviews_count} reviews)
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Description */}
              {menuItem.description && (
                <p className="text-gray-600 mb-4">{menuItem.description}</p>
              )}

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  Preparation time: {menuItem.preparation_time} minutes
                </div>
                
                {menuItem.stock_quantity !== undefined && (
                  <div className="text-sm text-gray-600">
                    Stock: {menuItem.stock_quantity} available
                  </div>
                )}
              </div>

              {/* Popularity Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Popularity Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(menuItem as any).total_purchased || 0}
                    </div>
                    <div className="text-sm text-gray-600">Times Purchased</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {menuItem.likes_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  {(menuItem as any).unique_buyers && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(menuItem as any).unique_buyers}
                      </div>
                      <div className="text-sm text-gray-600">Unique Buyers</div>
                    </div>
                  )}
                  {(menuItem as any).purchase_ratio && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {parseFloat((menuItem as any).purchase_ratio).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Purchase Ratio</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              {menuItem.ingredients && menuItem.ingredients.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ingredients:</h3>
                  <p className="text-sm text-gray-600">{menuItem.ingredients.join(', ')}</p>
                </div>
              )}

              {/* Allergens */}
              {menuItem.allergens && menuItem.allergens.length > 0 && (
                <div className="mb-6 flex items-start">
                  <AlertTriangle size={16} className="text-orange-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-600">Contains allergens:</p>
                    <p className="text-sm text-orange-600">{menuItem.allergens.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              {menuItem.is_available ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional):
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Any special instructions for this item..."
                    />
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Add to Cart - ฿{(parseFloat(menuItem.price.toString()) * quantity).toFixed(2)}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-red-600 font-medium">Currently Unavailable</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&background=random`}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{review.user.name}</span>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        {statsData && (
          <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Sales Trend */}
              {statsData.monthly_sales && statsData.monthly_sales.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 6 Months)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={statsData.monthly_sales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="quantity" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Rating Distribution */}
              {statsData.rating_distribution && statsData.rating_distribution.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={statsData.rating_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ payload, percent }) => `${payload?.rating}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statsData.rating_distribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Category Comparison */}
            {statsData.category_comparison && statsData.category_comparison.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison with Similar Items</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData.category_comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_sold" fill="#8884d8" name="Total Sold" />
                    <Bar dataKey="likes_count" fill="#82ca9d" name="Likes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {((menuItem as any).purchase_ratio || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Purchase Ratio</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {((menuItem as any).repeat_purchase_rate || 0).toFixed(1)}x
                  </div>
                  <div className="text-sm text-gray-600">Repeat Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {menuItem?.average_rating?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {menuItem?.reviews_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemDetail;

