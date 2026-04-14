import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, BarChart3, TrendingUp, ArrowRight, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Welcome back! Here's your business overview</p>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/10 group-hover:to-blue-600/10 transition-all duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2 font-medium">Total Users</p>
                    <p className="text-4xl font-bold text-white mb-3">{stats.users.total}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full font-medium">
                        {stats.users.customers} customers
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium">
                        {stats.users.admins} admins
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2 font-medium">Total Orders</p>
                    <p className="text-4xl font-bold text-white mb-3">{stats.orders.total}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full font-medium">
                        {stats.orders.pending} pending
                      </span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full font-medium">
                        {stats.orders.delivered} done
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Items Card */}
              <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-red-600/0 group-hover:from-orange-600/10 group-hover:to-red-600/10 transition-all duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2 font-medium">Food Items</p>
                    <p className="text-4xl font-bold text-white mb-3">{stats.foods.total}</p>
                    <p className="text-xs text-gray-500">Available in menu</p>
                  </div>
                </div>
              </div>

              {/* Total Revenue Card */}
              <div className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/0 to-amber-600/0 group-hover:from-yellow-600/10 group-hover:to-amber-600/10 transition-all duration-500"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg group-hover:shadow-yellow-500/50 transition-shadow">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2 font-medium">Total Revenue</p>
                    <p className="text-4xl font-bold text-white mb-3">₱{stats.revenue.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">All time earnings</p>
                  </div>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/foods"
            className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-8 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/0 to-red-600/0 group-hover:from-orange-600/10 group-hover:to-red-600/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                Manage Foods
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">Add, edit, or remove food items from the menu</p>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-8 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 transition-all duration-300">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-green-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                Manage Orders
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">View and update order statuses</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Manage Users
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">View and manage user accounts</p>
            </div>
          </Link>

          <Link
            to="/admin/riders"
            className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                Manage Riders
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">Add and manage delivery riders</p>
            </div>
          </Link>

          <Link
            to="/admin/security"
            className="group relative bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-2xl p-8 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-rose-600/0 group-hover:from-red-600/10 group-hover:to-rose-600/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl shadow-lg group-hover:shadow-red-500/50 group-hover:scale-110 transition-all duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-red-400 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                Security & Monitoring
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">View activity logs and manage IP addresses</p>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="group relative bg-gradient-to-br from-white to-gray-100 border-2 border-white rounded-2xl p-8 hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-500 md:col-span-2 lg:col-span-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-400/0 group-hover:from-yellow-400/10 group-hover:to-amber-400/10 transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl shadow-lg group-hover:shadow-yellow-500/50 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-2 transition-all duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                Analytics & Inventory
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">View detailed sales analytics, revenue trends, and manage inventory levels</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Revenue Tracking</span>
                <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Stock Management</span>
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Reports</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
