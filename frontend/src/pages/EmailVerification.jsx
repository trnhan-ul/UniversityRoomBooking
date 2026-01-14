import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import fptLogo from '../assets/images/fptlogo.png';
import { resendVerificationEmail } from '../services/authService';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) {
      setError('Email not found. Please register again.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setError(result.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ fontFamily: 'Lexend, sans-serif' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#f6f7f8]" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:px-20 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6C00] p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">UniBooking</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="max-w-[500px] w-full bg-white rounded-xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
          
          {/* Icon Circle */}
          <div className="relative w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-8 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-[#136dec] to-transparent"></div>
            <span className="material-symbols-outlined text-[#136dec] text-7xl relative z-10">mail</span>
            <div className="absolute top-4 right-4 size-4 bg-[#136dec] rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-8 size-2 bg-[#136dec]/40 rounded-full"></div>
          </div>

          {/* Title */}
          <h1 className="text-slate-900 text-3xl font-bold mb-4 text-center tracking-tight">
            Check your inbox
          </h1>

          {/* Email Badge */}
          <div className="bg-blue-50 px-4 py-2 rounded-lg mb-6">
            <p className="text-[#136dec] text-sm font-semibold">
              {email || 'your email'}
            </p>
          </div>

          {/* Body Text */}
          <div className="text-center max-w-sm mb-6">
            <p className="text-slate-600 text-base leading-relaxed">
              We've sent a verification link to your email address. Please click the link to activate your University Room Booking account and start reserving your space.
            </p>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 w-full flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{message}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 w-full flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3 mb-6">
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full bg-[#136dec] hover:bg-[#136dec]/90 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-[#136dec]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-loaded"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              Back to Login
            </button>
          </div>

          {/* Tertiary Links */}
          <div className="pt-6 border-t border-slate-100 w-full flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs">Didn't receive the email?</p>
            <p className="text-slate-600 text-sm text-center">
              Check your spam folder or use the resend button above.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-400 text-xs">
        © 2026 FPT University Room Booking System. All rights reserved.
      </footer>
    </div>
  );
};

export default EmailVerification;
