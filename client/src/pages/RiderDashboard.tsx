import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Order } from '../types';
import { Package, MapPin, Clock, CheckCircle, Navigation, Power } from 'lucide-react';
import { Button } from '../components/ui/Button';

const RiderDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    fetchRiderStatus();
  }, []);

  const fetchRiderStatus = async () => {
    try {
      const response = await api.get('/users/profile');
      setIsAvailable(response.data.data.isAvailable || false);
    } catch (error) {
      console.error('Failed to fetch rider status:', error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('orderAssigned', (order: Order) => {
        setDeliveries(prev => [order, ...prev]);
      });

      return () => {
        socket.off('orderAssigned');
      };
    }
  }, [socket]);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/riders/my-deliveries');
      setDeliveries(response.data.data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/riders/delivery/${orderId}/status`, { status });
      setDeliveries(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: status as any } : order
        )
      );
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log('Updating location:', { latitude: position.coords.latitude, longitude: position.coords.longitude });
          console.log('User:', user);
          await api.put('/riders/location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          alert('Location updated successfully');
        } catch (error: any) {
          console.error('Location update error:', error);
          console.error('Error response:', error.response?.data);
          alert(error.response?.data?.message || 'Failed to update location');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location');
        setUpdatingLocation(false);
      }
    );
  };

  const toggleAvailability = async () => {
    try {
      console.log('Toggling availability, current user:', user);
      const response = await api.put('/riders/toggle-availability');
      console.log('Toggle response:', response.data);
      setIsAvailable(response.data.data.isAvailable);
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to toggle availability');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      preparing: 'bg-purple-500/20 text-purple-400',
      ready: 'bg-cyan-500/20 text-cyan-400',
      'out-for-delivery': 'bg-orange-500/20 text-orange-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      preparing: 'ready',
      ready: 'out-for-delivery',
      'out-for-delivery': 'delivered'
    };
    return statusFlow[currentStatus] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(d => 
    !['delivered', 'cancelled'].includes(d.status)
  );
  const completedDeliveries = deliveries.filter(d => 
    ['delivered', 'cancelled'].includes(d.status)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden py-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">Rider Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.name}</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up animation-delay-200">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className={`text-lg font-semibold ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </p>
              </div>
              <Button
                onClick={toggleAvailability}
                variant={isAvailable ? 'destructive' : 'default'}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Power className="w-4 h-4" />
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </Button>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Deliveries</p>
                <p className="text-2xl font-bold text-white">{activeDeliveries.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300">
            <Button
              onClick={updateLocation}
              disabled={updatingLocation}
              className="w-full flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            >
              <Navigation className="w-4 h-4" />
              {updatingLocation ? 'Updating...' : 'Update Location'}
            </Button>
          </div>
        </div>

        {/* Active Deliveries */}
        {activeDeliveries.length > 0 && (
          <div className="mb-8 animate-fade-in animation-delay-400">
            <h2 className="text-2xl font-bold text-white mb-4">Active Deliveries</h2>
            <div className="space-y-4">
              {activeDeliveries.map((order, index) => (
                <div 
                  key={order._id} 
                  className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-500">₱{order.totalPrice}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-gray-300">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Delivery Address</p>
                        <p>{order.deliveryAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p>{order.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-gray-300">
                          {item.quantity}x {item.name} - ₱{item.price}
                        </p>
                      ))}
                    </div>
                  </div>

                  {getNextStatus(order.status) && (
                    <Button
                      onClick={() => updateStatus(order._id, getNextStatus(order.status)!)}
                      className="relative w-full flex items-center justify-center gap-2 overflow-hidden group hover:scale-105 transition-transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-green-500/0 group-hover:from-green-500/20 group-hover:via-emerald-500/20 group-hover:to-green-500/20 transition-all duration-500"></div>
                      <span className="relative flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Mark as {getNextStatus(order.status)?.replace('-', ' ')}
                      </span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div className="animate-fade-in animation-delay-600">
            <h2 className="text-2xl font-bold text-white mb-4">Completed Deliveries</h2>
            <div className="space-y-4">
              {completedDeliveries.map((order, index) => (
                <div 
                  key={order._id} 
                  className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 opacity-60 hover:opacity-80 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-400">₱{order.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {deliveries.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl animate-scale-in">
            <div className="inline-block p-8 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-2xl mb-6 hover:scale-110 transition-transform duration-300">
              <Package className="w-24 h-24 mx-auto text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">No deliveries yet</h2>
            <p className="text-gray-400">
              {isAvailable 
                ? 'You will receive notifications when orders are assigned to you'
                : 'Go online to start receiving delivery assignments'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderDashboard;
