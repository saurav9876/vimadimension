import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const isActiveLink = (path) => {
    return location.pathname === path;
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
        {/* Brand Section */}
        <div className="navbar-brand-section">
          <a href="https://www.vimathedimension.com/" className="navbar-brand" target="_blank" rel="noopener noreferrer">
            <img src="/images/firm-logo.jpg" alt="Organization Logo" className="navbar-logo" />
            <div className="brand-info">
              <span className="organization-name">{getOrganizationName()}</span>
              <span className="welcome-text">Project Management</span>
            </div>
          </a>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        {/* Navigation Links */}
        <div className={`navbar-nav-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-nav">
            <li>
              <Link 
                to="/profile" 
                className={`nav-link ${isActiveLink('/profile') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">👤</span>
                My Profile
              </Link>
            </li>
            <li>
              <Link 
                to="/projects" 
                className={`nav-link ${isActiveLink('/projects') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">📁</span>
                Projects
              </Link>
            </li>
            {isAdmin() && (
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-link ${isActiveLink('/admin/dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">⚙️</span>
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
          
          {/* User Section */}
          <div className="navbar-user-section">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || user?.username || 'User'}</span>
                <span className="user-role">
                  {user?.authorities?.map(auth => auth.authority?.replace('ROLE_', '')).join(', ') || 'User'}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
      </div>
    </nav>
  );
};

export default Navbar;