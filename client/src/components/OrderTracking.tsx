import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Order } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OrderTrackingProps {
  orderId: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadTracking();
    
    if (socket) {
      socket.emit('join-order', orderId);

      socket.on('order-update', (updatedOrder: Order) => {
        if (updatedOrder._id === orderId) {
          setOrder(updatedOrder);
          loadTracking();
        }
      });

      socket.on('driver-location', (data: any) => {
        if (data.orderId === orderId) {
          setTracking((prev: any) => ({
            ...prev,
            driverLocation: data.location
          }));
        }
      });

      return () => {
        socket.emit('leave-order', orderId);
        socket.off('order-update');
        socket.off('driver-location');
      };
    }
  }, [orderId, socket]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading tracking for order:', orderId); // Debug
      const response = await api.get(`/orders/${orderId}/tracking`);
      console.log('Tracking response:', response.data); // Debug
      if (response.data.success) {
        setTracking(response.data.data);
      } else {
        setError('Failed to load tracking information');
      }
    } catch (error: any) {
      console.error('Failed to load tracking:', error);
      setError(error.response?.data?.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!tracking) return 0;
    return statusSteps.findIndex(step => step.key === tracking.status);
  };

  const getEstimatedTime = () => {
    if (!tracking?.estimatedDeliveryTime) return 'Calculating...';
    const eta = new Date(tracking.estimatedDeliveryTime);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    
    if (diff < 0) return 'Arriving soon';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 text-lg font-semibold mb-2">Error Loading Tracking</p>
        <p className="text-red-300">{error}</p>
        <button
          onClick={loadTracking}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 text-center">
        <Package className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-yellow-400 text-lg">No tracking information available</p>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const isCancelled = tracking.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-6">Order Status</h3>
        
        {isCancelled ? (
          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
            <XCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Order Cancelled</p>
              <p className="text-sm">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.key} className="flex items-center mb-8 last:mb-0">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-12 w-0.5 h-8 -ml-px ${
                            index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {tracking.statusHistory && tracking.statusHistory.find((h: any) => h.status === step.key) && (
                        <p className="text-sm text-gray-500">
                          {new Date(
                            tracking.statusHistory.find((h: any) => h.status === step.key).timestamp
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {tracking.estimatedDeliveryTime && (
              <div className="mt-6 bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Delivery Time</p>
                <p className="text-2xl font-bold text-orange-600">{getEstimatedTime()}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map */}
      {tracking.location && !isCancelled && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Delivery Location</h3>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[tracking.location.latitude, tracking.location.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Delivery Location */}
              <Marker position={[tracking.location.latitude, tracking.location.longitude]}>
                <Popup>Delivery Address</Popup>
              </Marker>

              {/* Driver Location */}
              {tracking.driverLocation && (
                <>
                  <Marker
                    position={[tracking.driverLocation.latitude, tracking.driverLocation.longitude]}
                    icon={new L.Icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    })}
                  >
                    <Popup>Driver Location</Popup>
                  </Marker>
                  
                  {/* Route Line */}
                  <Polyline
                    positions={[
                      [tracking.driverLocation.latitude, tracking.driverLocation.longitude],
                      [tracking.location.latitude, tracking.location.longitude]
                    ]}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};
