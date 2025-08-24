import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProjectsList = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}/delete`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          setProjects(projects.filter(p => p.id !== projectId));
        } else {
          setError('Failed to delete project');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <div className="page-actions">
          <Link to="/projects/new" className="btn-primary">
            New Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center">
          <p>No projects found.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-badges">
                  <span className={`project-status status-${project.status?.toLowerCase().replace(' ', '-')}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  <span className={`priority-badge ${project.priority?.toLowerCase().replace(' ', '-')}-priority`}>
                    {project.priority?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="project-info">
                <div className="info-row">
                  <span className="info-label">Client:</span>
                  <span className="info-value">{project.clientName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{project.projectCategory?.replace('_', ' ')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Stage:</span>
                  <span className="info-value">
                    <span className={`stage-${project.projectStage?.toLowerCase().replace(/_/g, '-')}`}>
                      {project.projectStage?.displayName || project.projectStage?.replace(/_/g, ' ')}
                    </span>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">{project.location}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Start Date:</span>
                  <span className="info-value">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                {project.estimatedEndDate && (
                  <div className="info-row">
                    <span className="info-label">End Date:</span>
                    <span className="info-value">{new Date(project.estimatedEndDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.description && (
                  <div className="info-row">
                    <span className="info-label">Description:</span>
                    <span className="info-value">{project.description}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="info-row">
                    <span className="info-label">Budget:</span>
                    <span className="info-value">${parseFloat(project.budget).toLocaleString()}</span>
                  </div>
                )}
                {project.actualCost && (
                  <div className="info-row">
                    <span className="info-label">Actual Cost:</span>
                    <span className="info-value">${parseFloat(project.actualCost).toLocaleString()}</span>
                  </div>
                )}
                {project.budget && project.actualCost && (
                  <div className="info-row">
                    <span className="info-label">Cost Status:</span>
                    <span className={`info-value ${parseFloat(project.actualCost) > parseFloat(project.budget) ? 'text-danger' : 'text-success'}`}>
                      {parseFloat(project.actualCost) > parseFloat(project.budget) ? 'Over Budget' : 'Under Budget'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="project-actions">
                <Link 
                  to={`/projects/${project.id}/details`} 
                  className="btn-small btn-outline"
                >
                  View Details
                </Link>
                {/* Only show Edit and Delete buttons for admin users */}
                {isAdmin && (
                  <>
                    <Link 
                      to={`/projects/${project.id}/edit`} 
                      className="btn-small btn-outline"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;