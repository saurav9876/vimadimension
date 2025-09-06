import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Modern SVG Icons
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const TasksIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3l8-8"/>
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9s9 4.03 9 9z"/>
  </svg>
);

const ProjectsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"/>
    <path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>
  </svg>
);

const AdminIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

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
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
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
                <UserIcon />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/my-tasks" 
                className={`nav-link ${isActiveLink('/my-tasks') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <TasksIcon />
                <span>My Tasks</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/projects" 
                className={`nav-link ${isActiveLink('/projects') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <ProjectsIcon />
                <span>Projects</span>
              </Link>
            </li>
            {isAdmin() && (
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-link ${isActiveLink('/admin/dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <AdminIcon />
                  <span>Admin Dashboard</span>
                </Link>
              </li>
            )}
          </ul>
          
          {/* Logout Button */}
          <div className="navbar-logout">
            <button onClick={handleLogout} className="logout-button">
              <LogoutIcon />
              <span>Logout</span>
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