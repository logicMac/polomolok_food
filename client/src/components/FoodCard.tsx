import { Plus } from 'lucide-react';
import { Food } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface FoodCardProps {
  food: Food;
}

const FoodCard = ({ food }: FoodCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Construct proper image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Construct URL with API base
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdmin) return;
    addToCart(food);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-white transition-all duration-300 group hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
      <div className="aspect-[4/3] bg-zinc-800 overflow-hidden relative">
        <img
          src={getImageUrl(food.image)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {!food.available && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Unavailable</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-semibold shadow-lg">
            {food.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-gray-200 transition">
          {food.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {food.description}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <div>
            <span className="text-2xl font-bold text-white">₱{food.price.toFixed(2)}</span>
            {food.prepTime && (
              <p className="text-xs text-gray-500 mt-1">⏱️ {food.prepTime} mins</p>
            )}
          </div>
          {!isAdmin && food.available && (
            <button
              onClick={handleAddToCart}
              className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition-all hover:scale-110 active:scale-95 shadow-lg"
              title="Add to cart"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
