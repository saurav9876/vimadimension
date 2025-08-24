import React, { useState } from 'react';

const UserProfile = ({ user }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="main-content">
      <h1 className="page-title">My Profile</h1>

      <div className="project-card">
        <h3>User Information</h3>
        
        <div className="form-group">
          <label><strong>Username:</strong></label>
          <p>{user?.username || 'Not available'}</p>
        </div>

        <div className="form-group">
          <label><strong>Full Name:</strong></label>
          <p>{user?.name || 'Not available'}</p>
        </div>

        <div className="form-group">
          <label><strong>Email Address:</strong></label>
          <p>{user?.email || 'Not available'}</p>
        </div>

        <div className="form-group">
          <label><strong>Organization:</strong></label>
          <p>{user?.organizationName || 'Not assigned to any organization'}</p>
        </div>

        {user?.designation && (
          <div className="form-group">
            <label><strong>Designation:</strong></label>
            <p>{user.designation}</p>
          </div>
        )}

        {user?.specialization && (
          <div className="form-group">
            <label><strong>Specialization:</strong></label>
            <p>{user.specialization}</p>
          </div>
        )}

        {user?.bio && (
          <div className="form-group">
            <label><strong>Bio:</strong></label>
            <p>{user.bio}</p>
          </div>
        )}

        <div className="form-group">
          <label><strong>Role:</strong></label>
          <p>
            {user?.authorities?.map(auth => auth.authority?.replace('ROLE_', '')).join(', ') || 'No roles assigned'}
          </p>
        </div>

        <div className="form-group">
          <label><strong>Account Status:</strong></label>
          <p>{user?.enabled ? 'Active' : 'Inactive'}</p>
        </div>

        <div className="form-group">
          <label><strong>User ID:</strong></label>
          <p>{user?.id || 'Not available'}</p>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="project-card">
        <div className="card-header">
          <h3>Change Password</h3>
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="btn-outline"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                placeholder="Confirm new password"
              />
            </div>

            {passwordMessage && (
              <div className={`alert alert-${passwordMessage.type === 'error' ? 'danger' : 'success'}`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;