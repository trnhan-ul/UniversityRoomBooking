import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fptLogo from '../assets/images/fptlogo.png';
import backgroundImage from '../assets/images/image.png';
import { register } from '../services/authService';
import { validateEmail } from '../utils/helpers';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Validate required fields
    if (!formData.full_name || !formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    
    // 2. Validate full name format
    if (formData.full_name.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (formData.full_name.trim().length > 100) {
      setError('Full name is too long (maximum 100 characters)');
      return;
    }

    // Check if name contains only valid characters (letters, spaces, Vietnamese characters)
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.full_name.trim())) {
      setError('Full name should only contain letters and spaces');
      return;
    }
    
    // 3. Validate email format
    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      return;
    }
    
    if (!formData.email.endsWith('@fpt.edu.vn')) {
      setError('Please use FPT University email (@fpt.edu.vn)');
      return;
    }

    // 4. Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password.length > 50) {
      setError('Password is too long (maximum 50 characters)');
      return;
    }

    // Check password complexity (optional: at least one letter and one number)
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      setError('Password must contain at least one letter and one number');
      return;
    }

    // 5. Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // 6. Validate phone number if provided
    if (formData.phone_number && formData.phone_number.trim() !== '') {
      const cleanPhone = formData.phone_number.replace(/\s/g, '');
      
      // Check if contains only digits
      if (!/^[0-9]+$/.test(cleanPhone)) {
        setError('Phone number must contain only digits');
        return;
      }

      // Check length
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        setError('Phone number must be 10-11 digits');
        return;
      }

      // Check Vietnamese phone format (starts with 0)
      if (!cleanPhone.startsWith('0')) {
        setError('Phone number must start with 0');
        return;
      }
    }
    
    // Register
    setLoading(true);
    try {
      const result = await register(
        formData.email, 
        formData.password, 
        formData.full_name,
        formData.phone_number || null
      );
      
      if (result.success) {
        // Chuyển đến trang EmailVerification với email
        navigate('/email-verification', { 
          state: { email: formData.email } 
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden" style={{ fontFamily: 'Lexend, sans-serif' }}>
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url(${backgroundImage})`
        }}
      />
      
      {/* Header Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <div className="bg-[#FF6C00] p-2 rounded-lg text-white">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0d131b]">FPT University</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full min-h-screen grow flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col w-full max-w-[520px]">
          {/* Register Card */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
            {/* Card Header with Image */}
            <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-32" 
              style={{ backgroundImage: `url(${fptLogo})`, backgroundColor: '#f8f8f8', backgroundSize: 'contain' }}>
              <div className="p-4 bg-gradient-to-t from-white to-transparent">
                <h1 className="text-xl font-bold text-[#0d131b]">Create Account</h1>
                <p className="text-[#4c6c9a] text-sm">Join the University Room Booking System</p>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Full Name Field */}
              <div className="flex flex-col gap-1 py-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">
                    Full Name <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-11 placeholder:text-slate-400 pl-10 pr-4 text-base font-normal"
                    />
                  </div>
                </label>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1 py-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">
                    FPT Email <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="yourname@fpt.edu.vn"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-11 placeholder:text-slate-400 pl-10 pr-4 text-base font-normal"
                    />
                  </div>
                </label>
              </div>

              {/* Phone Number Field */}
              <div className="flex flex-col gap-1 py-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">
                    Phone Number <span className="text-slate-400">(Optional)</span>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">phone</span>
                    </div>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="0123456789"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-11 placeholder:text-slate-400 pl-10 pr-4 text-base font-normal"
                    />
                  </div>
                </label>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1 py-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">
                    Password <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-11 placeholder:text-slate-400 pl-10 pr-12 text-base font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#136dec]"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-1 py-2">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">lock_reset</span>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-11 placeholder:text-slate-400 pl-10 pr-12 text-base font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#136dec]"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-3 pb-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#136dec] hover:bg-[#136dec]/90 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg shadow-[#136dec]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">person_add</span>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="pt-4 text-center border-t border-slate-200 mt-2">
                <p className="text-sm text-[#4c6c9a]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#136dec] hover:text-[#136dec]/80 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
