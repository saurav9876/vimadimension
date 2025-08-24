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

    const adminActions = [
        { title: 'Create New User', description: 'Register a new team member', icon: '👤', action: () => navigate('/admin/users/create'), color: 'primary', buttonText: 'Create User' },
        { title: 'Manage Users', description: 'View and manage all users in your organization', icon: '👥', action: () => navigate('/admin/users'), color: 'primary', buttonText: 'View Users' }
    ];

    return (
        <div className="main-content">
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">Manage {user?.organization?.name || 'your organization'} and team</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.totalUsers}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.totalProjects}</div>
                            <div className="stat-label">Total Projects</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.totalTasks}</div>
                            <div className="stat-label">Total Tasks</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🚀</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.activeProjects}</div>
                            <div className="stat-label">Active Projects</div>
                        </div>
                    </div>
                </div>

                {/* Admin Actions Grid */}
                <div className="admin-actions-section">
                    <h2 className="section-title">Administrative Actions</h2>
                    <div className="actions-grid">
                        {adminActions.map((action, index) => (
                            <div key={index} className="action-card">
                                <div className="action-header">
                                    <div className="action-icon">{action.icon}</div>
                                    <h3 className="action-title">{action.title}</h3>
                                </div>
                                <p className="action-description">{action.description}</p>
                                <button 
                                    className={`btn-${action.color}`}
                                    onClick={action.action}
                                >
                                    {action.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;