import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrganizationRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        organizationName: '',
        organizationDescription: '',
        organizationEmail: '',
        organizationPhone: '',
        organizationAddress: '',
        organizationWebsite: '',
        adminUsername: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.organizationName.trim()) {
            setMessage('Organization name is required');
            setMessageType('error');
            return false;
        }
        if (!formData.organizationEmail.trim()) {
            setMessage('Organization email is required');
            setMessageType('error');
            return false;
        }
        if (!formData.adminUsername.trim()) {
            setMessage('Admin username is required');
            setMessageType('error');
            return false;
        }
        if (!formData.adminEmail.trim()) {
            setMessage('Admin email is required');
            setMessageType('error');
            return false;
        }
        if (!formData.adminPassword.trim()) {
            setMessage('Admin password is required');
            setMessageType('error');
            return false;
        }
        if (formData.adminPassword !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('error');
            return false;
        }
        if (formData.adminPassword.length < 6) {
            setMessage('Password must be at least 6 characters long');
            setMessageType('error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('/api/organization/register', {
                organizationName: formData.organizationName,
                organizationDescription: formData.organizationDescription,
                organizationEmail: formData.organizationEmail,
                organizationPhone: formData.organizationPhone,
                organizationAddress: formData.organizationAddress,
                organizationWebsite: formData.organizationWebsite,
                adminUsername: formData.adminUsername,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword
            });

            if (response.data.success) {
                setMessage('Organization registered successfully! You can now login with your admin credentials.');
                setMessageType('success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(response.data.message || 'Registration failed');
                setMessageType('error');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Registration failed. Please try again.');
            }
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Logo Section */}
                    <div className="text-center mb-4">
                        <img 
                            src="/images/firm-logo.jpeg" 
                            alt="VIMA - The Dimension Logo" 
                            style={{ maxHeight: '80px', width: 'auto' }}
                            className="mb-3"
                        />
                        <h2 className="text-primary">VIMA - THE DIMENSION</h2>
                    </div>
                    
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Register Your Organization</h3>
                            <small>Create your organization and admin account</small>
                        </div>
                        <div className="card-body">
                            {message && (
                                <div className={`alert ${messageType === 'error' ? 'alert-danger' : 'alert-success'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Organization Information Section */}
                                <div className="row">
                                    <div className="col-12">
                                        <h5 className="mb-3 text-primary">Organization Information</h5>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="organizationName" className="form-label">
                                                Organization Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="organizationName"
                                                name="organizationName"
                                                value={formData.organizationName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="organizationEmail" className="form-label">
                                                Organization Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="organizationEmail"
                                                name="organizationEmail"
                                                value={formData.organizationEmail}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="organizationPhone" className="form-label">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="organizationPhone"
                                                name="organizationPhone"
                                                value={formData.organizationPhone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="organizationWebsite" className="form-label">Website</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                id="organizationWebsite"
                                                name="organizationWebsite"
                                                value={formData.organizationWebsite}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="organizationAddress" className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        id="organizationAddress"
                                        name="organizationAddress"
                                        value={formData.organizationAddress}
                                        onChange={handleInputChange}
                                        rows="2"
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="organizationDescription" className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        id="organizationDescription"
                                        name="organizationDescription"
                                        value={formData.organizationDescription}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Brief description of your organization"
                                    ></textarea>
                                </div>

                                {/* Admin Account Section */}
                                <hr className="my-4" />
                                <div className="row">
                                    <div className="col-12">
                                        <h5 className="mb-3 text-primary">Admin Account Information</h5>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="adminUsername" className="form-label">
                                                Admin Username <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="adminUsername"
                                                name="adminUsername"
                                                value={formData.adminUsername}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="adminEmail" className="form-label">
                                                Admin Email <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="adminEmail"
                                                name="adminEmail"
                                                value={formData.adminEmail}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="adminPassword" className="form-label">
                                                Admin Password <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="adminPassword"
                                                name="adminPassword"
                                                value={formData.adminPassword}
                                                onChange={handleInputChange}
                                                required
                                                minLength="6"
                                            />
                                            <small className="form-text text-muted">Minimum 6 characters</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="confirmPassword" className="form-label">
                                                Confirm Password <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-md-2"
                                        onClick={() => navigate('/login')}
                                        disabled={loading}
                                    >
                                        Back to Login
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Registering...
                                            </>
                                        ) : (
                                            'Register Organization'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegister;