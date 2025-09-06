import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const TaskDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTask(data.task || data);
      } else {
        setError('Task not found');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-to-do';
    
    switch (status.toString().toLowerCase()) {
      case 'done':
        return 'status-done';
      case 'in_progress':
        return 'status-in-progress';
      case 'in_review':
        return 'status-in-review';
      case 'on_hold':
        return 'status-on-hold';
      case 'to_do':
      default:
        return 'status-to-do';
    }
  };

  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-medium';
    
    switch (priority.toString().toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'low':
        return 'priority-low';
      case 'medium':
      default:
        return 'priority-medium';
    }
  };

  const goBack = () => {
    if (task?.project?.id) {
      navigate(`/projects/${task.project.id}/details`);
    } else {
      navigate('/projects');
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!task) return <div className="main-content">Task not found</div>;

  // Check if user is admin
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{task.name}</h1>
        <div className="page-actions">
          <button onClick={goBack} className="btn-outline">
            ← Back
          </button>
          {isAdmin && (
            <Link to={`/tasks/${id}/edit`} className="btn-outline">
              Edit Task
            </Link>
          )}
        </div>
      </div>

      <div className="task-details-grid">
        {/* Main Task Information Card */}
        <div className="project-card">
          <div className="card-header">
            <h3>Task Information</h3>
            <div className="task-badges">
              <span className={`task-status ${getStatusClass(task.status)}`}>
                {task.status?.replace(/_/g, ' ')}
              </span>
              {task.priority && (
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          <div className="project-info">
            <div className="info-row">
              <span className="info-label">Task ID:</span>
              <span className="info-value">#{task.id}</span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Acceptance Criteria:</span>
              <span className="info-value">{task.description || 'No acceptance criteria provided'}</span>
            </div>

            {task.projectStage && (
              <div className="info-row">
                <span className="info-label">Project Stage:</span>
                <span className="info-value">
                  <span className={`stage-${task.projectStage.toLowerCase().replace(/_/g, '-')}`}>
                    {task.projectStage.replace(/STAGE_\d+_/, '').replace(/_/g, ' ')}
                  </span>
                </span>
              </div>
            )}

            {task.project && (
              <div className="info-row">
                <span className="info-label">Project:</span>
                <span className="info-value">
                  <Link to={`/projects/${task.project.id}/details`} className="project-link">
                    {task.project.name}
                  </Link>
                  {task.project.clientName && (
                    <span className="client-name"> ({task.project.clientName})</span>
                  )}
                </span>
              </div>
            )}

            {task.assignee && (
              <div className="info-row">
                <span className="info-label">Assigned to:</span>
                <span className="info-value">
                  <span className="user-info">
                    {task.assignee.name || task.assignee.username}
                    {task.assignee.email && (
                      <span className="user-email"> ({task.assignee.email})</span>
                    )}
                  </span>
                </span>
              </div>
            )}

            {task.reporter && (
              <div className="info-row">
                <span className="info-label">Created by:</span>
                <span className="info-value">
                  <span className="user-info">
                    {task.reporter.name || task.reporter.username}
                    {task.reporter.email && (
                      <span className="user-email"> ({task.reporter.email})</span>
                    )}
                  </span>
                </span>
              </div>
            )}

            {task.checkedBy && (
              <div className="info-row">
                <span className="info-label">Checked by:</span>
                <span className="info-value">
                  <span className="user-info">
                    {task.checkedBy.name || task.checkedBy.username}
                    {task.checkedBy.email && (
                      <span className="user-email"> ({task.checkedBy.email})</span>
                    )}
                  </span>
                </span>
              </div>
            )}

            <div className="info-row">
              <span className="info-label">Created:</span>
              <span className="info-value">{new Date(task.createdAt).toLocaleString()}</span>
            </div>

            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="info-row">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{new Date(task.updatedAt).toLocaleString()}</span>
              </div>
            )}

            {task.dueDate && (
              <div className="info-row">
                <span className="info-label">Due Date:</span>
                <span className={`info-value ${new Date(task.dueDate) < new Date() ? 'text-danger' : ''}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                  {new Date(task.dueDate) < new Date() && (
                    <span className="overdue-badge">OVERDUE</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Time Logs Card */}
        <div className="project-card">
          <div className="card-header">
            <h3>Time Logs</h3>
            <Link to={`/timelogs/task/${id}/new`} className="btn-small btn-primary">
              + Log Time
            </Link>
          </div>

          {task.timeLogs && task.timeLogs.length > 0 ? (
            <div className="time-logs-list">
              {task.timeLogs.map(timeLog => (
                <div key={timeLog.id} className="time-log-item">
                  <div className="time-log-header">
                    <span className="hours-badge">{timeLog.hoursLogged}h</span>
                    <span className="date-logged">{new Date(timeLog.dateLogged).toLocaleDateString()}</span>
                  </div>
                  <div className="time-log-description">
                    {timeLog.workDescription || 'No description provided'}
                  </div>
                  {timeLog.username && (
                    <div className="time-log-user">
                      <small>by {timeLog.username}</small>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="total-time">
                <strong>
                  Total Time Logged: {
                    task.timeLogs.reduce((sum, log) => sum + (log.hoursLogged || 0), 0).toFixed(1)
                  } hours
                </strong>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">⏱️</span>
              <p>No time logs recorded yet</p>
              <Link to={`/timelogs/task/${id}/new`} className="btn-primary">
                Log First Entry
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;