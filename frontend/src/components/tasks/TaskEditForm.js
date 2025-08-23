import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TaskEditForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectStage: '',
    status: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const projectStages = [
    { value: 'STAGE_01_PREPARATION_BRIEF', label: 'Stage 01: Preparation & Brief' },
    { value: 'STAGE_02_CONCEPT_DESIGN', label: 'Stage 02: Concept Design' },
    { value: 'STAGE_03_DESIGN_DEVELOPMENT', label: 'Stage 03: Design Development' },
    { value: 'STAGE_04_TECHNICAL_DESIGN', label: 'Stage 04: Technical Design' },
    { value: 'STAGE_05_CONSTRUCTION', label: 'Stage 05: Construction' },
    { value: 'STAGE_06_HANDOVER', label: 'Stage 06: Handover' },
    { value: 'STAGE_07_USE', label: 'Stage 07: Use' }
  ];

  const taskStatuses = [
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DONE', label: 'Done' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          projectStage: data.projectStage || '',
          status: data.status || ''
        });
      } else {
        setError('Task not found');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'description': formData.description,
          'projectStage': formData.projectStage,
          'status': formData.status
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/tasks/${id}/details`);
      } else {
        setError('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error && !formData.name) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="main-content">
      <h1 className="page-title">Edit Task</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Task Name *:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Enter task name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectStage">Project Stage *:</label>
              <select
                id="projectStage"
                name="projectStage"
                value={formData.projectStage}
                onChange={handleChange}
                required
              >
                <option value="">Select stage</option>
                {projectStages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Task Status *:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select status</option>
                {taskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Task'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate(`/tasks/${id}/details`)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditForm;