import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TaskForm = () => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectStage: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    checkedById: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [project, setProject] = useState(null);
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

  const taskPriorities = [
    { value: 'LOW', label: 'Low', cssClass: 'priority-low' },
    { value: 'MEDIUM', label: 'Medium', cssClass: 'priority-medium' },
    { value: 'HIGH', label: 'High', cssClass: 'priority-high' },
    { value: 'URGENT', label: 'Urgent', cssClass: 'priority-urgent' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/details`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

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
          'projectStage': formData.projectStage,
          'priority': formData.priority,
          'dueDate': formData.dueDate,
          'assigneeId': formData.assigneeId,
          'checkedById': formData.checkedById
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
      <h1 className="page-title">
        {project ? `Create New Task for Project ${project.name}` : 'Create New Task'}
      </h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
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
            />
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
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {taskPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                placeholder="Select due date (optional)"
              />
              <small className="form-help">Optional due date for the task</small>
            </div>

            <div className="form-group">
              <label htmlFor="assigneeId">Assign To:</label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {!fetchingUsers && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
              <small className="form-help">Optional: assign task to a team member</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="checkedById">Checked By:</label>
              <select
                id="checkedById"
                name="checkedById"
                value={formData.checkedById}
                onChange={handleChange}
              >
                <option value="">No checker assigned</option>
                {!fetchingUsers && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
              <small className="form-help">Optional: assign a checker to verify task completion</small>
            </div>
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