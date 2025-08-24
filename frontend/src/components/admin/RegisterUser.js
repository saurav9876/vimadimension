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
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="main-content">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/projects')}
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Register New User</h1>
          <p className="page-subtitle">Create a new user account for your organization</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users')} 
          className="btn-outline"
        >
          <span>👥</span>
          View All Users
        </button>
      </div>

      <div className="admin-register-card">
        {/* Message Display */}
        {error && (
          <div className="message error">
            <div className="message-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message success">
            <div className="message-icon">✅</div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-register-form">
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">👤</div>
              <h3>User Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
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
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">🔐</div>
              <h3>Account Security</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Enter password (min 6 characters)"
                />
                <small className="form-help">Minimum 6 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                User Role <span className="required">*</span>
              </label>
              <select
                className="form-input"
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
              <small className="form-help">
                {formData.role === 'ROLE_USER' && 'Standard user with basic access'}
                {formData.role === 'ROLE_MANAGER' && 'Manager with project oversight'}
                {formData.role === 'ROLE_ADMIN' && 'Administrator with full system access'}
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating User...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Register User
                </>
              )}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="info-card">
        <div className="info-header">
          <div className="info-icon">ℹ️</div>
          <h3>Registration Guidelines</h3>
        </div>
        <div className="info-content">
          <ul className="info-list">
            <li>Only administrators can register new users</li>
            <li>New users will be created with 'USER' role by default</li>
            <li>Users can be assigned to projects after registration</li>
            <li>Username must be unique in the system</li>
            <li>Email addresses should be valid and accessible</li>
            <li>Passwords are securely encrypted and stored</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;