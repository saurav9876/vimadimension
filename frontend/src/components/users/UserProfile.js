import React, { useState, useEffect } from 'react';

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
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Attendance tracking state
  const [attendanceStatus, setAttendanceStatus] = useState({
    isClockedIn: false,
    lastEntry: null,
    loading: false,
    hasClockedInToday: false,
    hasClockedOutToday: false
  });
  const [attendanceMessage, setAttendanceMessage] = useState('');
  
  // Update profile data when user prop changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  // Load attendance status on component mount
  useEffect(() => {
    if (user) {
      fetchAttendanceStatus();
    }
  }, [user]);

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Check today's attendance to determine if user has already clocked in/out
        const today = new Date().toDateString();
        const todayEntries = data.todayEntries || [];
        
        const hasClockedInToday = todayEntries.some(entry => 
          entry.entryType === 'CLOCK_IN' && 
          new Date(entry.timestamp).toDateString() === today
        );
        
        const hasClockedOutToday = todayEntries.some(entry => 
          entry.entryType === 'CLOCK_OUT' && 
          new Date(entry.timestamp).toDateString() === today
        );
        
        setAttendanceStatus({
          isClockedIn: data.isClockedIn,
          lastEntry: data.lastEntry,
          loading: false,
          hasClockedInToday,
          hasClockedOutToday
        });
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    }
  };


  const handleClockIn = async () => {
    // Prevent clock in if already clocked in today
    if (attendanceStatus.hasClockedInToday) {
      setAttendanceMessage({ type: 'error', text: 'You have already clocked in today' });
      return;
    }

    setAttendanceStatus(prev => ({ ...prev, loading: true }));
    setAttendanceMessage('');

    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAttendanceMessage({ type: 'success', text: data.message });
        fetchAttendanceStatus();
      } else {
        setAttendanceMessage({ type: 'error', text: data.message || 'Failed to clock in' });
      }
    } catch (error) {
      console.error('Error clocking in:', error);
      setAttendanceMessage({ type: 'error', text: 'Failed to clock in' });
    } finally {
      setAttendanceStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleClockOut = async () => {
    // Prevent clock out if already clocked out today or never clocked in
    if (attendanceStatus.hasClockedOutToday) {
      setAttendanceMessage({ type: 'error', text: 'You have already clocked out today' });
      return;
    }

    if (!attendanceStatus.hasClockedInToday) {
      setAttendanceMessage({ type: 'error', text: 'You must clock in before clocking out' });
      return;
    }

    setAttendanceStatus(prev => ({ ...prev, loading: true }));
    setAttendanceMessage('');

    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAttendanceMessage({ type: 'success', text: data.message });
        fetchAttendanceStatus();
      } else {
        setAttendanceMessage({ type: 'error', text: data.message || 'Failed to clock out' });
      }
    } catch (error) {
      console.error('Error clocking out:', error);
      setAttendanceMessage({ type: 'error', text: 'Failed to clock out' });
    } finally {
      setAttendanceStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
          email: profileData.email.trim(),
          bio: profileData.bio.trim()
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
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setIsEditingProfile(false);
    setProfileMessage('');
  };

    return (
      <div className="modern-profile-container">
        {/* Modern Profile Header */}
        <div className="modern-profile-header">
          <div className="profile-avatar-section">
            <div className="modern-profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h1 className="modern-profile-name">{user?.name || user?.username || 'User'}</h1>
              <p className="profile-username">@{user?.username || 'username'}</p>
              
              {/* Professional Information */}
              <div className="profile-professional-badges">
                {user?.designation && (
                  <div className="professional-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{user.designation}</span>
                  </div>
                )}
                {user?.specialization && (
                  <div className="professional-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{user.specialization}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="profile-actions-modern">
            <button 
              className="btn-modern-secondary"
              onClick={() => setIsEditingProfile(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </button>
            <button 
              className="btn-modern-outline"
              onClick={() => setShowPasswordForm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Change Password
            </button>
          </div>
        </div>

        {/* Modern Profile Content */}
        <div className="modern-profile-content">
          {/* Personal Information Card */}
          <div className="modern-profile-card">
            <div className="card-header-modern">
              <div className="card-title-section">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>Personal Information</h3>
              </div>
            </div>
            <div className="card-content-modern">
              {!isEditingProfile ? (
                <div className="info-grid-modern">
                  <div className="info-item-modern">
                    <div className="info-label-modern">Username</div>
                    <div className="info-value-modern">{user?.username || 'Not available'}</div>
                  </div>
                  <div className="info-item-modern">
                    <div className="info-label-modern">Full Name</div>
                    <div className="info-value-modern">{user?.name || 'Not set'}</div>
                  </div>
                  <div className="info-item-modern">
                    <div className="info-label-modern">Email</div>
                    <div className="info-value-modern">{user?.email || 'Not set'}</div>
                  </div>
                  {user?.bio && (
                    <div className="info-item-modern bio-item-modern">
                      <div className="info-label-modern">Bio</div>
                      <div className="bio-text-modern">{user.bio}</div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="modern-profile-form">
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
                      className="modern-input"
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
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group-modern">
                    <label htmlFor="profileBio">Bio</label>
                    <textarea
                      id="profileBio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileInputChange}
                      rows="4"
                      placeholder="Enter your bio (optional)"
                      className="modern-textarea"
                    />
                  </div>
                  
                  {profileMessage && (
                    <div className={`modern-message ${profileMessage.type === 'error' ? 'error' : 'success'}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  
                  <div className="form-actions-modern">
                    <button 
                      type="submit" 
                      className="btn-modern-primary"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-modern-outline"
                      onClick={cancelProfileEdit}
                      disabled={isUpdatingProfile}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Attendance Tracking Card */}
          <div className="modern-profile-card">
            <div className="card-header-modern">
              <div className="card-title-section">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <h3>Attendance Tracking</h3>
              </div>
            </div>
            <div className="card-content-modern">
              <div className="attendance-status-modern">
                <div className="status-indicator-modern">
                  <div className={`status-dot-modern ${attendanceStatus.isClockedIn ? 'active' : 'inactive'}`}></div>
                  <div className="status-info-modern">
                    <span className="status-text-modern">
                      {attendanceStatus.isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                    </span>
                    {attendanceStatus.lastEntry && (
                      <span className="last-entry-time-modern">
                        Last {attendanceStatus.lastEntry.entryType === 'CLOCK_IN' ? 'clock in' : 'clock out'}: {' '}
                        {formatTime(attendanceStatus.lastEntry.timestamp)} on {formatDate(attendanceStatus.lastEntry.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="attendance-actions-modern">
                  <button
                    onClick={handleClockIn}
                    disabled={attendanceStatus.loading || attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday}
                    className={`btn-attendance-modern clock-in ${attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday ? 'disabled' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {attendanceStatus.loading ? 'Processing...' : 
                     attendanceStatus.hasClockedInToday ? 'Already Clocked In' :
                     attendanceStatus.hasClockedOutToday ? 'Already Clocked Out' : 'Clock In'}
                  </button>
                  <button
                    onClick={handleClockOut}
                    disabled={attendanceStatus.loading || !attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday}
                    className={`btn-attendance-modern clock-out ${!attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday ? 'disabled' : ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {attendanceStatus.loading ? 'Processing...' : 
                     !attendanceStatus.hasClockedInToday ? 'Clock In First' :
                     attendanceStatus.hasClockedOutToday ? 'Already Clocked Out' : 'Clock Out'}
                  </button>
                </div>
              </div>

              {attendanceMessage && (
                <div className={`modern-message ${attendanceMessage.type === 'error' ? 'error' : 'success'}`}>
                  {attendanceMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Password Change Form - Now shown as modal/overlay */}
      {showPasswordForm && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <div className="password-modal-header">
              <h3>Change Password</h3>
              <button 
                onClick={() => setShowPasswordForm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
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

              <div className="form-group">
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

              <div className="form-group">
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
                <div className={`alert ${passwordMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                  {passwordMessage.text}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;