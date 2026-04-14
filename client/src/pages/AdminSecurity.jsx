import { useState } from 'react';
import { Shield, Activity, Ban, Sparkles } from 'lucide-react';
import ActivityLogsTab from '../components/security/ActivityLogsTab';
import IPManagementTab from '../components/security/IPManagementTab';
import SecurityStatsTab from '../components/security/SecurityStatsTab';

const AdminSecurity = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', label: 'Overview', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { id: 'logs', label: 'Activity Logs', icon: Shield, color: 'from-purple-500 to-pink-500' },
    { id: 'ips', label: 'IP Management', icon: Ban, color: 'from-red-500 to-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Security & Monitoring
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Real-time system protection and activity tracking
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-700/50 mb-6 overflow-hidden">
          <div className="border-b border-zinc-700/50">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-8 py-5 font-medium text-sm
                      transition-all duration-300 flex-1 group
                      ${
                        activeTab === tab.id
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-200'
                      }
                    `}
                  >
                    {activeTab === tab.id && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-10`}></div>
                    )}
                    <div className={`
                      relative p-2 rounded-lg transition-all duration-300
                      ${activeTab === tab.id 
                        ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                        : 'bg-zinc-800 group-hover:bg-zinc-700'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className="relative">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color}`}></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content with Animation */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-700/50 p-8 animate-fadeIn">
          {activeTab === 'stats' && <SecurityStatsTab />}
          {activeTab === 'logs' && <ActivityLogsTab />}
          {activeTab === 'ips' && <IPManagementTab />}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminSecurity;
