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
    });
    setImagePreview(`http://localhost:5000${food.image}`);
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Main Course',
      price: '',
      available: true,
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
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Foods</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Food</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div key={food._id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition">
              <img src={`http://localhost:5000${food.image}`} alt={food.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-white">{food.name}</h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{food.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-white">₱{food.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${food.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(food)}
                    className="flex-1 bg-white text-black py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-1 font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="flex-1 bg-red-500/10 text-red-400 border border-red-500/50 py-2 rounded-lg hover:bg-red-500/20 transition flex items-center justify-center space-x-1 font-medium"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingFood ? 'Edit Food' : 'Add New Food'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
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
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
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
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Food Image</label>
                  {imagePreview && (
                    <div className="mb-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 transition"
                    required={!editingFood}
                  />
                  <p className="text-xs text-gray-400 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label className="text-sm font-medium text-gray-300">Available</label>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    {editingFood ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-zinc-700 text-white py-3 rounded-lg hover:bg-zinc-800 transition font-medium"
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
