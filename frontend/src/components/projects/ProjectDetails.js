import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const ProjectDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-medium';
    
    switch (priority.toString().toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      case 'low':
        return 'priority-low';
      case 'medium':
      default:
        return 'priority-medium';
    }
  };

  const handleDeleteProject = async () => {
    const taskCount = tasks.length;
    let confirmMessage = 'Are you sure you want to delete this project? This action cannot be undone.';
    
    if (taskCount > 0) {
      confirmMessage = `This project has ${taskCount} task${taskCount > 1 ? 's' : ''}. You cannot delete a project with existing tasks. Please delete or reassign all tasks first, then try again.`;
      alert(confirmMessage);
      return;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/projects/${id}/delete`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          navigate('/projects');
        } else {
          // Try to get the error message from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || errorData?.message || 'Failed to delete project';
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project');
      }
    }
  };

  const handleDeleteTask = async (taskId, taskName) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          // Remove the task from the local state
          setTasks(tasks.filter(task => task.id !== taskId));
        } else {
          // Try to get the error message from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || errorData?.message || 'Failed to delete task';
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      }
    }
  };

  const canEditTask = (task) => {
    if (!user || !task) return false;
    
    // User can edit if they are:
    // 1. Assigned to the task
    // 2. Creator of the task  
    // 3. Assigned as checker of the task
    // 4. Admin user
    return (
      (task.assignee && task.assignee.id === user.id) ||
      (task.reporter && task.reporter.id === user.id) ||
      (task.checkedBy && task.checkedBy.id === user.id) ||
      (user.authorities && user.authorities.some(auth => auth.authority === 'ROLE_ADMIN'))
    );
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!project) return <div className="main-content">Project not found</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <div className="page-actions">
          <Link to={`/projects/${id}/tasks/new`} className="btn-primary">
            Add Task
          </Link>
          {isAdmin && (
            <>
              <Link to={`/projects/${id}/edit`} className="btn-secondary">
                Edit Project
              </Link>
              <button 
                onClick={handleDeleteProject}
                className="btn-danger"
                disabled={tasks.length > 0}
                title={tasks.length > 0 ? `Cannot delete project with ${tasks.length} task${tasks.length > 1 ? 's' : ''}. Delete or reassign tasks first.` : "Delete this project permanently"}
              >
                Delete Project
              </button>
            </>
          )}
          <Link to="/projects" className="btn-outline">
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="project-card">
        <div className="project-header">
          <h3>Project Information</h3>
          <span className={`project-status status-${project.status?.toLowerCase().replace(/[ _]/g, '-')}`}>
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

      <div className="mt-2">
        <div className="page-header-compact">
          <h2>Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center p-2">
            <p>No tasks found for this project.</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <div className="task-header">
                    <h4>
                      <Link to={`/tasks/${task.id}/details`}>
                        {task.name}
                      </Link>
                      <span className={`task-status ${getStatusClass(task.status)}`}>
                        {task.status?.displayName || task.status?.replace(/_/g, ' ')}
                      </span>
                      {task.priority && (
                        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                          {task.priority?.replace(/_/g, ' ')}
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  <div className="task-meta">
                    {task.assignee && (
                      <div className="meta-item">
                        <span className="meta-label">Assigned to:</span>
                        <span className="meta-value">{task.assignee.name || task.assignee.username}</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="meta-item">
                        <span className={`due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {new Date(task.dueDate) < new Date() && (
                            <span className="overdue-badge"> OVERDUE</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="task-actions">
                  <Link to={`/tasks/${task.id}/details`} className="btn-small btn-outline">
                    View Details
                  </Link>
                  <Link to={`/timelogs/task/${task.id}/new`} className="btn-small btn-primary">
                    Log Time
                  </Link>
                  {canEditTask(task) && (
                    <button 
                      onClick={() => handleDeleteTask(task.id, task.name)}
                      className="btn-small btn-danger"
                    >
                      Delete
                    </button>
                  )}
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