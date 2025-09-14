import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TimeLogForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    hoursWorked: '',
    description: '',
    dateLogged: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.hoursWorked || formData.hoursWorked <= 0) {
      setError('Please enter a valid number of hours worked');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description of work done');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}/timelogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'hoursWorked': formData.hoursWorked,
          'description': formData.description.trim(),
          'dateLogged': formData.dateLogged
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigate(`/tasks/${id}/details`, { replace: true });
      } else {
        console.error('Time log creation failed:', data);
        setError(data.error || 'Failed to log time');
      }
    } catch (error) {
      console.error('Error logging time:', error);
      setError('Failed to log time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Log Time</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hoursWorked">Hours Worked:</label>
            <input
              type="number"
              id="hoursWorked"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleChange}
              step="0.25"
              min="0.25"
              max="24"
              required
              autoFocus
              placeholder="e.g., 2.5"
            />
            <div className="form-help">Enter hours in decimal format (e.g., 2.5 for 2 hours 30 minutes)</div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Work Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe what you worked on..."
              required
              maxLength="500"
            />
            <div className="form-help">Describe the specific tasks or activities you completed</div>
          </div>

          <div className="form-group">
            <label htmlFor="dateLogged">Date:</label>
            <input
              type="date"
              id="dateLogged"
              name="dateLogged"
              value={formData.dateLogged}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <div className="form-help">Select the date when this work was completed</div>
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Logging Time...
                </>
              ) : (
                <>
                  <span>⏱️</span>
                  Log Time
                </>
              )}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate(`/tasks/${id}/details`, { replace: true })}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogForm;