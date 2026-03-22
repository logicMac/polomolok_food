import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface FoodFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  category: string;
  cuisine: string;
  dietaryTags: string[];
  minPrice: string;
  maxPrice: string;
  maxPrepTime: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const categories = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack'];
const cuisines = ['All', 'Filipino', 'Chinese', 'Japanese', 'Korean', 'Italian', 'American'];
const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'spicy'];

export const FoodFilters: React.FC<FoodFiltersProps> = ({ onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    cuisine: '',
    dietaryTags: [],
    minPrice: '',
    maxPrice: '',
    maxPrepTime: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleDietaryTag = (tag: string) => {
    const newTags = filters.dietaryTags.includes(tag)
      ? filters.dietaryTags.filter(t => t !== tag)
      : [...filters.dietaryTags, tag];
    handleFilterChange('dietaryTags', newTags);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      category: '',
      cuisine: '',
      dietaryTags: [],
      minPrice: '',
      maxPrice: '',
      maxPrepTime: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search food by name, description, or ingredients..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t pt-4 space-y-4">
          {/* Category & Cuisine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine === 'All' ? '' : cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleDietaryTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.dietaryTags.includes(tag)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₱)</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₱)</label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Prep Time (min)</label>
              <Input
                type="number"
                placeholder="60"
                value={filters.maxPrepTime}
                onChange={(e) => handleFilterChange('maxPrepTime', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="preparationTime">Prep Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
