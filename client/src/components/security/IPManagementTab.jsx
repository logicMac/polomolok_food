import { useState, useEffect } from 'react';
import { Ban, X } from 'lucide-react';
import api from '../../services/api';

const IPManagementTab = () => {
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [accessIPs, setAccessIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('blocked');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    ipAddress: '',
    reason: '',
    duration: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeView === 'blocked') {
        const response = await api.get('/security/ips/blocked');
        setBlockedIPs(response.data.data.blockedIPs);
      } else {
        const response = await api.get('/security/ips/access');
        setAccessIPs(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch IP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (e) => {
    e.preventDefault();
    try {
      await api.post('/security/ips/block', blockForm);
      setShowBlockModal(false);
      setBlockForm({ ipAddress: '', reason: '', duration: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to block IP');
    }
  };

  const handleUnblockIP = async (id) => {
    if (!confirm('Are you sure you want to unblock this IP address?')) return;
    
    try {
      await api.put(`/security/ips/unblock/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unblock IP');
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('blocked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'blocked'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            }`}
          >
            Blocked IPs
          </button>
          <button
            onClick={() => setActiveView('access')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'access'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            }`}
          >
            Access History
          </button>
        </div>

        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-red-500/50"
        >
          <Ban className="w-4 h-4" />
          Block IP
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : activeView === 'blocked' ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Blocked By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Blocked At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900/50 divide-y divide-zinc-800">
              {blockedIPs.map((ip) => (
                <tr key={ip._id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-white">{ip.ipAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{ip.reason}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{ip.blockedByUsername}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {new Date(ip.blockedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ip.autoBlocked ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {ip.autoBlocked ? 'Auto' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleUnblockIP(ip._id)}
                      className="text-green-400 hover:text-green-300 font-medium transition-colors"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Requests</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Success / Failure</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last Access</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900/50 divide-y divide-zinc-800">
              {accessIPs.map((ip) => (
                <tr key={ip._id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-white">{ip._id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{ip.totalRequests}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="text-green-400">{ip.successCount}</span> / 
                    <span className="text-red-400 ml-1">{ip.failureCount}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(ip.riskLevel)}`}>
                      {ip.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                    {new Date(ip.lastAccess).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {ip.isBlocked ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Block IP Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Block IP Address</h3>
              <button onClick={() => setShowBlockModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlockIP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={blockForm.ipAddress}
                  onChange={(e) => setBlockForm({ ...blockForm, ipAddress: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                <textarea
                  required
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Reason for blocking this IP..."
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Duration (hours, optional)</label>
                <input
                  type="number"
                  value={blockForm.duration}
                  onChange={(e) => setBlockForm({ ...blockForm, duration: e.target.value })}
                  placeholder="Leave empty for permanent"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
                >
                  Block IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPManagementTab;
