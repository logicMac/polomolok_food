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
      {/* Compact Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-lg bg-zinc-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Browse Menu</h1>
              <p className="text-sm text-gray-400 mt-0.5">Polomolok Food Delivery</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-black px-4 py-2 rounded-lg border border-zinc-800">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-300">Polomolok Area</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <FoodFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Results Header */}
        {foods.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm sm:text-base">
                <span className="text-white font-semibold text-lg">{foods.length}</span> {foods.length === 1 ? 'dish' : 'dishes'} available
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Fast Delivery</span>
            </div>
          </div>
        )}

        {/* Food Grid */}
        {foods.length === 0 ? (
          <div className="text-center py-20 sm:py-32">
            <div className="inline-block p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-2xl mb-4 sm:mb-6">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-lg sm:text-xl text-gray-400 mb-2">No dishes found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {foods.map((food, index) => (
              <div 
                key={food._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        )}

        {/* Quick Info Banner */}
        {foods.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Fast Delivery</p>
                <p className="text-gray-400 text-xs">30-45 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Quality Food</p>
                <p className="text-gray-400 text-xs">Fresh ingredients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">24/7 Support</p>
                <p className="text-gray-400 text-xs">We're here to help</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Support */}
      <ChatSupport />
    </div>
  );
};

export default Home;
