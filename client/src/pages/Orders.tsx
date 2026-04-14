import { useState, useEffect } from 'react';
import { Order } from '../types';
import api from '../services/api';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { OrderTracking } from '../components/OrderTracking';
import { ChatSupport } from '../components/ChatSupport';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on('order-update', (updatedOrder: Order) => {
        setOrders(prev => 
          prev.map(order => 
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });

      return () => {
        socket.off('order-update');
      };
    }
  }, [socket]);

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
      case 'out-for-delivery':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/50';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    }
  };

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mb-6 px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition flex items-center gap-2"
          >
            ← Back to Orders
          </button>
          <OrderTracking orderId={selectedOrder} />
          <div className="mt-6">
            <ChatSupport orderId={selectedOrder} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden py-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 animate-slide-down">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">My Orders</h1>
          <p className="text-gray-400">Track and manage your food orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl animate-scale-in">
            <div className="inline-block p-8 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-2xl mb-6 hover:scale-110 transition-transform duration-300">
              <Package className="w-24 h-24 mx-auto text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">No orders yet</h2>
            <p className="text-gray-400 text-lg mb-8">Start ordering delicious food!</p>
            <button
              onClick={() => window.location.href = '/'}
              className="relative bg-gradient-to-r from-white to-gray-100 text-black px-8 py-4 rounded-xl font-semibold hover:from-gray-100 hover:to-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 shadow-lg inline-flex items-center gap-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 transition-all duration-500"></div>
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Browse Menu
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up animation-delay-200">
            {orders.map((order, index) => (
              <div 
                key={order._id} 
                className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm text-gray-300 bg-black px-3 py-1.5 rounded-lg inline-block border border-zinc-800">
                      {order._id}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-bold capitalize text-sm">{order.status.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-zinc-800">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-black px-4 py-3 rounded-lg">
                      <span className="text-gray-300">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="text-gray-500 ml-2">× {item.quantity}</span>
                      </span>
                      <span className="font-semibold text-white">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <span className="font-bold text-lg text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-white">₱{order.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-black p-4 rounded-lg border border-zinc-800">
                      <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider">Phone Number</p>
                      <p className="text-white font-medium">{order.phoneNumber}</p>
                    </div>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800">
                      <p className="text-gray-500 mb-1 text-xs uppercase tracking-wider">Order Date</p>
                      <p className="text-white font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-black p-4 rounded-lg border border-zinc-800">
                    <p className="text-gray-500 mb-2 text-xs uppercase tracking-wider">Delivery Address</p>
                    <p className="text-white font-medium mb-2">{order.deliveryAddress}</p>
                    {order.location && (
                      <a
                        href={`https://www.google.com/maps?q=${order.location.latitude},${order.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 mt-2 hover:underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        View location on Google Maps
                      </a>
                    )}
                  </div>
                  
                  {/* Track Order Button */}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <button
                      onClick={() => setSelectedOrder(order._id)}
                      className="relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-100 text-black py-4 px-6 rounded-xl hover:from-gray-100 hover:to-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 font-bold text-lg shadow-lg overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-blue-500/20 transition-all duration-500"></div>
                      <span className="relative flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Track Order Live
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Chat Support */}
        <ChatSupport />
      </div>
    </div>
  );
};

export default Orders;
