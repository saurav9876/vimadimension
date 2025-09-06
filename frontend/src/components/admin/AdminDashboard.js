import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        activeProjects: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/projects');
            return;
        }
        
        // Check if user has admin role - use the same pattern as Navbar
        const hasAdminRole = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;
        
        if (!hasAdminRole) {
            navigate('/projects');
            return;
        }

        fetchDashboardStats();
    }, [user, navigate]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.stats) {
                    setStats(data.stats);
                }
            } else {
                console.error('Failed to fetch dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    };

    if (!user) {
        return null;
    }
    
    // Check if user has admin role - use the same pattern as Navbar
    const hasAdminRole = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;
    
    if (!hasAdminRole) {
        return null;
    }


    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Manage your organization and team</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-primary btn-icon"
                        onClick={() => navigate('/admin/users/create')}
                    >
                        <span className="btn-icon-text">👤</span>
                        Add User
                    </button>
                </div>
            </div>

            {/* Overview Statistics */}
            <div className="stats-grid">
                <div className="stat-card users-card">
                    <div className="stat-card-header">
                        <div className="stat-icon users-icon">👥</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Total Users</div>
                        <div className="stat-description">Active team members</div>
                    </div>
                </div>

                <div className="stat-card projects-card">
                    <div className="stat-card-header">
                        <div className="stat-icon projects-icon">📁</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalProjects}</div>
                        <div className="stat-label">Total Projects</div>
                        <div className="stat-description">All projects</div>
                    </div>
                </div>

                <div className="stat-card tasks-card">
                    <div className="stat-card-header">
                        <div className="stat-icon tasks-icon">✅</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalTasks}</div>
                        <div className="stat-label">Total Tasks</div>
                        <div className="stat-description">All tasks created</div>
                    </div>
                </div>

                <div className="stat-card active-card">
                    <div className="stat-card-header">
                        <div className="stat-icon active-icon">🚀</div>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeProjects}</div>
                        <div className="stat-label">Active Projects</div>
                        <div className="stat-description">Currently running</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="actions-grid">
                    <div className="action-card create-user-card">
                        <div className="action-card-header">
                            <div className="action-icon">👤</div>
                            <h3>Create New User</h3>
                        </div>
                        <p className="action-description">Register a new team member in your organization with all necessary details and permissions.</p>
                        <button 
                            className="action-btn primary-btn"
                            onClick={() => navigate('/admin/users/create')}
                        >
                            Create User
                        </button>
                    </div>

                    <div className="action-card manage-users-card">
                        <div className="action-card-header">
                            <div className="action-icon">👥</div>
                            <h3>Manage Users</h3>
                        </div>
                        <p className="action-description">View, edit, and manage all users in your organization. Track attendance and performance.</p>
                        <button 
                            className="action-btn secondary-btn"
                            onClick={() => navigate('/admin/users')}
                        >
                            Manage Users
                        </button>
                    </div>

                    <div className="action-card projects-card">
                        <div className="action-card-header">
                            <div className="action-icon">📁</div>
                            <h3>Manage Projects</h3>
                        </div>
                        <p className="action-description">Create and manage projects, assign tasks, and track project progress across teams.</p>
                        <button 
                            className="action-btn secondary-btn"
                            onClick={() => navigate('/projects')}
                        >
                            Manage Projects
                        </button>
                    </div>

                    <div className="action-card reports-card">
                        <div className="action-card-header">
                            <div className="action-icon">📊</div>
                            <h3>View Reports</h3>
                        </div>
                        <p className="action-description">Access detailed reports on attendance, project progress, and team performance analytics.</p>
                        <button 
                            className="action-btn disabled-btn"
                            disabled
                        >
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;