import { useState, useEffect } from 'react';
import { Food } from '../types';
import api from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const AdminFoods = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    price: '',
    available: true,
    trackInventory: false,
    stock: '0',
    lowStockThreshold: '10',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchFoods();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('available', formData.available.toString());
      formDataToSend.append('trackInventory', formData.trackInventory.toString());
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('lowStockThreshold', formData.lowStockThreshold);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (!editingFood) {
        alert('Please select an image');
        return;
      }

      if (editingFood) {
        await api.put(`/foods/${editingFood._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/foods', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchFoods();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.delete(`/foods/${id}`);
      fetchFoods();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      category: food.category,
      price: food.price.toString(),
      available: food.available,
      trackInventory: food.trackInventory || false,
      stock: (food.stock || 0).toString(),
      lowStockThreshold: (food.lowStockThreshold || 10).toString(),
    });
    setImagePreview(getImageUrl(food.image));
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/${cleanPath}`;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Main Course',
      price: '',
      available: true,
      trackInventory: false,
      stock: '0',
      lowStockThreshold: '10',
    });
    setImageFile(null);
    setImagePreview('');
    setEditingFood(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-8 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400">
            Manage Foods
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Food</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food, index) => (
            <div 
              key={food._id} 
              className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 animate-fadeInUp"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="relative overflow-hidden group">
                <img 
                  src={getImageUrl(food.image)} 
                  alt={food.name} 
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-white">{food.name}</h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{food.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    ₱{food.price.toFixed(2)}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-lg font-medium transition-all duration-300 ${
                    food.available 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20' 
                      : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20'
                  }`}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(food)}
                    className="flex-1 relative py-2 rounded-lg font-medium overflow-hidden group transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-1 text-white">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="flex-1 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/50 py-2 rounded-lg hover:from-red-500/30 hover:to-rose-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-1 font-medium shadow-lg shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  {editingFood ? 'Edit Food' : 'Add New Food'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  >
                    <option>Appetizer</option>
                    <option>Main Course</option>
                    <option>Dessert</option>
                    <option>Beverage</option>
                    <option>Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Food Image</label>
                  {imagePreview && (
                    <div className="mb-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-zinc-700" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-600 file:to-red-600 file:text-white hover:file:from-orange-500 hover:file:to-red-500 transition"
                    required={!editingFood}
                  />
                  <p className="text-xs text-gray-400 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-300">Available</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.trackInventory}
                    onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-300">Track Inventory</label>
                </div>
                {formData.trackInventory && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Stock Quantity</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                        className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this number</p>
                    </div>
                  </>
                )}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 relative py-3 rounded-lg font-semibold overflow-hidden group transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <span className="relative text-white">{editingFood ? 'Update' : 'Create'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-zinc-700 text-white py-3 rounded-lg hover:bg-zinc-800 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFoods;
