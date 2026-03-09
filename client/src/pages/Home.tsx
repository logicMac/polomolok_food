import { useState, useEffect } from 'react';
import { Food } from '../types';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { Search, Filter } from 'lucide-react';

const Home = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack'];

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [searchTerm, selectedCategory, foods]);

  const fetchFoods = async () => {
    try {
      const response = await api.get('/foods');
      setFoods(response.data.data);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterFoods = () => {
    let filtered = foods;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((food) => food.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
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
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
            />
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-gray-300 border border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Food Grid */}
        {filteredFoods.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No food items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
