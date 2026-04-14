import { useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { Bike, Plus, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '../components/ui/Button';

const AdminRiders = () => {
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRider, setEditingRider] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    vehicleType: 'motorcycle' as 'motorcycle' | 'bicycle' | 'car' | 'scooter',
    vehicleNumber: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const response = await api.get('/riders');
      setRiders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch riders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      if (formData.password) submitData.append('password', formData.password);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('vehicleType', formData.vehicleType);
      submitData.append('vehicleNumber', formData.vehicleNumber);
      if (formData.image) submitData.append('image', formData.image);

      if (editingRider) {
        await api.put(`/riders/${editingRider._id || editingRider.userId}`, submitData);
      } else {
        await api.post('/riders', submitData);
      }
      fetchRiders();
      closeModal();
    } catch (error: any) {
      console.error('Error submitting rider:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rider?')) return;
    try {
      await api.delete(`/riders/${id}`);
      fetchRiders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete rider');
    }
  };

  const openModal = (rider?: User) => {
    if (rider) {
      setEditingRider(rider);
      setFormData({
        name: rider.name,
        email: rider.email,
        password: '',
        phoneNumber: rider.phoneNumber || '',
        vehicleType: rider.vehicleType || 'motorcycle',
        vehicleNumber: rider.vehicleNumber || '',
        image: null
      });
      setImagePreview('');
    } else {
      setEditingRider(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        vehicleType: 'motorcycle',
        vehicleNumber: '',
        image: null
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRider(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden py-8 sm:py-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 lg:mb-12 animate-slide-down">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">Riders Management</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your delivery team</p>
          </div>
          <Button 
            onClick={() => openModal()} 
            className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 shadow-lg overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-red-500/0 to-orange-500/0 group-hover:from-orange-500/20 group-hover:via-red-500/20 group-hover:to-orange-500/20 transition-all duration-500"></div>
            <span className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Rider
            </span>
          </Button>
        </div>

        {/* Riders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animation-delay-200">
          {riders.map((rider) => (
            <div 
              key={rider._id || rider.userId} 
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 hover:shadow-xl hover:shadow-white/5 group"
            >
              {/* Header with Avatar and Status */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-zinc-800 group-hover:ring-white group-hover:scale-110 transition-all duration-300 shadow-lg">
                      {rider.image ? (
                        <img
                          src={`http://localhost:5000${rider.image}`}
                          alt={rider.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Bike className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 ${
                      rider.isAvailable ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition">{rider.name}</h3>
                    <p className="text-sm text-gray-400">{rider.email}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-white font-medium">{rider.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Bike className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="text-white font-medium capitalize">{rider.vehicleType || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Plate Number</p>
                    <p className="text-white font-medium">{rider.vehicleNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    {rider.isAvailable ? (
                      <UserCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <UserX className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      rider.isAvailable
                        ? 'bg-green-500/10 text-green-400 border border-green-500/50'
                        : 'bg-red-500/10 text-red-400 border border-red-500/50'
                    }`}>
                      {rider.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => openModal(rider)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 bg-black border-zinc-800 hover:border-white hover:bg-zinc-900 text-white py-2.5 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(rider._id || rider.userId || '')}
                  variant="destructive"
                  className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 py-2.5 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {riders.length === 0 && (
          <div className="text-center py-32 animate-scale-in">
            <div className="inline-block p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl mb-6 hover:scale-110 transition-transform duration-300">
              <Bike className="w-24 h-24 mx-auto text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">No riders yet</h2>
            <p className="text-gray-400 mb-8 text-lg">Add your first rider to start managing deliveries</p>
            <Button 
              onClick={() => openModal()}
              className="relative bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 shadow-lg inline-flex items-center gap-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-red-500/0 to-orange-500/0 group-hover:from-orange-500/20 group-hover:via-red-500/20 group-hover:to-orange-500/20 transition-all duration-500"></div>
              <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Rider
              </span>
            </Button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-md w-full border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {editingRider ? 'Edit Rider' : 'Add New Rider'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <Bike className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 file:cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition disabled:opacity-50"
                    placeholder="rider@example.com"
                    required
                    disabled={!!editingRider}
                  />
                  {editingRider && (
                    <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed</p>
                  )}
                </div>

                {!editingRider && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
                      placeholder="••••••••"
                      required={!editingRider}
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Minimum 8 characters</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
                    placeholder="09123456789"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white transition"
                    required
                  >
                    <option value="motorcycle">Motorcycle</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Vehicle Number *</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition"
                    placeholder="ABC-1234"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-3 bg-black text-white border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:border-white transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 font-bold shadow-lg"
                  >
                    {editingRider ? 'Update' : 'Create'}
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

export default AdminRiders;
