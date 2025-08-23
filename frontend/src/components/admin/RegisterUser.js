import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_USER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        const isAdmin = userData.authorities?.some(auth => auth.authority === 'ROLE_ADMIN');
        
        if (isAdmin) {
          setAuthorized(true);
        } else {
          setError('Access denied. Admin privileges required.');
          setTimeout(() => navigate('/projects'), 3000);
        }
      } else {
        setError('Please login to access this page.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed.');
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'username': formData.username,
          'email': formData.email,
          'password': formData.password,
          'confirmPassword': formData.confirmPassword,
          'role': formData.role
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('User registered successfully!');
        // Reset form
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'ROLE_USER'
        });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="main-content">Checking permissions...</div>;
  }

  if (!authorized) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Register New User</h1>
        <button 
          onClick={() => navigate('/admin/users')} 
          className="btn-small btn-outline"
        >
          View All Users
        </button>
      </div>

      <div className="project-card">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
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
              minLength="3"
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
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
              minLength="6"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Confirm password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="ROLE_USER">User</option>
              <option value="ROLE_MANAGER">Manager</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register User'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="project-card mt-4">
        <h3>Registration Notes</h3>
        <ul>
          <li>Only administrators can register new users</li>
          <li>New users will be created with 'USER' role by default</li>
          <li>Users can be assigned to projects after registration</li>
          <li>Username must be unique in the system</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterUser;