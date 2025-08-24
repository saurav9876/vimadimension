import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login for user:', formData.username);
      
      // Use the API endpoint for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
        credentials: 'include'
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      if (response.ok) {
        const loginData = await response.json();
        console.log('Login successful:', loginData);
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get user info and call onLogin
        console.log('Fetching user status...');
        const userResponse = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        console.log('User status response status:', userResponse.status);
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data received:', userData);
          onLogin(userData);
        } else {
          console.error('Failed to get user status:', userResponse.status);
          setError('Login successful but failed to get user information. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo-container text-center mb-4">
          <img 
                                src="/images/firm-logo.jpg" 
            alt="VIMA - The Dimension Logo" 
            style={{ maxHeight: '100px', width: 'auto' }}
            className="mb-3"
          />
          <h2 className="text-primary mb-4">VIMA - THE DIMENSION</h2>
        </div>

        <h1>Login</h1>

        {(error || searchParams.get('error')) && (
          <div className="alert alert-danger">
            {error || 'Invalid username or password.'}
          </div>
        )}

        {searchParams.get('logout') && (
          <div className="alert alert-success">
            You have been logged out.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <button type="submit" className="btn-primary">Sign In</button>
          </div>
        </form>

        <div className="options-link">
          <p>Don't have an account? Contact your organization administrator to get access.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;