import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import fptLogo from '../assets/images/fptlogo.png';
import { verifyEmail } from '../services/authService';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const verificationAttempted = useRef(false); // Ngăn double API call trong StrictMode

  const handleVerify = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Email verification failed');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setStatus('error');
      setMessage(err.message || 'Email verification failed. Please try again.');
    }
  };

  useEffect(() => {
    // Ngăn gọi API nhiều lần (do React StrictMode)
    if (verificationAttempted.current) {
      return;
    }
    verificationAttempted.current = true;

    handleVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col font-display">
      
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:px-20 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6C00] p-2 rounded-lg">
            <img src={fptLogo} alt="FPT" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">UniBooking</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-[500px] w-full bg-white rounded-xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
          
          {/* Verifying State */}
          {status === 'verifying' && (
            <>
              <div className="w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-[#136dec]"></div>
              </div>
              <h1 className="text-slate-900 text-2xl font-bold mb-4 text-center">
                Verifying Your Email...
              </h1>
              <p className="text-slate-600 text-center">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="w-40 h-40 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                <span className="material-symbols-outlined text-green-600 text-8xl">check_circle</span>
              </div>
              <h1 className="text-slate-900 text-2xl font-bold mb-4 text-center">
                Email Verified Successfully!
              </h1>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 w-full">
                {message}
              </div>
              <p className="text-slate-600 text-center mb-6">
                Your account has been activated successfully. You can now log in to your account.
              </p>
              <p className="text-slate-500 text-sm text-center mb-6">
                Redirecting to login page in 3 seconds...
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#136dec] hover:bg-[#136dec]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-[#136dec]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">login</span>
                <span>Go to Login</span>
              </button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="w-40 h-40 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-100">
                <span className="material-symbols-outlined text-red-600 text-8xl">error</span>
              </div>
              <h1 className="text-slate-900 text-2xl font-bold mb-4 text-center">
                Verification Failed
              </h1>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 w-full">
                {message}
              </div>
              <p className="text-slate-600 text-center mb-6">
                {message.includes('Network') || message.includes('Server') 
                  ? 'There was a problem connecting to the server. Please try again.'
                  : 'The verification link may be invalid or expired. Please request a new verification email.'}
              </p>
              <div className="w-full flex flex-col gap-3">
                {/* Hiển thị nút Retry nếu là lỗi network/server */}
                {(message.includes('Network') || message.includes('Server') || message.includes('try again')) && (
                  <button
                    onClick={handleVerify}
                    className="w-full bg-[#136dec] hover:bg-[#136dec]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-[#136dec]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Try Again</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/email-verification', { state: { email: null } })}
                  className="w-full bg-[#FF6C00] hover:bg-[#FF6C00]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-[#FF6C00]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">mail</span>
                  <span>Resend Verification Email</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs">
        © 2026 FPT University Room Booking System. All rights reserved.
      </footer>
    </div>
  );
};

export default VerifyEmail;
