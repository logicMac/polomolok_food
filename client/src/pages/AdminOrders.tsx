import { useState, useEffect } from 'react';
import { Order, User } from '../types';
import api from '../services/api';
import LocationMap from '../components/LocationMap';
import { Bike } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await api.get('/riders/available');
      setRiders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch riders:', error);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const assignRider = async (orderId: string, riderId: string) => {
    try {
      console.log('Assigning rider:', { orderId, riderId });
      const response = await api.post('/riders/assign-order', { orderId, riderId });
      console.log('Assignment response:', response.data);
      fetchOrders();
      alert('Rider assigned successfully');
    } catch (error: any) {
      console.error('Assignment error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to assign rider');
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
    <div className="min-h-screen bg-black py-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 animate-fadeInUp">
          Manage Orders
        </h1>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <div 
              key={order._id} 
              className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 animate-fadeInUp"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="font-mono text-sm text-gray-300">{order._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Customer ID</p>
                  <p className="font-mono text-sm text-gray-300">{order.userId}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold mb-2 text-gray-300">Items:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1 text-gray-300">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-700/50 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    ₱{order.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  <span className="font-semibold text-gray-300">Phone:</span> {order.phoneNumber}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-semibold text-gray-300">Address:</span> {order.deliveryAddress}
                </p>
                {order.location && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-300 mb-2">Delivery Location:</p>
                    <LocationMap 
                      latitude={order.location.latitude}
                      longitude={order.location.longitude}
                      address={order.deliveryAddress}
                    />
                    <a
                      href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 mt-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Google Maps
                    </a>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Rider Assignment */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 flex items-center justify-center">
                    <Bike className="w-4 h-4 text-green-400" />
                  </div>
                  Assign Rider
                </label>
                {order.riderId ? (
                  <div className="px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm shadow-lg shadow-green-500/20">
                    Rider assigned (ID: {order.riderId})
                  </div>
                ) : (
                  <select
                    onChange={(e) => e.target.value && assignRider(order._id, e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a rider...</option>
                    {riders.length === 0 ? (
                      <option value="" disabled>No available riders</option>
                    ) : (
                      riders.map((rider) => (
                        <option key={rider._id || rider.userId} value={rider._id || rider.userId}>
                          {rider.name} - {rider.vehicleType}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
