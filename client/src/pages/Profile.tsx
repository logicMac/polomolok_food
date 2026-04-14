import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden py-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent animate-slide-down">My Profile</h1>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all duration-300 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-white to-gray-200 text-black rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-black transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-semibold text-white">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-black transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-black transition-all duration-300 group">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="font-semibold capitalize text-white">{user.role}</p>
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-center space-x-4 p-4 bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-black transition-all duration-300 group">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-semibold text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
