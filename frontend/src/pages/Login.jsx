import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fptLogo from '../../assets/images/fptlogo.png';
import backgroundImage from '../../assets/images/image.png';
import { Button } from '../components/common';
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
    <div className="min-h-screen relative flex items-center justify-center bg-orange-500 overflow-hidden">
      <img 
        src={backgroundImage} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />
      
      <div className="relative z-10 text-center">
        <img 
          src={fptLogo} 
          alt="FPT UNIVERSITY" 
          className="w-[365px] h-[153px] mb-15 object-contain mx-auto" 
        />
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-[500px]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col items-start gap-2">
            <label className="text-white text-lg font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="@fpt.edu.vn"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <label className="text-white text-lg font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="***********"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <a 
            href="/forgot-password" 
            className="text-white text-sm text-right hover:underline"
          >
            Forgot Password?
          </a>

          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
