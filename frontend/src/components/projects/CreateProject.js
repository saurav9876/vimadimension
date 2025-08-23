import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    startDate: '',
    estimatedEndDate: '',
    location: '',
    projectCategory: '',
    status: '',
    projectStage: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const projectCategories = [
    { value: 'ARCHITECTURE', label: 'Architecture' },
    { value: 'INTERIOR', label: 'Interior' },
    { value: 'STRUCTURE', label: 'Structure' },
    { value: 'URBAN', label: 'Urban' },
    { value: 'LANDSCAPE', label: 'Landscape' },
    { value: 'ACOUSTIC', label: 'Acoustic' },
    { value: 'OTHER', label: 'Other' }
  ];

  const projectStatuses = [
    { value: 'IN_DISCUSSION', label: 'In discussion' },
    { value: 'PROGRESS', label: 'Progress' },
    { value: 'ON_HOLD', label: 'On hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

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
      const response = await fetch('/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'clientName': formData.clientName,
          'startDate': formData.startDate,
          'estimatedEndDate': formData.estimatedEndDate,
          'location': formData.location,
          'projectCategory': formData.projectCategory,
          'status': formData.status,
          'projectStage': formData.projectStage,
          'description': formData.description
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // Check if response is a redirect or contains project data
        const responseText = await response.text();
        if (responseText.includes('/projects/')) {
          // Parse redirect URL to get project ID
          const match = responseText.match(/\/projects\/(\d+)\/details/);
          if (match) {
            navigate(`/projects/${match[1]}/details`);
          } else {
            navigate('/projects');
          }
        } else {
          navigate('/projects');
        }
      } else {
        setError('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">Create New Project</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Project Name *:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Enter project name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clientName">Client Name *:</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Enter client name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedEndDate">Estimated End Date:</label>
              <input
                type="date"
                id="estimatedEndDate"
                name="estimatedEndDate"
                value={formData.estimatedEndDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter project location"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectCategory">Project Category *:</label>
              <select
                id="projectCategory"
                name="projectCategory"
                value={formData.projectCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {projectCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Project Status *:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select status</option>
                {projectStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
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

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter project description (optional)"
            />
          </div>

          <div className="project-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate('/projects')}
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

export default CreateProject;