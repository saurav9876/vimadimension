import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const TaskDetails = () => {
  const { id } = useParams();
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
        setTask(data);
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
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
      case 'in_progress':
        return 'status-in-progress';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!task) return <div className="main-content">Task not found</div>;

  return (
    <div className="main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">{task.name}</h1>
        <div>
          <Link to={`/tasks/${id}/edit`} className="btn-small btn-outline me-2">
            Edit Task
          </Link>
          <Link to={`/tasks/${id}/timelog`} className="btn-small btn-primary me-2">
            Log Time
          </Link>
          {task.project && (
            <Link to={`/projects/${task.project.id}/details`} className="btn-small btn-outline">
              Back to Project
            </Link>
          )}
        </div>
      </div>

      <div className="project-card">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3>Task Details</h3>
          <span className={`task-status ${getStatusClass(task.status)}`}>
            {task.status?.displayName || task.status?.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="form-group">
          <label><strong>Description:</strong></label>
          <p>{task.description || 'No description provided'}</p>
        </div>

        {task.projectStage && (
          <div className="form-group">
            <label><strong>Project Stage:</strong></label>
            <p>
              <span className={`stage-${task.projectStage.toLowerCase().replace(/_/g, '-')}`}>
                {task.projectStage.displayName || task.projectStage.replace(/_/g, ' ')}
              </span>
            </p>
          </div>
        )}

        {task.project && (
          <div className="form-group">
            <label><strong>Project:</strong></label>
            <p>
              <Link to={`/projects/${task.project.id}/details`}>
                {task.project.name}
              </Link>
            </p>
          </div>
        )}

        {task.assignee && (
          <div className="form-group">
            <label><strong>Assigned to:</strong></label>
            <p>{task.assignee.username}</p>
          </div>
        )}

        {task.reporter && (
          <div className="form-group">
            <label><strong>Created by:</strong></label>
            <p>{task.reporter.username}</p>
          </div>
        )}

        {task.createdAt && (
          <div className="form-group">
            <label><strong>Created:</strong></label>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
        )}

        {task.dueDate && (
          <div className="form-group">
            <label><strong>Due Date:</strong></label>
            <p>{new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {task.timeLogs && task.timeLogs.length > 0 && (
        <div className="project-card mt-4">
          <h3>Time Logs</h3>
          <div className="tasks-list">
            {task.timeLogs.map(timeLog => (
              <div key={timeLog.id} className="task-item">
                <div className="task-info">
                  <p><strong>Hours:</strong> {timeLog.hoursLogged || timeLog.hoursWorked || 'N/A'}</p>
                  <p><strong>Description:</strong> {timeLog.workDescription || timeLog.description || 'No description'}</p>
                  <p><small>Logged on: {new Date(timeLog.dateLogged).toLocaleDateString()}</small></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;