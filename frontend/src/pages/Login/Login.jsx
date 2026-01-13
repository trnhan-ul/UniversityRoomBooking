import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './Login.css';
import fptLogo from '../../assets/images/fptlogo.png';
import backgroundImage from '../../assets/images/image.png';
import { login } from '../../services/authService';

const Login = () => {
  // const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation cơ bản
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Invalid email format');
      return;
    }
    
    if (!formData.email.endsWith('@fpt.edu.vn')) {
      alert('Please use FPT University email (@fpt.edu.vn)');
      return;
    }
    
    // Gọi API đăng nhập
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        alert('Login successful!');
        // Chuyển hướng đến trang chủ (hoặc dashboard)
        // navigate('/dashboard');
        console.log('User logged in:', result.data.user);
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      alert(error.message || 'Login failed. Please try again');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={backgroundImage} alt="" className="background-image" />
      
      <div className="login-card">
        <img src={fptLogo} alt="FPT UNIVERSITY" className="logo" />
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="@fpt.edu.vn"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="***********"
            />
          </div>

          <a href="/forgot-password" className="forgot-link">
            Forgot Password?
          </a>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
