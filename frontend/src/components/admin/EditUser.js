import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    designation: '',
    specialization: '',
    bio: '',
    role: 'ROLE_USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchingUser, setFetchingUser] = useState(true);

  const roles = [
    { value: 'ROLE_USER', label: 'User' },
    { value: 'ROLE_MANAGER', label: 'Manager' },
    { value: 'ROLE_ADMIN', label: 'Admin' }
  ];

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const user = data.user;
          setFormData({
            username: user.username || '',
            name: user.name || '',
            email: user.email || '',
            designation: user.designation || '',
            specialization: user.specialization || '',
            bio: user.bio || '',
            role: user.roles && user.roles.length > 0 ? user.roles[0] : 'ROLE_USER'
          });
        } else {
          setError(data.error || 'Failed to fetch user data');
        }
      } else {
        setError('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    } finally {
      setFetchingUser(false);
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

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          specialization: formData.specialization,
          bio: formData.bio,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Edit User</h1>
        <div className="page-actions">
          <button 
            onClick={() => navigate('/admin/users')} 
            className="btn-outline"
          >
            Back to Users List
          </button>
        </div>
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="form-input disabled"
                placeholder="Username (cannot be changed)"
              />
              <small className="form-help">Username cannot be changed after creation</small>
            </div>

            <div className="form-group">
              <label htmlFor="name">Name *:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="designation">Designation:</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Specialization:</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Enter user bio (optional)"
            />
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
