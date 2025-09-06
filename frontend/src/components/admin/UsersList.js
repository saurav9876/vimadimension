import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
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
          fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (togglingStatus) return;
    
    setTogglingStatus(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !currentStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, enabled: !currentStatus }
            : user
        ));
      } else {
        setError(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status');
    } finally {
      setTogglingStatus(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="main-content">
        <div className="loading">Checking authorization...</div>
      </div>
    );
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
      <div className="page-header">
        <h1 className="page-title">All Users</h1>
        <div className="page-actions">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="btn-outline"
          >
            Back to Admin Dashboard
          </button>
          <button 
            onClick={() => navigate('/admin/users/create')} 
            className="btn-primary"
          >
            Create New User
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <h3>{user.name || user.username}</h3>
                <span className={`role-badge ${user.roles.includes('ROLE_ADMIN') ? 'admin' : 'user'}`}>
                  {user.roles.includes('ROLE_ADMIN') ? 'Admin' : 
                   user.roles.includes('ROLE_MANAGER') ? 'Manager' : 'User'}
                </span>
              </div>
              
              <div className="user-details">
                <p><strong>Username:</strong> {user.username}</p>
                {user.email && <p><strong>Email:</strong> {user.email}</p>}
                {user.designation && <p><strong>Designation:</strong> {user.designation}</p>}
                {user.specialization && <p><strong>Specialization:</strong> {user.specialization}</p>}
                {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                    {user.enabled ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              <div className="user-actions">
                <button 
                  onClick={() => navigate(`/admin/users/${user.id}/details`)}
                  className="action-btn view-btn"
                >
                  View
                </button>
                <button 
                  onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                  className="action-btn edit-btn"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleUserStatus(user.id, user.enabled)}
                  className="action-btn toggle-btn"
                  disabled={togglingStatus}
                >
                  {togglingStatus ? 'Toggling...' : user.enabled ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;