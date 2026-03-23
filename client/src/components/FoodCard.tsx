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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all duration-300 group">
      <div className="aspect-video bg-zinc-800 overflow-hidden">
        <img
          src={getImageUrl(food.image)}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{food.name}</h3>
          <span className="text-xs bg-white text-black px-2 py-1 rounded font-medium">
            {food.category}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{food.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-white">₱{food.price.toFixed(2)}</span>
          {!isAdmin && food.available && (
            <button
              onClick={handleAddToCart}
              className="bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          {!food.available && (
            <span className="text-sm text-red-400 font-semibold">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
