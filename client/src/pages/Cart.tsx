import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import ReCAPTCHA from 'react-google-recaptcha';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

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

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setLoading(false);
      return;
    }

    try {
      const items = cart.map((item) => ({
        foodId: item.food._id,
        quantity: item.quantity,
      }));

      const orderData: any = {
        items,
        deliveryAddress,
        phoneNumber,
        recaptchaToken
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
      
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-block p-8 bg-zinc-900 border border-zinc-800 rounded-2xl mb-6">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Your cart is empty</h2>
          <p className="text-gray-400 mb-8 text-lg">Add some delicious food to get started</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-lg inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-400">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.food._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4 hover:border-zinc-700 transition group"
              >
                <img
                  src={`http://localhost:5000${item.food.image}`}
                  alt={item.food.name}
                  className="w-28 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white mb-1 truncate">{item.food.name}</h3>
                  <p className="text-gray-400 text-lg font-semibold">₱{item.food.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 bg-black border border-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                    className="p-2 text-white hover:bg-zinc-800 rounded-lg transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-white text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                    className="p-2 text-white hover:bg-zinc-800 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.food._id)}
                  className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-white">Order Summary</h2>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-zinc-800">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-green-400">FREE</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-zinc-800">
                <span className="font-bold text-xl text-white">Total</span>
                <span className="text-3xl font-bold text-white">₱{totalPrice.toFixed(2)}</span>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    placeholder="09123456789"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1.5">For delivery coordination</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Delivery Address * <span className="text-gray-500 font-normal">(Polomolok Only)</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition resize-none"
                    rows={3}
                    placeholder="Enter your complete address..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Location <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white hover:bg-zinc-900 hover:border-white transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use GPS
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMap(!showMap)}
                        className="px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white hover:bg-zinc-900 hover:border-white transition flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        {showMap ? 'Hide' : 'Map'}
                      </button>
                    </div>
                    
                    {showMap && (
                      <div className="mt-3 border border-zinc-800 rounded-lg overflow-hidden">
                        <p className="text-xs text-gray-400 p-3 bg-zinc-900">Click on the map to set your delivery location</p>
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
                          Location set successfully
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Help riders find you easily</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* reCAPTCHA */}
                <div className="w-full">
                  <div className="flex justify-center">
                    <div className="transform scale-90 sm:scale-100 origin-center">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={(import.meta as any).env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={handleRecaptchaChange}
                        theme="dark"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !recaptchaToken}
                  className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Placing Order...
                    </span>
                  ) : (
                    'Place Order'
                  )}
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
