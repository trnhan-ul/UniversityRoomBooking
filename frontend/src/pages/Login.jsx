import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fptLogo from '../assets/images/fptlogo.png';
import backgroundImage from '../assets/images/image.png';
import { useAuthContext } from '../context/AuthContext';
import { validateEmail } from '../utils/helpers';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Invalid email format');
      return;
    }
    
    if (!formData.email.endsWith('@fpt.edu.vn')) {
      setError('Please use FPT University email (@fpt.edu.vn)');
      return;
    }
    
    // Login
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again');
      console.error('Login error:', err);
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
        <div className="bg-[#136dec] p-2 rounded-lg text-white">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-[#0d131b]">FPT University</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-full min-h-screen grow flex-col items-center justify-center px-4">
        <div className="flex flex-col w-full max-w-[480px]">
          {/* Login Card */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
            {/* Card Header with Image */}
            <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-40" 
              style={{ backgroundImage: `url(${fptLogo})`, backgroundColor: '#f8f8f8', backgroundSize: 'contain' }}>
              <div className="p-6 bg-gradient-to-t from-white to-transparent">
                <h1 className="text-2xl font-bold text-[#0d131b]">Welcome Back</h1>
                <p className="text-[#4c6c9a] text-sm">Access your campus scheduling dashboard.</p>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col gap-1 py-3">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d131b] text-sm font-medium leading-normal pb-2">Email Address</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. name@fpt.edu.vn"
                      className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-12 placeholder:text-[#4c6c9a] pl-10 pr-4 text-base font-normal"
                    />
                  </div>
                </label>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1 py-3">
                <div className="flex items-center justify-between pb-2">
                  <label className="text-[#0d131b] text-sm font-medium leading-normal">Password</label>
                  <a className="text-[#136dec] text-xs font-medium leading-normal hover:underline" href="/forgot-password">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full min-w-0 flex-1 rounded-lg text-[#0d131b] focus:outline-0 focus:ring-2 focus:ring-[#136dec]/20 border border-[#cfd9e7] bg-white focus:border-[#136dec] h-12 placeholder:text-[#4c6c9a] pl-10 pr-12 text-base font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#136dec] transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <div className="pt-6 pb-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#136dec] hover:bg-[#136dec]/90 transition-all text-white text-base font-bold leading-normal shadow-md shadow-[#136dec]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{loading ? 'Signing in...' : 'Sign In'}</span>
                </button>
              </div>
            </form>

            {/* Registration Footer */}
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 text-center">
              <p className="text-sm text-[#4c6c9a]">
                Don't have an account? 
                <a className="text-[#136dec] font-bold hover:underline ml-1" href="/register">Register now</a>
              </p>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="mt-8 text-center text-slate-500 text-xs">
            <p>© 2024 FPT University Room Booking System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
