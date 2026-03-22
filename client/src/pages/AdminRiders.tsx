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
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Riders Management</h1>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Rider
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((rider) => (
            <div key={rider._id || rider.userId} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                    {rider.image ? (
                      <img
                        src={`http://localhost:5000${rider.image}`}
                        alt={rider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Bike className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{rider.name}</h3>
                    <p className="text-sm text-gray-400">{rider.email}</p>
                  </div>
                </div>
                {rider.isAvailable ? (
                  <UserCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <UserX className="w-5 h-5 text-red-400" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Phone:</span> {rider.phoneNumber || 'N/A'}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Vehicle:</span> {rider.vehicleType || 'N/A'}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Plate:</span> {rider.vehicleNumber || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    rider.isAvailable
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {rider.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => openModal(rider)}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(rider._id || rider.userId || '')}
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {riders.length === 0 && (
          <div className="text-center py-20">
            <Bike className="w-24 h-24 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold mb-2 text-white">No riders yet</h2>
            <p className="text-gray-400 mb-6">Add your first rider to start managing deliveries</p>
            <Button onClick={() => openModal()}>
              <Plus className="w-5 h-5 mr-2" />
              Add Rider
            </Button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full border border-zinc-800">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingRider ? 'Edit Rider' : 'Add New Rider'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    disabled={!!editingRider}
                  />
                </div>

                {!editingRider && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required={!editingRider}
                      minLength={8}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="motorcycle">Motorcycle</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                    <option value="scooter">Scooter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-black text-white border border-zinc-700 rounded-lg hover:bg-zinc-900 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    {editingRider ? 'Update' : 'Create'} Rider
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
