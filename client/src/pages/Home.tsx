import { useState, useEffect } from 'react';
import { Food } from '../types';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { FoodFilters, FilterState } from '../components/FoodFilters';
import { ChatSupport } from '../components/ChatSupport';

const Home = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods({});
  }, []);

  const fetchFoods = async (filters: Partial<FilterState>) => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.dietaryTags && filters.dietaryTags.length > 0) {
        params.dietaryTags = filters.dietaryTags.join(',');
      }
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.maxPrepTime) params.maxPrepTime = filters.maxPrepTime;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await api.get('/foods', { params });
      setFoods(response.data.data);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    fetchFoods(filters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-zinc-900 to-black text-white py-20 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Polomolok Food Ordering</h1>
          <p className="text-xl text-gray-300 mb-2">Delicious food delivered to your doorstep</p>
          <p className="text-sm text-gray-500">Service Area: Polomolok Only</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <FoodFilters onFilterChange={handleFilterChange} />

        {/* Food Grid */}
        {foods.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No food items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>

      {/* Chat Support */}
      <ChatSupport />
    </div>
  );
};

export default Home;
