import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectDetails = ({ user }) => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setTasks(data.tasks || []);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'to-do';
    
    switch (status.toString().toLowerCase()) {
      case 'done':
        return 'done';
      case 'in_progress':
      case 'in progress':
        return 'in-progress';
      case 'in_review':
        return 'in-review';
      case 'on_hold':
        return 'on-hold';
      case 'to_do':
      default:
        return 'to-do';
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!project) return <div className="main-content">Project not found</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <div className="page-actions">
          {isAdmin && (
            <Link to={`/projects/${id}/edit`} className="btn-outline">
              Edit Project
            </Link>
          )}
          <Link to="/projects" className="btn-outline">
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="project-card">
        <div className="project-header">
          <h3>Project Information</h3>
          <span className={`project-status status-${project.status?.toLowerCase().replace(' ', '-')}`}>
            {project.status?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="project-info">
          <div className="info-row">
            <span className="info-label">Client Name:</span>
            <span className="info-value">{project.clientName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Project Category:</span>
            <span className="info-value">{project.projectCategory?.replace('_', ' ')}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Project Stage:</span>
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
              <span className="info-label">Estimated End Date:</span>
              <span className="info-value">{new Date(project.estimatedEndDate).toLocaleDateString()}</span>
            </div>
          )}
          {project.description && (
            <div className="info-row">
              <span className="info-label">Description:</span>
              <span className="info-value">{project.description}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="page-header">
          <h2>Tasks</h2>
          <div className="page-actions">
            <Link to={`/projects/${id}/tasks/new`} className="btn-primary">
              Add Task
            </Link>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center p-4">
            <p>No tasks found for this project.</p>
            <Link to={`/projects/${id}/tasks/new`} className="btn-primary">
              Create First Task
            </Link>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h4>
                    <Link to={`/tasks/${task.id}/details`}>
                      {task.name}
                    </Link>
                  </h4>
                  <p>{task.description}</p>
                  {task.assignee && (
                    <p><strong>Assigned to:</strong> {task.assignee.username}</p>
                  )}
                </div>
                <div>
                  <span className={`task-status ${getStatusClass(task.status)}`}>
                    {task.status?.displayName || task.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;