import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  const hasRole = (role) => {
    return user?.authorities?.some(auth => auth.authority === role);
  };

  const isAdmin = () => {
    return hasRole('ROLE_ADMIN');
  };

  // Get organization name from user data
  const getOrganizationName = () => {
    if (user?.organizationName) {
      return user.organizationName;
    }
    // Fallback to username if no organization name
    return user?.username || 'User';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="https://www.vimathedimension.com/" className="navbar-brand" target="_blank" rel="noopener noreferrer">
                          <img src="/images/firm-logo.jpg" alt="Organization Logo" className="navbar-logo" />
          <span className="navbar-brand-text">{getOrganizationName()}</span>
        </a>
        <ul className="navbar-nav">
          <li>
            <Link to="/profile" className="nav-link">My Profile</Link>
          </li>
          <li>
            <Link to="/projects" className="nav-link">Projects</Link>
          </li>
          {isAdmin() && (
            <li>
              <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
            </li>
          )}
        </ul>
        <button onClick={handleLogout} className="logout-button">
          Logout ({user?.username || 'User'})
        </button>
      </div>
    </nav>
  );
};

export default Navbar;