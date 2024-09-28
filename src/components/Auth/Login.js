import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(''); // Add this line

  useEffect(() => {
    if (loginSuccess) {
      console.log('Login success, isAdmin:', isAdmin);
      if (isAdmin) {
        console.log('Navigating to admin dashboard');
        navigate('/admin');
      } else {
        console.log('Navigating to user dashboard');
        navigate('/user');
      }
    }
  }, [loginSuccess, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login for:', username);
      const response = await axios.post('/api/login', { username, password });
      console.log('Login response:', response.data);
      
      const isAdmin = response.data.isAdmin === true || response.data.isAdmin === 1;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('isAdmin', isAdmin);
      
      console.log('isAdmin value:', isAdmin);
      setIsAdmin(isAdmin);
      setLoginSuccess(true);
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>} {/* Add this line to display the error */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;

