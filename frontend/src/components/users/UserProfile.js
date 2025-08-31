import React, { useState } from 'react';

const UserProfile = ({ user, onUserUpdate }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Update profile data when user prop changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

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

  const handleProfileInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      setProfileMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    
    if (!profileData.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Email is required' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setProfileMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileMessage('');

    try {
      const response = await fetch('/api/profile/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditingProfile(false);
        // Notify parent component to refresh user data
        if (onUserUpdate) {
          onUserUpdate();
        }
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditingProfile(false);
    setProfileMessage('');
  };

  return (
    <div className="main-content profile-page">
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-hero-info">
            <h1 className="profile-name">{user?.name || user?.username || 'User'}</h1>
            <div className="profile-badges">
              {user?.authorities?.map(auth => (
                <span key={auth.authority} className="profile-role-badge">
                  {auth.authority?.replace('ROLE_', '')}
                </span>
              ))}
            </div>
            <p className="profile-organization">{user?.organizationName || 'No organization'}</p>
            {!isEditingProfile && (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="btn-primary edit-profile-btn"
              >
                <span>✏️</span> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-grid">
        
          {/* Personal Information Card */}
          <div className="profile-info-card">
            <div className="card-header-modern">
              <div className="card-header-info">
                <span className="card-icon">👤</span>
                <h3>Personal Information</h3>
              </div>
            </div>
            
            <div className="card-content">

              <div className="info-item">
                <span className="info-label">Username</span>
                <span className="info-value username-display">{user?.username || 'Not available'}</span>
              </div>
              
              {!isEditingProfile ? (
                <>
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{user?.name || 'Not available'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{user?.email || 'Not available'}</span>
                  </div>
                </>
              ) : (
                <form onSubmit={handleProfileUpdate} className="edit-form">
                  <div className="form-group-modern">
                    <label htmlFor="profileName">Full Name</label>
                    <input
                      type="text"
                      id="profileName"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group-modern">
                    <label htmlFor="profileEmail">Email Address</label>
                    <input
                      type="email"
                      id="profileEmail"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileInputChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  {profileMessage && (
                    <div className={`modern-alert ${profileMessage.type === 'error' ? 'error' : 'success'}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  
                  <div className="form-actions-modern">
                    <button 
                      type="submit" 
                      className="btn-primary-modern"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? '🔄 Updating...' : '✅ Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary-modern"
                      onClick={cancelProfileEdit}
                      disabled={isUpdatingProfile}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="profile-info-card">
            <div className="card-header-modern">
              <div className="card-header-info">
                <span className="card-icon">💼</span>
                <h3>Professional Information</h3>
              </div>
            </div>
            
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Organization</span>
                <span className="info-value">{user?.organizationName || 'Not assigned to any organization'}</span>
              </div>
              
              {user?.designation && (
                <div className="info-item">
                  <span className="info-label">Designation</span>
                  <span className="info-value">{user.designation}</span>
                </div>
              )}
              
              {user?.specialization && (
                <div className="info-item">
                  <span className="info-label">Specialization</span>
                  <span className="info-value">{user.specialization}</span>
                </div>
              )}
              
              {user?.licenseNumber && (
                <div className="info-item">
                  <span className="info-label">License Number</span>
                  <span className="info-value">{user.licenseNumber}</span>
                </div>
              )}
              
              {user?.portfolioLink && (
                <div className="info-item">
                  <span className="info-label">Portfolio</span>
                  <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="portfolio-link-modern">
                    🔗 View Portfolio
                  </a>
                </div>
              )}
              
              {user?.bio && (
                <div className="info-item bio-item">
                  <span className="info-label">Bio</span>
                  <p className="bio-text-modern">{user.bio}</p>
                </div>
              )}
              
              {!user?.designation && !user?.specialization && !user?.licenseNumber && !user?.portfolioLink && !user?.bio && (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No professional information available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* System Information Card */}
          <div className="profile-info-card">
            <div className="card-header-modern">
              <div className="card-header-info">
                <span className="card-icon">⚙️</span>
                <h3>System Information</h3>
              </div>
            </div>
            
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Account Status</span>
                <span className={`status-badge-modern ${user?.enabled ? 'active' : 'inactive'}`}>
                  {user?.enabled ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

      
        {/* Password Change Section */}
        <div className="profile-info-card password-card">
          <div className="card-header-modern">
            <div className="card-header-info">
              <span className="card-icon">🔒</span>
              <h3>Security Settings</h3>
            </div>
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-secondary-modern"
            >
              {showPasswordForm ? '❌ Cancel' : '🔑 Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <div className="card-content">
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group-modern">
                  <label htmlFor="currentPassword">Current Password</label>
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

                <div className="form-group-modern">
                  <label htmlFor="newPassword">New Password</label>
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

                <div className="form-group-modern">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
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
                  <div className={`modern-alert ${passwordMessage.type === 'error' ? 'error' : 'success'}`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="form-actions-modern">
                  <button 
                    type="submit" 
                    className="btn-primary-modern"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? '🔄 Changing...' : '🔑 Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;