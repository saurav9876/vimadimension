import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateRegistrationForm, getFieldValidation } from '../../utils/validation';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    specialization: '',
    bio: '',
    role: 'ROLE_USER'
  });
  const [fieldErrors, setFieldErrors] = useState({});
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
    const { name, value } = e.target;
    
    // Trim whitespace for username and email fields
    const trimmedValue = (name === 'username' || name === 'email') ? value.trim() : value;
    
    setFormData({
      ...formData,
      [name]: trimmedValue
    });
    
    // Real-time validation
    const validation = getFieldValidation(name, trimmedValue, formData);
    if (!validation.isValid) {
      setFieldErrors({
        ...fieldErrors,
        [name]: validation.message
      });
    } else {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Comprehensive validation
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please fix the validation errors below');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: validation.validatedData.name,
          username: validation.validatedData.username,
          email: validation.validatedData.email,
          password: validation.validatedData.password,
          confirmPassword: validation.validatedData.confirmPassword,
          designation: formData.designation,
          specialization: formData.specialization,
          bio: formData.bio,
          role: formData.role
        })
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
          designation: '',
          specialization: '',
          bio: '',
          role: 'ROLE_USER'
        });
        setFieldErrors({});
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
                  className={`form-input ${fieldErrors.username ? 'error' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoFocus
                  minLength="3"
                  maxLength="20"
                  placeholder="Enter username (3-20 characters, letters, numbers, underscores only)"
                />
                {fieldErrors.username && (
                  <div className="form-error">{fieldErrors.username}</div>
                )}
                <div className="form-help">
                  Username can only contain letters, numbers, and underscores. Cannot start or end with underscore.
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength="50"
                  placeholder="Enter full name"
                />
                {fieldErrors.name && (
                  <div className="form-error">{fieldErrors.name}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength="254"
                placeholder="Enter email address"
              />
              {fieldErrors.email && (
                <div className="form-error">{fieldErrors.email}</div>
              )}
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
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  maxLength="128"
                  placeholder="Enter password (8+ characters with uppercase, lowercase, number, special char)"
                />
                {fieldErrors.password && (
                  <div className="form-error">{fieldErrors.password}</div>
                )}
                <div className="form-help">
                  Must contain: 8+ characters, uppercase letter, lowercase letter, number, and special character
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="8"
                  maxLength="128"
                  placeholder="Confirm password"
                />
                {fieldErrors.confirmPassword && (
                  <div className="form-error">{fieldErrors.confirmPassword}</div>
                )}
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

          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">👔</div>
              <h3>Professional Information</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="designation" className="form-label">
                  Designation
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  maxLength="100"
                  placeholder="e.g., Principal Architect, Project Architect, Draftsperson"
                />
                <div className="form-help">
                  Professional title or position within the organization
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="specialization" className="form-label">
                  Specialization
                </label>
                <input
                  type="text"
                  className="form-input"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  maxLength="100"
                  placeholder="e.g., Sustainable Design, Urban Planning, Interior Architecture"
                />
                <div className="form-help">
                  Area of expertise or specialization
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                className="form-input"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength="500"
                placeholder="Brief professional biography (optional)"
              />
              <div className="form-help">
                A short professional biography or description
              </div>
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