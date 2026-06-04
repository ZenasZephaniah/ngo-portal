import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LogOut, Heart, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [amount, setAmount] = useState('');
  const [donations, setDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Fetch the user's past donations on dashboard load
  const fetchDonationHistory = async () => {
    try {
      const response = await api.get('/donations/my-donations');
      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching donations', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  // Handle Donation Initiation
  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Create order / checkout session on backend
      const response = await api.post('/donations/create-checkout-session', { amount: Number(amount) });
      
      if (response.data.success) {
        if (response.data.mockMode) {
          // If no Stripe key is set, simulate a redirect immediately to test database states
          navigate(`/donation-status?donation_id=${response.data.donationId}&mockSuccess=true`);
        } else if (response.data.url) {
          // If Stripe key is configured, redirect user directly to Stripe's secure checkout page
          window.location.href = response.data.url;
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to initiate donation process.');
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-emerald-500 fill-emerald-50" />
              <span className="font-bold text-xl text-slate-800">NGO Support Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column: User info & Donation Form */}
          <div className="lg:col-span-1 space-y-8">
            {/* User Profile Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Registration Profile</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-xs text-slate-400 font-semibold tracking-wider uppercase">User ID</span>
                  <span className="text-sm text-slate-700 font-mono">{user?.id}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold tracking-wider uppercase">Registration Name</span>
                  <span className="text-sm text-slate-700 font-medium">{user?.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold tracking-wider uppercase">Contact Email</span>
                  <span className="text-sm text-slate-700">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Donation Action Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Support a Cause</h3>
              <p className="text-sm text-slate-500 mb-6">Your contribution impacts hundreds of families directly.</p>

              {errorMessage && (
                <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-600">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleDonateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Donation Amount (INR)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-400 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      required
                      min="10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
                >
                  <CreditCard className="h-4 w-4" />
                  {isSubmitting ? 'Initiating...' : 'Donate Now'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Donation History Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">Your Donation History</h3>
                <span className="text-xs text-slate-500 font-medium">Tracks all attempts</span>
              </div>

              {loadingHistory ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent"></div>
                </div>
              ) : donations.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm">No donations logged yet. Fill out the form to support us!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID / Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-150">
                      {donations.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                            {item.paymentGatewayPaymentId || item.paymentGatewayOrderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                            ₹{item.amount}
                          </td>
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
          </div>

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;