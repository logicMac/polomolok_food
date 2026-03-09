import { useState, useEffect } from 'react';
import { Order } from '../types';
import api from '../services/api';
import LocationMap from '../components/LocationMap';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
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

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
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
        <h1 className="text-3xl font-bold mb-8 text-white">Manage Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
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
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1 text-gray-300">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-800 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-xl font-bold text-white">₱{order.totalPrice.toFixed(2)}</span>
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
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
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
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
