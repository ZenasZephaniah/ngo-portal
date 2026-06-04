import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

const DonationStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  const donationId = searchParams.get('donation_id');
  const sessionId = searchParams.get('session_id');
  const mockSuccess = searchParams.get('mockSuccess');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (canceled === 'true') {
          // If canceled parameter is active, set state immediately
          setStatus('failed');
          await api.post('/donations/verify', { donationId, mockSuccess: false });
          return;
        }

        // Send parameters to backend verification API
        const response = await api.post('/donations/verify', {
          donationId,
          sessionId,
          mockSuccess: mockSuccess === 'true'
        });

        if (response.data.success && response.data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        setStatus('failed');
      }
    };

    if (donationId) {
      verifyPayment();
    }
  }, [donationId, sessionId, mockSuccess, canceled]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center space-y-6">
        
        {status === 'processing' && (
          <div className="py-8 space-y-4">
            <Loader2 className="h-16 w-16 text-emerald-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Payment...</h2>
            <p className="text-sm text-slate-500">Checking sandbox gateway confirmation</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto fill-emerald-50" />
            <h2 className="text-2xl font-bold text-slate-800">Donation Complete!</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Thank you for your generous contribution. The sandbox transaction has been confirmed, and your support record has been logged safely.
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-6 space-y-4">
            <XCircle className="h-20 w-20 text-red-500 mx-auto fill-red-50" />
            <h2 className="text-2xl font-bold text-slate-800">Payment Failed</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We couldn't confirm your transaction. If this was a canceled sandbox run, your user registration is completely safe. You can retry at any time.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/user/dashboard')}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default DonationStatus;