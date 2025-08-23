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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="https://www.vimathedimension.com/" className="navbar-brand" target="_blank" rel="noopener noreferrer">
          <img src="http://localhost:8080/images/firm-logo.jpeg" alt="VIMA Logo" className="navbar-logo" />
          <span className="navbar-brand-text">VIMA - THE DIMENSION</span>
        </a>
        <ul className="navbar-nav">
          <li>
            <Link to="/profile" className="nav-link">My Profile</Link>
          </li>
          <li>
            <Link to="/projects" className="nav-link">Projects</Link>
          </li>
          {(hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER')) && (
            <li>
              <Link to="/projects/new" className="nav-link">New Project</Link>
            </li>
          )}
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