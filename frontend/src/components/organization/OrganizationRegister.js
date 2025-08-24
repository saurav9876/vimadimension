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
        adminName: '',
        adminUsername: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

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
        if (!formData.adminName.trim()) {
            setMessage('Admin name is required');
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
                adminName: formData.adminName,
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

    const nextStep = () => {
        if (currentStep === 1) {
            if (formData.organizationName.trim() && formData.organizationEmail.trim()) {
                setCurrentStep(2);
                setMessage('');
            } else {
                setMessage('Please fill in the required organization fields');
                setMessageType('error');
            }
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
        setMessage('');
    };

    return (
        <div className="register-container">
            <div className="register-background">
                <div className="register-content">
                    {/* Header Section */}
                    <div className="register-header">
                        <div className="logo-section">
                            <img 
                                src="/images/firm-logo.jpg" 
                                alt="VIMA - The Dimension Logo" 
                                className="logo-image"
                            />
                            <h1 className="brand-title">VIMA - THE DIMENSION</h1>
                            <p className="brand-subtitle">Project Management & Time Tracking</p>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="register-card">
                        <div className="card-header-section">
                            <h2 className="card-title">Create Your Organization</h2>
                            <p className="card-subtitle">Set up your workspace and admin account</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="progress-steps">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                                <div className="step-number">1</div>
                                <span className="step-label">Organization</span>
                            </div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <span className="step-label">Admin Account</span>
                            </div>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div className={`message ${messageType === 'error' ? 'error' : 'success'}`}>
                                <div className="message-icon">
                                    {messageType === 'error' ? '⚠️' : '✅'}
                                </div>
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="register-form">
                            {/* Step 1: Organization Information */}
                            {currentStep === 1 && (
                                <div className="form-step">
                                    <div className="section-title">
                                        <div className="section-icon">🏢</div>
                                        <h3>Organization Information</h3>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="organizationName" className="form-label">
                                                Organization Name <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                id="organizationName"
                                                name="organizationName"
                                                value={formData.organizationName}
                                                onChange={handleInputChange}
                                                placeholder="Enter your organization name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="organizationEmail" className="form-label">
                                                Organization Email <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                id="organizationEmail"
                                                name="organizationEmail"
                                                value={formData.organizationEmail}
                                                onChange={handleInputChange}
                                                placeholder="org@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="organizationPhone" className="form-label">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-input"
                                                id="organizationPhone"
                                                name="organizationPhone"
                                                value={formData.organizationPhone}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="organizationWebsite" className="form-label">
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                id="organizationWebsite"
                                                name="organizationWebsite"
                                                value={formData.organizationWebsite}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="organizationAddress" className="form-label">
                                            Address
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            id="organizationAddress"
                                            name="organizationAddress"
                                            value={formData.organizationAddress}
                                            onChange={handleInputChange}
                                            placeholder="Enter your organization address"
                                            rows="2"
                                        ></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="organizationDescription" className="form-label">
                                            Description
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            id="organizationDescription"
                                            name="organizationDescription"
                                            value={formData.organizationDescription}
                                            onChange={handleInputChange}
                                            placeholder="Brief description of your organization and what you do"
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="step-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => navigate('/login')}
                                        >
                                            ← Back to Login
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={nextStep}
                                        >
                                            Continue to Admin Account →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Admin Account */}
                            {currentStep === 2 && (
                                <div className="form-step">
                                    <div className="section-title">
                                        <div className="section-icon">👤</div>
                                        <h3>Admin Account Setup</h3>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="adminName" className="form-label">
                                                Admin Name <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                id="adminName"
                                                name="adminName"
                                                value={formData.adminName}
                                                onChange={handleInputChange}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="adminUsername" className="form-label">
                                                Admin Username <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                id="adminUsername"
                                                name="adminUsername"
                                                value={formData.adminUsername}
                                                onChange={handleInputChange}
                                                placeholder="Choose a username"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="adminEmail" className="form-label">
                                                Admin Email <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                id="adminEmail"
                                                name="adminEmail"
                                                value={formData.adminEmail}
                                                onChange={handleInputChange}
                                                placeholder="admin@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="adminPassword" className="form-label">
                                                Admin Password <span className="required">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                id="adminPassword"
                                                name="adminPassword"
                                                value={formData.adminPassword}
                                                onChange={handleInputChange}
                                                placeholder="Create a strong password"
                                                required
                                                minLength="6"
                                            />
                                            <small className="form-help">Minimum 6 characters</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword" className="form-label">
                                                Confirm Password <span className="required">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="Confirm your password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="step-actions">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={prevStep}
                                        >
                                            ← Back to Organization
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="loading-spinner"></span>
                                                    Creating Organization...
                                                </>
                                            ) : (
                                                'Create Organization & Account'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="card-footer">
                            <p className="footer-text">
                                Already have an account?{' '}
                                <button 
                                    className="link-button"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign in here
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegister;