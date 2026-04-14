import { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const SecurityStatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]); // Only depend on the actual values

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const response = await api.get(`/security/logs/stats${params.toString() ? '?' + params.toString() : ''}`);
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(error.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="text-gray-400 mt-4">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No statistics available</p>
      </div>
    );
  }

  const successRate = stats?.overview?.total > 0
    ? ((stats.overview.success / stats.overview.total) * 100).toFixed(1)
    : 0;

  // Provide default values if data is missing
  const overview = stats.overview || { total: 0, success: 0, failure: 0, warning: 0 };
  const byType = stats.byType || { auth: 0, crud: 0, security: 0 };
  const topUsers = stats.topUsers || [];
  const topIPs = stats.topIPs || [];
  const recentLogs = stats.recentLogs || [];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 rounded-2xl transition-all duration-300"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {overview.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Events Logged</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/10 group-hover:to-emerald-400/10 rounded-2xl transition-all duration-300"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Success</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {overview.success.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-green-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${successRate}%` }}
                ></div>
              </div>
              <p className="text-sm font-semibold text-green-600">{successRate}%</p>
            </div>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-rose-400/0 group-hover:from-red-400/10 group-hover:to-rose-400/10 rounded-2xl transition-all duration-300"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Failures</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {overview.failure.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Failed Attempts</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-400/0 group-hover:from-yellow-400/10 group-hover:to-amber-400/10 rounded-2xl transition-all duration-300"></div>
          <div className="relative flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wider">Warnings</p>
            </div>
          </div>
          <div className="relative">
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              {overview.warning.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Security Alerts</p>
          </div>
        </div>
      </div>

      {/* Activity by Type */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700/50 rounded-2xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
          Activity by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">Auth</p>
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold">{byType.auth.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Authentication Events</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">CRUD</p>
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold">{byType.crud.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Data Operations</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
            <div className="relative flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">Security</p>
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold">{byType.security.toLocaleString()}</p>
              <p className="text-sm opacity-90 mt-1">Security Events</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Users and IPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Most Active Users</h3>
          {topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.slice(0, 5).map((user, index) => (
                <div key={user._id || index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                    <span className="text-sm font-medium text-white">{user._id || 'Anonymous'}</span>
                  </div>
                  <span className="text-sm text-gray-400">{user.count} events</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No user activity yet</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Most Active IPs</h3>
          {topIPs.length > 0 ? (
            <div className="space-y-3">
              {topIPs.slice(0, 5).map((ip, index) => (
                <div key={ip._id || index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                    <span className="text-sm font-mono text-white">{ip._id}</span>
                  </div>
                  <span className="text-sm text-gray-400">{ip.count} requests</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No IP activity yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 border-zinc-700/50 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        {recentLogs.length > 0 ? (
          <div className="space-y-3">
            {recentLogs.slice(0, 10).map((log) => (
              <div key={log._id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{log.action}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      log.status === 'success' ? 'bg-green-500/20 text-green-300' :
                      log.status === 'failure' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{log.username || 'Anonymous'}</span>
                    <span className="font-mono">{log.ipAddress}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default SecurityStatsTab;
