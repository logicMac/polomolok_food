import { useState, useEffect } from 'react';
import api from '../services/api';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AnalyticsData {
  revenue: {
    total: number;
    orderCount: number;
    average: number;
  };
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  topFoods: Array<{
    _id: string;
    name: string;
    image: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  revenueByDay: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  peakHours: Array<{
    _id: number;
    count: number;
  }>;
  customers: {
    total: number;
    new: number;
  };
}

interface InventoryData {
  lowStockItems: Array<{
    _id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
    category: string;
  }>;
  outOfStockItems: Array<{
    _id: string;
    name: string;
    category: string;
  }>;
  stockByCategory: Array<{
    _id: string;
    totalStock: number;
    itemCount: number;
    lowStockCount: number;
  }>;
}

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory'>('analytics');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, inventoryRes] = await Promise.all([
        api.get(`/analytics/dashboard?period=${period}`),
        api.get('/analytics/inventory')
      ]);
      setAnalytics(analyticsRes.data.data);
      setInventory(inventoryRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics & Inventory</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white hover:border-white transition"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'analytics'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'inventory'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Inventory
          </button>
        </div>

        {activeTab === 'analytics' && analytics && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Revenue</span>
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">₱{analytics.revenue.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.revenue.orderCount} orders</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Avg Order Value</span>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">₱{analytics.revenue.average.toFixed(2)}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Orders</span>
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{analytics.revenue.orderCount}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Customers</span>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{analytics.customers.total}</p>
                <p className="text-xs text-gray-400 mt-1">+{analytics.customers.new} new</p>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Orders by Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.ordersByStatus.map(status => ({
                          name: status._id.charAt(0).toUpperCase() + status._id.slice(1),
                          value: status.count
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analytics.ordersByStatus.map((_, index) => {
                          const colors = ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b', 
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="flex flex-col justify-center space-y-3">
                  {analytics.ordersByStatus.map((status, index) => {
                    const colors = ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'];
                    const total = analytics.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = ((status.count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={status._id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="text-white capitalize">{status._id}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{status.count}</div>
                          <div className="text-xs text-gray-400">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Revenue Trend Bar Chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analytics.revenueByDay.map(day => ({
                    date: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: day.revenue,
                    orders: day.orders
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a1a1aa"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#a1a1aa"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'revenue') return [`₱${value.toFixed(2)}`, 'Revenue'];
                      return [value, 'Orders'];
                    }}
                  />
                  <Bar dataKey="revenue" fill="#ffffff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Selling Foods */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Top Selling Foods</h2>
              <div className="space-y-3">
                {analytics.topFoods.map((food, index) => (
                  <div key={food._id} className="flex items-center gap-4 p-3 bg-black rounded-lg border border-zinc-800">
                    <span className="text-xl font-bold text-gray-600 w-6">#{index + 1}</span>
                    <img
                      src={getImageUrl(food.image)}
                      alt={food.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/48?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{food.name}</p>
                      <p className="text-xs text-gray-400">{food.totalQuantity} sold</p>
                    </div>
                    <p className="font-bold text-white">₱{food.totalRevenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">Peak Hours</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.peakHours.map(hour => ({
                    hour: `${hour._id}:00`,
                    orders: hour.count
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                  <XAxis type="number" stroke="#a1a1aa" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="hour" 
                    stroke="#a1a1aa"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value: any) => [`${value} orders`, 'Orders']}
                  />
                  <Bar dataKey="orders" fill="#ffffff" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'inventory' && inventory && (
          <>
            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Low Stock Items</span>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{inventory.lowStockItems.length}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Out of Stock</span>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{inventory.outOfStockItems.length}</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-white transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Categories</span>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{inventory.stockByCategory.length}</p>
              </div>
            </div>

            {/* Low Stock Items */}
            {inventory.lowStockItems.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Low Stock Alert
                </h2>
                <div className="space-y-3">
                  {inventory.lowStockItems.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-800">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{item.stock} left</p>
                        <p className="text-xs text-gray-500">Threshold: {item.lowStockThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of Stock Items */}
            {inventory.outOfStockItems.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Out of Stock
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inventory.outOfStockItems.map((item) => (
                    <div key={item._id} className="p-3 bg-black rounded-lg border border-zinc-800">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-sm text-gray-400">{item.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock by Category */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Stock by Category</h2>
              <div className="space-y-3">
                {inventory.stockByCategory.map((category) => (
                  <div key={category._id} className="p-3 bg-black rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-white">{category._id}</p>
                      <p className="text-sm text-gray-400">{category.itemCount} items</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Total Stock: {category.totalStock}</p>
                      {category.lowStockCount > 0 && (
                        <p className="text-sm text-white">{category.lowStockCount} low stock</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
