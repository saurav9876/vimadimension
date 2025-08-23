import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [passwordChangeModal, setPasswordChangeModal] = useState({ show: false, userId: null, username: '' });
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${passwordChangeModal.userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordChangeModal({ show: false, userId: null, username: '' });
        setNewPassword('');
        // Refresh users list
        fetchUsers();
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const openPasswordChangeModal = (userId, username) => {
    setPasswordChangeModal({ show: true, userId, username });
    setNewPassword('');
    setError('');
  };

  const closePasswordChangeModal = () => {
    setPasswordChangeModal({ show: false, userId: null, username: '' });
    setNewPassword('');
    setError('');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">All Users</h1>
        <button 
          onClick={() => navigate('/admin/users/create')} 
          className="btn-primary"
        >
          Create New User
        </button>
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
                  {user.roles.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
                </span>
              </div>
              
              <div className="user-details">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                    {user.enabled ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              <div className="user-actions">
                <button 
                  onClick={() => openPasswordChangeModal(user.id, user.username)}
                  className="btn-small btn-outline"
                >
                  Change Password
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password Change Modal */}
      {passwordChangeModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Change Password for {passwordChangeModal.username}</h3>
              <button onClick={closePasswordChangeModal} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closePasswordChangeModal}
                  className="btn-outline"
                  disabled={changingPassword}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;