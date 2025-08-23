import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="main-content">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-logo-container">
        <img src="/images/firm-logo.jpeg" alt="Firm Logo" className="firm-logo-img" />
      </div>

      <div className="project-card">
        <h3>User Information</h3>
        
        <div className="form-group">
          <label><strong>Username:</strong></label>
          <p>{user?.username || 'Not available'}</p>
        </div>

        <div className="form-group">
          <label><strong>Email:</strong></label>
          <p>{user?.email || 'Not available'}</p>
        </div>

        <div className="form-group">
          <label><strong>Roles:</strong></label>
          <p>
            {user?.authorities?.map(auth => auth.authority).join(', ') || 'No roles assigned'}
          </p>
        </div>

        <div className="form-group">
          <label><strong>Account Status:</strong></label>
          <p>{user?.enabled ? 'Active' : 'Inactive'}</p>
        </div>

        {user?.lastLogin && (
          <div className="form-group">
            <label><strong>Last Login:</strong></label>
            <p>{new Date(user.lastLogin).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="project-card mt-4">
        <h3>Quick Actions</h3>
        <div className="project-actions">
          <a href="/projects" className="btn-outline">View Projects</a>
          <a href="/projects/new" className="btn-primary">Create Project</a>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;