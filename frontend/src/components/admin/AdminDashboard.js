import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
    }, [user, navigate]);

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
            <h1 className="page-title">Admin Dashboard</h1>
            
            <div className="admin-actions">
                <button 
                    className="btn btn-primary me-2"
                    onClick={() => navigate('/admin/users/create')}
                >
                    Create New User
                </button>
                <button 
                    className="btn btn-success me-2"
                    onClick={() => navigate('/admin/users')}
                >
                    View All Users
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;