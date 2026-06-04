import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Heart, Users, DollarSign, Download, Search, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState({ totalRegistrations: 0, successfulDonationsCount: 0, totalRaised: 0 });
  const [registrations, setRegistrations] = useState([]);
  const [donations, setDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'donations'
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, regRes, donRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get(`/admin/registrations?search=${searchQuery}`),
        api.get('/admin/donations')
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.metrics);
      if (regRes.data.success) setRegistrations(regRes.data.data);
      if (donRes.data.success) setDonations(donRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/registrations/export', { responseType: 'blob' });
      // Create a local download link for the CSV stream
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ngo_registrations.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Navbar */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-emerald-400 fill-emerald-950" />
              <span className="font-bold text-xl tracking-tight">NGO Admin Panel</span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Administrator</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-400">System Administrator</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Metrics Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card: Registrations */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Registrations</p>
              <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalRegistrations}</h4>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card: Raised Funds */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Donations Received</p>
              <h4 className="text-3xl font-extrabold text-slate-900 mt-1">₹{metrics.totalRaised}</h4>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* Card: Success Ratio */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Successful Transactions</p>
              <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.successfulDonationsCount}</h4>
            </div>
            <div className="bg-violet-50 p-3 rounded-lg text-violet-600">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tab Selection & Control Bar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'registrations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Registered Users ({registrations.length})
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'donations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                All Donation Logs ({donations.length})
              </button>
            </div>

            {/* Context Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeTab === 'registrations' && (
                <>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-sm placeholder-slate-400 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">Export CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab content conditional rendering */}
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent"></div>
            </div>
          ) : activeTab === 'registrations' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-150">
                  {registrations.filter(r => r.role !== 'admin').map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{item._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Donor Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stripe Charge / Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-150">
                  {donations.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-slate-800">{item.user?.name || 'Unknown Donor'}</p>
                        <p className="text-xs text-slate-400">{item.user?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                        {item.paymentGatewayPaymentId || item.paymentGatewayOrderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">₹{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'success' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                            <CheckCircle className="h-3 w-3" /> Success
                          </span>
                        )}
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;