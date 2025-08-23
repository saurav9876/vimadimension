import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TaskForm = () => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectStage: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'description': formData.description,
          'projectStage': formData.projectStage
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/projects/${projectId}/details`);
      } else {
        const errorData = await response.json();
        console.error('Task creation failed:', errorData);
        setError(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Create New Task</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Task Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
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
            />
          </div>

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

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate(`/projects/${projectId}/details`)}
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

export default TaskForm;