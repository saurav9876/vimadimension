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

    try {
      const response = await fetch(`/api/tasks/${id}/timelogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'hoursWorked': formData.hoursWorked,
          'description': formData.description,
          'dateLogged': formData.dateLogged
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/tasks/${id}/details`);
      } else {
        const errorData = await response.json();
        console.error('Time log creation failed:', errorData);
        setError(errorData.error || 'Failed to log time');
      }
    } catch (error) {
      console.error('Error logging time:', error);
      setError('Failed to log time');
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
              min="0"
              required
              autoFocus
            />
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
            />
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
            />
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging...' : 'Log Time'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate(`/tasks/${id}/details`)}
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