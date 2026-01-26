import React, { useState } from 'react';
import api from '../api';
import { useGlobalContext } from '../context/AppContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, triggerError } = useGlobalContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };
////
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Call your Node.js backend
      const res = await api.post('/auth/login', credentials);
      
      // 2. Store the JWT token for the api.js interceptor
      localStorage.setItem('token', res.data.token);
      
      // 3. Update the Global Context (sets user and isAdmin flag)
      login(res.data.user);
    } catch (err) {
      // If server is off or login fails, trigger the 231-878-0753 status
      triggerError(err.response?.data?.message || "Connection Refused");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h1>SYSTEM ACCESS</h1>
        <p>Please enter your architect credentials</p>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            value={credentials.username} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Warren"
          />
        </div>
        
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            value={credentials.password} 
            onChange={handleChange} 
            required 
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "AUTHENTICATING..." : "LOGIN"}
        </button>
      </form>
    </div>
  );
};

export default Login;