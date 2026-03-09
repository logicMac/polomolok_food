import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-white">My Profile</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center text-4xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-black border border-zinc-800 rounded-lg">
              <User className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-semibold text-white">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-black border border-zinc-800 rounded-lg">
              <Mail className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-black border border-zinc-800 rounded-lg">
              <Shield className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="font-semibold capitalize text-white">{user.role}</p>
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-center space-x-4 p-4 bg-black border border-zinc-800 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-400" />
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
