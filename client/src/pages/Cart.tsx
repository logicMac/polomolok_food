import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
    setShowMap(false);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get location. Please enable location services or use the map.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please use the map to select your location.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const items = cart.map((item) => ({
        foodId: item.food._id,
        quantity: item.quantity,
      }));

      const orderData: any = {
        items,
        deliveryAddress,
        phoneNumber
      };

      if (location) {
        orderData.location = location;
      }

      await api.post('/orders', orderData);
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      console.error('Order error:', err.response?.data);
      
      // Show detailed error messages
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2 text-white">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some delicious food to get started</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.food._id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center space-x-4"
              >
                <img
                  src={`http://localhost:5000${item.food.image}`}
                  alt={item.food.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{item.food.name}</h3>
                  <p className="text-gray-400">₱{item.food.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                    className="p-1.5 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                    className="p-1.5 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.food._id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-white">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₱{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-zinc-800 text-white">
                  <span>Total</span>
                  <span>₱{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    placeholder="09123456789 or +639123456789"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">For delivery coordination</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Delivery Address (Polomolok Only)
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    rows={3}
                    placeholder="Enter your complete address..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Location (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use GPS
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {showMap ? 'Hide Map' : 'Pick on Map'}
                      </button>
                    </div>
                    
                    {showMap && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2">Click on the map to set your delivery location</p>
                        <LocationPicker 
                          onLocationSelect={handleLocationSelect}
                          initialLocation={location || undefined}
                        />
                      </div>
                    )}
                    
                    {location && (
                      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                        <p className="text-xs text-green-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Location set: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Help riders find you easily</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
