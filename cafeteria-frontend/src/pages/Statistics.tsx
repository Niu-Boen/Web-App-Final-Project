import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchLikesStatistics } from '../store/slices/likesSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Heart, TrendingUp, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const Statistics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { statistics, loading } = useSelector((state: RootState) => state.likes);
  
  const [consumptionOverview, setConsumptionOverview] = useState<any>(null);
  const [userConsumptionStats, setUserConsumptionStats] = useState<any>(null);
  const [loadingConsumption, setLoadingConsumption] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchLikesStatistics());
      fetchConsumptionOverview();
    }
    if (user) {
      fetchUserConsumptionStats();
    }
  }, [dispatch, user]);

  const fetchConsumptionOverview = async () => {
    try {
      setLoadingConsumption(true);
      const response = await api.get('/admin/consumption-overview');
      setConsumptionOverview(response.data.data);
    } catch (error) {
      console.error('Failed to fetch consumption overview:', error);
      setConsumptionOverview(null);
    } finally {
      setLoadingConsumption(false);
    }
  };

  const fetchUserConsumptionStats = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/admin/users/${user.id}/consumption-stats`);
      setUserConsumptionStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user consumption stats:', error);
      setUserConsumptionStats(null);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Statistics & Analytics</h1>
          <p className="text-gray-600">Please log in to view statistics.</p>
        </div>
      </div>
    );
  }

  if (loading || loadingConsumption) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Statistics & Analytics</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Statistics & Analytics</h1>

      {/* User Personal Statistics */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Consumption Statistics</h2>
        
        {userConsumptionStats ? (
          <div>
          
          {/* Personal Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{userConsumptionStats.total_orders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-semibold text-gray-900">฿{userConsumptionStats.total_spent.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-500">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Liked Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{userConsumptionStats.liked_items.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Spending by Category */}
          {userConsumptionStats.spending_by_category.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Spending by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userConsumptionStats.spending_by_category}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent }) => `${payload?.category_name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_spent"
                  >
                    {userConsumptionStats.spending_by_category.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`฿${value.toFixed(2)}`, 'Total Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Most Ordered Items */}
          {userConsumptionStats.most_ordered.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Your Most Ordered Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userConsumptionStats.most_ordered.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No consumption data available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Start ordering to see your statistics!</p>
          </div>
        )}
      </div>

      {/* Admin Statistics */}
      {user?.role === 'admin' && statistics && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">System-wide Statistics</h2>
          
          {/* Most Liked Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Most Liked Menu Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.most_liked.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="likes_count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Likes by Category */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Likes by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.likes_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }) => `${payload?.category_name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="likes_count"
                >
                  {statistics.likes_by_category.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Likes Trend */}
          {statistics.daily_likes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Daily Likes Trend (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statistics.daily_likes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="likes_count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* System Overview for Admin */}
      {user?.role === 'admin' && consumptionOverview && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Consumption Overview</h2>
          
          {/* Top Spenders */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Spending Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consumptionOverview.top_spenders.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.student_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{parseFloat(user.total_spent).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.order_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Most Popular Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionOverview.popular_categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Ordering Times */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Peak Ordering Times</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consumptionOverview.peak_times}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="order_count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Menu Item Popularity Analysis */}
          {consumptionOverview.menu_item_stats && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Menu Item Popularity Analysis</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Ratio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Buyers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repeat Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consumptionOverview.menu_item_stats.slice(0, 10).map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <img
                                className="h-8 w-8 rounded-full mr-3"
                                src={item.image.startsWith('http') ? item.image : `http://localhost:8000/storage/${item.image}`}
                                alt={item.name}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">฿{parseFloat(item.price).toFixed(2)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.total_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(item.purchase_ratio || 0).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.unique_buyers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(item.repeat_purchase_rate || 0).toFixed(1)}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.likes_count || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          {consumptionOverview.menu_item_stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Purchase Ratio Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Top Items by Purchase Ratio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consumptionOverview.menu_item_stats.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Purchase Ratio']} />
                    <Bar dataKey="purchase_ratio" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sales Volume Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Sales Volume Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={consumptionOverview.menu_item_stats.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ payload, percent }) => `${payload?.name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total_quantity"
                    >
                      {consumptionOverview.menu_item_stats.slice(0, 6).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} sold`, 'Quantity']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Additional Charts */}
          {consumptionOverview.menu_item_stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Repeat Purchase Rate Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Repeat Purchase Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consumptionOverview.menu_item_stats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}x`, 'Repeat Rate']} />
                    <Bar dataKey="repeat_purchase_rate" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Unique Buyers vs Total Sales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Buyers vs Sales Volume</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consumptionOverview.menu_item_stats.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="unique_buyers" fill="#ffc658" name="Unique Buyers" />
                    <Bar dataKey="total_quantity" fill="#ff7300" name="Total Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;

