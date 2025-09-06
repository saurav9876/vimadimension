import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyTasks = ({ user }) => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [reportedTasks, setReportedTasks] = useState([]);
  const [tasksToCheck, setTasksToCheck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned tasks
      const assignedResponse = await fetch('/api/tasks/assigned-to-me', {
        credentials: 'include'
      });
      
      // Fetch reported tasks
      const reportedResponse = await fetch('/api/tasks/reported-by-me', {
        credentials: 'include'
      });
      
      // Fetch tasks to check
      const toCheckResponse = await fetch('/api/tasks/to-check', {
        credentials: 'include'
      });
      
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json();
        setAssignedTasks(assignedData);
      }
      
      if (reportedResponse.ok) {
        const reportedData = await reportedResponse.json();
        setReportedTasks(reportedData);
      }
      
      if (toCheckResponse.ok) {
        const toCheckData = await toCheckResponse.json();
        setTasksToCheck(toCheckData);
      }
      
      if (!assignedResponse.ok && !reportedResponse.ok && !toCheckResponse.ok) {
        setError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
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

  const renderTaskCard = (task) => (
    <div key={task.id} className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">
          <Link to={`/tasks/${task.id}/details`}>
            {task.name}
          </Link>
        </h3>
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
      
      <div className="task-card-content">
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        
        <div className="task-meta">
          {task.project && (
            <div className="meta-item">
              <span className="meta-label">Project:</span>
              <Link to={`/projects/${task.project.id}/details`} className="project-link">
                {task.project.name}
              </Link>
            </div>
          )}
          
          {task.projectStage && (
            <div className="meta-item">
              <span className="meta-label">Stage:</span>
              <span className="stage-info">
                {task.projectStage.replace(/STAGE_\d+_/, '').replace(/_/g, ' ')}
              </span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="meta-item">
              <span className="meta-label">Due:</span>
              <span className={`due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="meta-item">
            <span className="meta-label">Updated:</span>
            <span className="update-time">
              {new Date(task.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="task-card-actions">
        <Link to={`/tasks/${task.id}/details`} className="btn-small btn-outline">
          View Details
        </Link>
        <Link to={`/timelogs/task/${task.id}/new`} className="btn-small btn-primary">
          Log Time
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner">Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">My Tasks</h1>
        <div className="page-subtitle">
          {user?.name || user?.username}'s assigned and created tasks
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="tasks-tabs">
        <button 
          className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          <span className="tab-icon">👤</span>
          Assigned to Me ({assignedTasks.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'reported' ? 'active' : ''}`}
          onClick={() => setActiveTab('reported')}
        >
          <span className="tab-icon">📝</span>
          Created by Me ({reportedTasks.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'toCheck' ? 'active' : ''}`}
          onClick={() => setActiveTab('toCheck')}
        >
          <span className="tab-icon">✅</span>
          Tasks to Check ({tasksToCheck.length})
        </button>
      </div>

      <div className="tasks-content">
        {activeTab === 'assigned' && (
          <div className="tasks-section">
            {assignedTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No tasks assigned to you</h3>
                <p>You don't have any tasks assigned at the moment.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {assignedTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reported' && (
          <div className="tasks-section">
            {reportedTasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No tasks created by you</h3>
                <p>You haven't created any tasks yet.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {reportedTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'toCheck' && (
          <div className="tasks-section">
            {tasksToCheck.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No tasks assigned for checking</h3>
                <p>You don't have any tasks assigned to you for verification and approval.</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {tasksToCheck.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;