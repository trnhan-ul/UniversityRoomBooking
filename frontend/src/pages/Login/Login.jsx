import React, { useState } from 'react';
import './Login.css';
import fptLogo from '../../assets/images/fptlogo.png';
import backgroundImage from '../../assets/images/image.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('Invalid email format');
      return;
    }
    
    console.log('Login submitted:', formData);
    // TODO: Add login API call
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
              placeholder="@example.com"
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

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
