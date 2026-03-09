import { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">{stats.users.total}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Total Users</h3>
              <p className="text-sm text-gray-400">
                {stats.users.customers} customers, {stats.users.admins} admins
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats.orders.total}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Total Orders</h3>
              <p className="text-sm text-gray-400">
                {stats.orders.pending} pending, {stats.orders.delivered} delivered
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-white">{stats.foods.total}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Food Items</h3>
              <p className="text-sm text-gray-400">Available in menu</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-white">₱{stats.revenue.total.toFixed(2)}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">Total Revenue</h3>
              <p className="text-sm text-gray-400">All time earnings</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link
            to="/admin/foods"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition group"
          >
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-gray-200">Manage Foods</h2>
            <p className="text-gray-400">Add, edit, or remove food items from the menu</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition group"
          >
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-gray-200">Manage Orders</h2>
            <p className="text-gray-400">View and update order statuses</p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition group"
          >
            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-gray-200">Manage Users</h2>
            <p className="text-gray-400">View and manage user accounts</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
