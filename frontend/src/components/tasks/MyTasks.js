import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyTasks = ({ user }) => {
  const createInitialPagination = (pageSize = 10) => ({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
    pageSize
  });

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [assignedPagination, setAssignedPagination] = useState(() => createInitialPagination());
  const [reportedTasks, setReportedTasks] = useState([]);
  const [reportedPagination, setReportedPagination] = useState(() => createInitialPagination());
  const [tasksToCheck, setTasksToCheck] = useState([]);
  const [toCheckPagination, setToCheckPagination] = useState(() => createInitialPagination());
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned');
  const [showStandaloneForm, setShowStandaloneForm] = useState(false);
  
  // Pagination state for All Tasks tab
  const [allTasksPagination, setAllTasksPagination] = useState(() => createInitialPagination());

  const fetchPaginatedTaskList = async ({ endpoint, page, pageSize, setTasks, setPagination }) => {
    try {
      const response = await fetch(`${endpoint}?page=${page}&size=${pageSize}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`Failed to load tasks from ${endpoint}:`, response.statusText);
        return false;
      }

      const data = await response.json();

      setTasks(data.tasks || []);
      setPagination({
        currentPage: data.currentPage ?? page,
        totalPages: data.totalPages ?? 0,
        totalItems: data.totalItems ?? 0,
        hasNext: data.hasNext ?? false,
        hasPrevious: data.hasPrevious ?? false,
        pageSize: data.pageSize ?? pageSize
      });

      return true;
    } catch (error) {
      console.error(`Error fetching tasks from ${endpoint}:`, error);
      return false;
    }
  };

  const fetchAssignedTasksPaginated = async (page = 0) => fetchPaginatedTaskList({
    endpoint: '/api/tasks/assigned-to-me',
    page,
    pageSize: assignedPagination.pageSize,
    setTasks: setAssignedTasks,
    setPagination: setAssignedPagination
  });

  const fetchReportedTasksPaginated = async (page = 0) => fetchPaginatedTaskList({
    endpoint: '/api/tasks/reported-by-me',
    page,
    pageSize: reportedPagination.pageSize,
    setTasks: setReportedTasks,
    setPagination: setReportedPagination
  });

  const fetchToCheckTasksPaginated = async (page = 0) => fetchPaginatedTaskList({
    endpoint: '/api/tasks/to-check',
    page,
    pageSize: toCheckPagination.pageSize,
    setTasks: setTasksToCheck,
    setPagination: setToCheckPagination
  });

  const fetchAllTasksPaginated = async (page = 0) => fetchPaginatedTaskList({
    endpoint: '/api/tasks/paginated',
    page,
    pageSize: allTasksPagination.pageSize,
    setTasks: setAllTasks,
    setPagination: setAllTasksPagination
  });

  const fetchMyTasks = async () => {
    let loadingTimeout;
    try {
      loadingTimeout = setTimeout(() => {
        setLoading(true);
      }, 100);

      setError('');

      const results = await Promise.all([
        fetchAssignedTasksPaginated(0),
        fetchReportedTasksPaginated(0),
        fetchToCheckTasksPaginated(0),
        fetchAllTasksPaginated(0)
      ]);

      if (!results.every(Boolean)) {
        setError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user]);

  const handlePageChange = (tabKey, newPage) => {
    const paginationMap = {
      assigned: assignedPagination,
      reported: reportedPagination,
      toCheck: toCheckPagination,
      allTasks: allTasksPagination
    };

    const fetchMap = {
      assigned: fetchAssignedTasksPaginated,
      reported: fetchReportedTasksPaginated,
      toCheck: fetchToCheckTasksPaginated,
      allTasks: fetchAllTasksPaginated
    };

    const pagination = paginationMap[tabKey];
    const fetchFn = fetchMap[tabKey];

    if (!pagination || !fetchFn) {
      return;
    }

    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchFn(newPage);
    }
  };

  const renderPaginationControls = (pagination, tabKey) => {
    if (!pagination || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, pageSize, totalItems, totalPages, hasPrevious, hasNext } = pagination;
    const hasItems = totalItems > 0;
    const startItem = hasItems ? currentPage * pageSize + 1 : 0;
    const endItem = hasItems ? Math.min((currentPage + 1) * pageSize, totalItems) : 0;

    const maxButtons = Math.min(5, totalPages);
    const pageButtons = [];

    for (let i = 0; i < maxButtons; i += 1) {
      let pageNumber;
      if (totalPages <= 5) {
        pageNumber = i;
      } else if (currentPage <= 2) {
        pageNumber = i;
      } else if (currentPage >= totalPages - 3) {
        pageNumber = totalPages - 5 + i;
      } else {
        pageNumber = currentPage - 2 + i;
      }

      if (pageNumber < 0 || pageNumber >= totalPages) {
        continue;
      }

      pageButtons.push(
        <button
          key={pageNumber}
          className={`btn-small ${pageNumber === currentPage ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handlePageChange(tabKey, pageNumber)}
        >
          {pageNumber + 1}
        </button>
      );
    }

    return (
      <div className="pagination-controls">
        <div className="pagination-info">
          {hasItems ? `Showing ${startItem} to ${endItem} of ${totalItems} tasks` : 'No tasks to display'}
        </div>
        <div className="pagination-buttons">
          <button
            className="btn-small btn-outline"
            onClick={() => handlePageChange(tabKey, currentPage - 1)}
            disabled={!hasPrevious}
          >
            ← Previous
          </button>
          <div className="page-numbers">
            {pageButtons}
          </div>
          <button
            className="btn-small btn-outline"
            onClick={() => handlePageChange(tabKey, currentPage + 1)}
            disabled={!hasNext}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  const canEditTask = (task) => {
    if (!user || !task) return false;
    
    // User can edit if they are:
    // 1. Assigned to the task
    // 2. Creator of the task  
    // 3. Assigned as checker of the task
    return (
      (task.assignee && task.assignee.id === user.id) ||
      (task.reporter && task.reporter.id === user.id) ||
      (task.checkedBy && task.checkedBy.id === user.id)
    );
  };

  const handleCreateStandaloneTask = async (formData) => {
    try {
      const response = await fetch('/api/tasks/create-standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams(formData)
      });

      if (response.ok) {
        setShowStandaloneForm(false);
        // Refresh the tasks
        fetchMyTasks();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create standalone task');
      }
    } catch (error) {
      console.error('Error creating standalone task:', error);
      setError('Failed to create standalone task');
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-to-do';
    
    switch (status.toString().toLowerCase()) {
      case 'done':
        return 'status-done';
      case 'checked':
        return 'status-checked';
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
      case 'urgent':
        return 'priority-urgent';
      case 'low':
        return 'priority-low';
      case 'medium':
      default:
        return 'priority-medium';
    }
  };

  const renderTaskCard = (task) => (
    <div key={task.id} className="modern-task-card-new">
      <div className="task-card-header-new">
        <div className="task-title-section">
          <h3 className="task-title-new">
            <Link to={`/tasks/${task.id}/details`}>
              {task.name}
            </Link>
          </h3>
          <div className="task-badges-new">
            <span className={`task-status-new ${getStatusClass(task.status)}`}>
              {task.status?.replace(/_/g, ' ')}
            </span>
            {task.priority && (
              <span className={`priority-badge-new ${getPriorityClass(task.priority)}`}>
                {task.priority.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
        <div className="task-actions-new">
          <Link to={`/tasks/${task.id}/details`} className="btn-task-action btn-view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            View
          </Link>
          {canEditTask(task) && (
            <Link to={`/tasks/${task.id}/edit`} className="btn-task-action btn-edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Edit
            </Link>
          )}
          <Link to={`/timelogs/task/${task.id}/new`} className="btn-task-action btn-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Time
          </Link>
        </div>
      </div>
      
      <div className="task-card-content-new">
        {task.description && (
          <p className="task-description-new">{task.description}</p>
        )}
        
        <div className="task-meta-new">
          <div className="task-meta-left">
            {task.project && (
              <div className="meta-item-new">
                <div className="meta-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label-new">Project</span>
                  <Link to={`/projects/${task.project.id}/details`} className="meta-value-new project-link-new">
                    {task.project.name}
                  </Link>
                </div>
              </div>
            )}
            
            {task.projectStage && (
              <div className="meta-item-new">
                <div className="meta-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label-new">Stage</span>
                  <span className="meta-value-new">
                    {task.projectStage.replace(/STAGE_\d+_/, '').replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            )}
            
            {task.dueDate && (
              <div className="meta-item-new">
                <div className="meta-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label-new">Due Date</span>
                  <span className={`meta-value-new due-date-new ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {new Date(task.dueDate) < new Date() && (
                      <span className="overdue-indicator">OVERDUE</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="task-meta-right">
            {task.assignee && (
              <div className="meta-item-new">
                <div className="meta-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label-new">Assigned to</span>
                  <span className="meta-value-new">{task.assignee.name || task.assignee.username}</span>
                </div>
              </div>
            )}
            
            {task.checkedBy && (
              <div className="meta-item-new">
                <div className="meta-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="meta-content">
                  <span className="meta-label-new">Checked by</span>
                  <span className="meta-value-new">{task.checkedBy.name || task.checkedBy.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>
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
      {/* Ultra-Compact Header */}
      <div className="ultra-compact-header">
        <h1>My Tasks</h1>
        <div className="header-tabs">
          <div className="compact-tabs">
            <button 
              className={`compact-tab ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned to Me ({assignedPagination.totalItems})
            </button>
            <button 
              className={`compact-tab ${activeTab === 'reported' ? 'active' : ''}`}
              onClick={() => setActiveTab('reported')}
            >
              Created by Me ({reportedPagination.totalItems})
            </button>
            <button 
              className={`compact-tab ${activeTab === 'toCheck' ? 'active' : ''}`}
              onClick={() => setActiveTab('toCheck')}
            >
              To Check ({toCheckPagination.totalItems})
            </button>
            <button 
              className={`compact-tab ${activeTab === 'allTasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('allTasks')}
            >
              All ({allTasksPagination.totalItems})
            </button>
          </div>
          <button 
            onClick={() => setShowStandaloneForm(true)}
            className="btn-minimal"
          >
            + New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {showStandaloneForm && (
        <StandaloneTaskForm 
          onSubmit={handleCreateStandaloneTask}
          onCancel={() => setShowStandaloneForm(false)}
        />
      )}

      <div className="tasks-content">
        {activeTab === 'assigned' && (
          <div className="tasks-section">
            {assignedTasks.length === 0 && assignedPagination.totalItems === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No tasks assigned to you</h3>
                <p>You don't have any tasks assigned at the moment.</p>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {assignedTasks.map(renderTaskCard)}
                </div>
                {renderPaginationControls(assignedPagination, 'assigned')}
              </>
            )}
          </div>
        )}

        {activeTab === 'reported' && (
          <div className="tasks-section">
            {reportedTasks.length === 0 && reportedPagination.totalItems === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No tasks created by you</h3>
                <p>You haven't created any tasks yet.</p>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {reportedTasks.map(renderTaskCard)}
                </div>
                {renderPaginationControls(reportedPagination, 'reported')}
              </>
            )}
          </div>
        )}

        {activeTab === 'toCheck' && (
          <div className="tasks-section">
            {tasksToCheck.length === 0 && toCheckPagination.totalItems === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No tasks assigned for checking</h3>
                <p>You don't have any tasks assigned to you for verification and approval.</p>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {tasksToCheck.map(renderTaskCard)}
                </div>
                {renderPaginationControls(toCheckPagination, 'toCheck')}
              </>
            )}
          </div>
        )}

        {activeTab === 'allTasks' && (
          <div className="tasks-section">
            {allTasks.length === 0 && allTasksPagination.totalItems === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <h3>No tasks found</h3>
                <p>There are no tasks in the system yet.</p>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {allTasks.map(renderTaskCard)}
                </div>
                {renderPaginationControls(allTasksPagination, 'allTasks')}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Standalone Task Form Component
const StandaloneTaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    checkedById: ''
  });
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const taskPriorities = [
    { value: 'LOW', label: 'Low', cssClass: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', cssClass: 'priority-medium' },
    { value: 'HIGH', label: 'High', cssClass: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', cssClass: 'priority-urgent' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/tasks/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.assigneeId || !formData.checkedById) {
      alert('Please select both Assignee and Checker');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Task</h3>
          <button onClick={onCancel} className="btn-close">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
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
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Acceptance Criteria:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="This task will be done when the following acceptance criteria is completed..."
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                {taskPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assigneeId">Assignee *:</label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="form-control"
                required
                disabled={fetchingUsers}
              >
                <option value="">{fetchingUsers ? 'Loading users...' : 'Select assignee'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="checkedById">Checker *:</label>
              <select
                id="checkedById"
                name="checkedById"
                value={formData.checkedById}
                onChange={handleChange}
                className="form-control"
                required
                disabled={fetchingUsers}
              >
                <option value="">{fetchingUsers ? 'Loading users...' : 'Select checker'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTasks;
