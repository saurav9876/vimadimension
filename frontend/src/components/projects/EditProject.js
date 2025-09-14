import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProject = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    startDate: '',
    estimatedEndDate: '',
    location: '',
    projectCategory: '',
    status: '',
    projectStage: '',
    description: '',
    budget: '',
    actualCost: '',
    priority: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

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

  const projectPriorities = [
    { value: 'LOW', label: 'Low', cssClass: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', cssClass: 'priority-medium' },
    { value: 'HIGH', label: 'High', cssClass: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', cssClass: 'priority-urgent' }
  ];

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      navigate('/projects');
      return;
    }
    fetchProject();
  }, [id, isAdmin, navigate]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/edit`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.projectUpdateDto) {
          const dto = data.projectUpdateDto;
          setFormData({
            name: dto.name || '',
            clientName: dto.clientName || '',
            startDate: dto.startDate ? dto.startDate.substring(0, 10) : '',
            estimatedEndDate: dto.estimatedEndDate ? dto.estimatedEndDate.substring(0, 10) : '',
            location: dto.location || '',
            projectCategory: dto.projectCategory || '',
            status: dto.status || '',
            projectStage: dto.projectStage || '',
            description: dto.description || '',
            budget: dto.budget ? dto.budget.toString() : '',
            actualCost: dto.actualCost ? dto.actualCost.toString() : '',
            priority: dto.priority || ''
          });
        }
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
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
      const response = await fetch(`/api/projects/${id}/update`, {
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
          'description': formData.description,
          'budget': formData.budget,
          'actualCost': formData.actualCost,
          'priority': formData.priority
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/projects/${id}/details`);
      } else {
        setError('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error && !formData.name) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="main-content">
      <h1 className="page-title">Edit Project</h1>

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
              <label htmlFor="priority">Project Priority:</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="">Select priority</option>
                {projectPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Budget (₹):</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <small className="form-help">Enter budget amount in Indian Rupees (optional)</small>
              </div>

              <div className="form-group">
                <label htmlFor="actualCost">Actual Cost (₹):</label>
                <input
                  type="number"
                  id="actualCost"
                  name="actualCost"
                  value={formData.actualCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <small className="form-help">Enter actual cost in Indian Rupees (optional)</small>
              </div>
            </div>
          )}

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
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Project'}
            </button>
            <button 
              type="button" 
              className="btn-outline"
              onClick={() => navigate(`/projects/${id}/details`)}
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

export default EditProject;