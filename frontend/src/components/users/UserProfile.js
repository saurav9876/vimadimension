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
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
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
      fetchTodayAttendance();
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

  const fetchTodayAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const response = await fetch('/api/attendance/today', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setTodayAttendance(data.entries);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    } finally {
      setLoadingAttendance(false);
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
        fetchTodayAttendance();
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
        fetchTodayAttendance();
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
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <div className="page-actions">
          {!isEditingProfile && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile Summary Card */}
        <div className="profile-summary">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-summary-info">
            <h2>{user?.name || user?.username || 'User'}</h2>
            <p className="profile-role">
              {user?.authorities?.map(auth => auth.authority?.replace('ROLE_', '')).join(', ') || 'User'}
            </p>
            <p className="profile-org">{user?.organizationName || 'No organization'}</p>
            <span className={`status-badge ${user?.enabled ? 'active' : 'inactive'}`}>
              {user?.enabled ? '✅ Active' : '❌ Inactive'}
            </span>
          </div>
        </div>

        <div className="profile-details">

          {/* Personal Information */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            </div>
            
            {!isEditingProfile ? (
              <div className="info-grid">
                <div className="info-row">
                  <span className="label">Username:</span>
                  <span className="value">{user?.username || 'Not available'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Full Name:</span>
                  <span className="value">{user?.name || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email || 'Not set'}</span>
                </div>
                {user?.bio && (
                  <div className="info-row bio-row">
                    <span className="label">Bio:</span>
                    <p className="bio-text">{user.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="edit-form">
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
                  <label htmlFor="profileBio">Bio</label>
                  <textarea
                    id="profileBio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileInputChange}
                    rows="4"
                    placeholder="Enter your bio (optional)"
                  />
                </div>
                
                {profileMessage && (
                  <div className={`alert ${profileMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                    {profileMessage.text}
                  </div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-outline"
                    onClick={cancelProfileEdit}
                    disabled={isUpdatingProfile}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Professional Information */}
          <div className="detail-section">
            <h3>Professional Information</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="label">Designation:</span>
                <span className="value">{user?.designation || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="label">Specialization:</span>
                <span className="value">{user?.specialization || 'Not set'}</span>
              </div>
              {user?.licenseNumber && (
                <div className="info-row">
                  <span className="label">License:</span>
                  <span className="value">{user.licenseNumber}</span>
                </div>
              )}
              {user?.portfolioLink && (
                <div className="info-row">
                  <span className="label">Portfolio:</span>
                  <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="value-link">
                    View Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Tracking Section */}
          <div className="detail-section">
            <h3>Attendance Tracking</h3>
            
            {/* Current Status */}
            <div className="attendance-status">
              <div className="status-info">
                <div className="status-indicator">
                  <span className={`status-dot ${attendanceStatus.isClockedIn ? 'active' : 'inactive'}`}></span>
                  <span className="status-text">
                    {attendanceStatus.isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                  </span>
                </div>
                {attendanceStatus.lastEntry && (
                  <div className="last-entry">
                    <small>
                      Last {attendanceStatus.lastEntry.entryType === 'CLOCK_IN' ? 'clock in' : 'clock out'}: {' '}
                      {formatTime(attendanceStatus.lastEntry.timestamp)} on {formatDate(attendanceStatus.lastEntry.timestamp)}
                    </small>
                  </div>
                )}
              </div>
              
              <div className="attendance-actions">
                <button
                  onClick={handleClockIn}
                  disabled={attendanceStatus.loading || attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday}
                  className={`btn-attendance ${attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday ? 'disabled' : 'clock-in'}`}
                >
                  {attendanceStatus.loading ? '⏳ Processing...' : 
                   attendanceStatus.hasClockedInToday ? '✅ Already Clocked In' :
                   attendanceStatus.hasClockedOutToday ? '❌ Already Clocked Out' : '🟢 Clock In'}
                </button>
                <button
                  onClick={handleClockOut}
                  disabled={attendanceStatus.loading || !attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday}
                  className={`btn-attendance ${!attendanceStatus.hasClockedInToday || attendanceStatus.hasClockedOutToday ? 'disabled' : 'clock-out'}`}
                >
                  {attendanceStatus.loading ? '⏳ Processing...' : 
                   !attendanceStatus.hasClockedInToday ? '❌ Clock In First' :
                   attendanceStatus.hasClockedOutToday ? '✅ Already Clocked Out' : '🔴 Clock Out'}
                </button>
              </div>
            </div>

            {/* Attendance Message */}
            {attendanceMessage && (
              <div className={`alert ${attendanceMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                {attendanceMessage.text}
              </div>
            )}

            {/* Today's Attendance */}
            <div className="today-attendance">
              <h4>Today's Attendance</h4>
              {loadingAttendance ? (
                <div className="loading-message">Loading today's attendance...</div>
              ) : todayAttendance.length > 0 ? (
                <div className="attendance-log">
                  {todayAttendance.map((entry, index) => (
                    <div key={entry.id || index} className="attendance-entry">
                      <span className={`entry-type ${entry.entryType.toLowerCase().replace('_', '-')}`}>
                        {entry.entryType === 'CLOCK_IN' ? '🟢 Clock In' : '🔴 Clock Out'}
                      </span>
                      <span className="entry-time">{formatTime(entry.timestamp)}</span>
                      {entry.notes && (
                        <span className="entry-notes">📝 {entry.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-attendance">
                  <span>No attendance records for today</span>
                </div>
              )}
            </div>
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