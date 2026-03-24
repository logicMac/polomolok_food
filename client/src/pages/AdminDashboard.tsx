import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Statistics {
  users: { total: number; customers: number; admins: number };
  orders: { total: number; pending: number; confirmed: number; delivered: number };
  foods: { total: number };
  revenue: { total: number };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/users/statistics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your business today.</p>
        </div>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats.users.total}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-300">{stats.users.customers} customers</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500">{stats.users.admins} admins</span>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats.orders.total}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-300">{stats.orders.pending} pending</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{stats.orders.delivered} delivered</span>
                  </div>
                </div>
              </div>

              {/* Food Items Card */}
              <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Food Items</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats.foods.total}</p>
                  <p className="text-xs text-gray-500">Available in menu</p>
                </div>
              </div>

              {/* Total Revenue Card */}
              <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mb-2">₱{stats.revenue.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">All time earnings</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stats.orders.confirmed}</div>
                  <div className="text-sm text-gray-400">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {stats.orders.total > 0 ? ((stats.orders.delivered / stats.orders.total) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    ₱{stats.orders.total > 0 ? (stats.revenue.total / stats.orders.total).toFixed(2) : 0}
                  </div>
                  <div className="text-sm text-gray-400">Avg Order Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stats.users.customers}</div>
                  <div className="text-sm text-gray-400">Active Customers</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Management Cards */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/foods"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white hover:bg-zinc-800 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <Package className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Manage Foods
            </h3>
            <p className="text-gray-400 text-sm">Add, edit, or remove food items from the menu</p>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white hover:bg-zinc-800 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Manage Orders
            </h3>
            <p className="text-gray-400 text-sm">View and update order statuses</p>
          </Link>

          <Link
            to="/admin/users"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white hover:bg-zinc-800 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <Users className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Manage Users
            </h3>
            <p className="text-gray-400 text-sm">View and manage user accounts</p>
          </Link>

          <Link
            to="/admin/riders"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-white hover:bg-zinc-800 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <Users className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Manage Riders
            </h3>
            <p className="text-gray-400 text-sm">Add and manage delivery riders</p>
          </Link>

          <Link
            to="/admin/analytics"
            className="group bg-white border-2 border-white rounded-xl p-6 hover:bg-zinc-900 transition-all duration-300 md:col-span-2"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-black/5 group-hover:bg-white/10 rounded-lg transition-colors">
                <BarChart3 className="w-6 h-6 text-black group-hover:text-white transition-colors" />
              </div>
              <ArrowRight className="w-5 h-5 text-black group-hover:text-white transition-all" />
            </div>
            <h3 className="text-xl font-bold text-black group-hover:text-white mb-2 transition-colors">
              Analytics & Inventory
            </h3>
            <p className="text-gray-600 group-hover:text-gray-400 text-sm transition-colors">View detailed sales analytics, revenue trends, and manage inventory levels</p>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="px-3 py-1 bg-black/5 group-hover:bg-white/10 text-black group-hover:text-white rounded-full transition-colors">Revenue Tracking</span>
              <span className="px-3 py-1 bg-black/5 group-hover:bg-white/10 text-black group-hover:text-white rounded-full transition-colors">Stock Management</span>
              <span className="px-3 py-1 bg-black/5 group-hover:bg-white/10 text-black group-hover:text-white rounded-full transition-colors">Reports</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
