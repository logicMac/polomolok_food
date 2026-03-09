import { useState, useEffect } from 'react';
import { Order } from '../types';
import api from '../services/api';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/50';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      case 'preparing':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-white">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Package className="w-24 h-24 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2 text-white">No orders yet</h2>
            <p className="text-gray-400">Start ordering delicious food!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Order ID</p>
                    <p className="font-mono text-sm text-gray-300">{order._id}</p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-semibold capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-300">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-white">₱{order.totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="font-semibold text-gray-300">Phone:</span> {order.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-400 mb-1">
                    <span className="font-semibold text-gray-300">Address:</span> {order.deliveryAddress}
                  </p>
                  {order.location && (
                    <a
                      href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      View on map
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Ordered on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
