import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProjectsList = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 0, // 0-based for backend
    itemsPerPage: 9,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  // Available filter options
  const projectCategories = [
    { value: '', label: 'All Categories' },
    { value: 'ARCHITECTURE', label: 'Architecture' },
    { value: 'INTERIOR', label: 'Interior' },
    { value: 'STRUCTURE', label: 'Structure' },
    { value: 'URBAN', label: 'Urban' },
    { value: 'LANDSCAPE', label: 'Landscape' },
    { value: 'ACOUSTIC', label: 'Acoustic' },
    { value: 'OTHER', label: 'Other' }
  ];

  const projectPriorities = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const projectStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'IN_DISCUSSION', label: 'In Discussion' },
    { value: 'PROGRESS', label: 'Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Fetch projects when filters or pagination change
  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.currentPage]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 0
    }));
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.itemsPerPage.toString()
      });
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      const response = await fetch(`/api/projects/paginated?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 0,
          totalItems: data.totalItems || 0,
          hasNext: data.hasNext || false,
          hasPrevious: data.hasPrevious || false
        }));
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


  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priority: '',
      status: ''
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const goToFirstPage = () => handlePageChange(0);
  const goToPreviousPage = () => handlePageChange(pagination.currentPage - 1);
  const goToNextPage = () => handlePageChange(pagination.currentPage + 1);
  const goToLastPage = () => handlePageChange(pagination.totalPages - 1);


  if (loading) return <div className="main-content">Loading...</div>;

  return (
    <div className="main-content">
      {/* Minimal Header */}
      <div className="minimal-header">
        <h1>Projects ({pagination.totalItems})</h1>
        <div className="minimal-controls">
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            {projectCategories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
            {projectPriorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            {projectStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <Link to="/projects/new" className="btn-minimal">+ New Project</Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center">
          <p>{pagination.totalItems === 0 ? 'No projects found.' : 'No projects match the selected filters.'}</p>
          {pagination.totalItems > 0 && (
            <button onClick={clearFilters} className="btn-outline">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-badges">
                  <span className={`project-status status-${project.status?.toLowerCase().replace(/[ _]/g, '-')}`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                  <span className={`priority-badge ${project.priority?.toLowerCase().replace(/[ _]/g, '-')}-priority`}>
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
                {isAdmin && project.budget && (
                  <div className="info-row">
                    <span className="info-label">Budget:</span>
                    <span className="info-value">₹{parseFloat(project.budget).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {isAdmin && project.actualCost && (
                  <div className="info-row">
                    <span className="info-label">Actual Cost:</span>
                    <span className="info-value">₹{parseFloat(project.actualCost).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {isAdmin && project.budget && project.actualCost && (
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>
              Page {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
          </div>
          
          <div className="pagination-buttons">
            <button
              onClick={goToFirstPage}
              disabled={pagination.currentPage === 0}
              className="btn-small btn-outline"
            >
              First
            </button>
            
            <button
              onClick={goToPreviousPage}
              disabled={pagination.currentPage === 0}
              className="btn-small btn-outline"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="page-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 0 || 
                         page === pagination.totalPages - 1 || 
                         (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1);
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="page-ellipsis">...</span>}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`btn-small ${page === pagination.currentPage ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {page + 1}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={pagination.currentPage === pagination.totalPages - 1}
              className="btn-small btn-outline"
            >
              Next
            </button>
            
            <button
              onClick={goToLastPage}
              disabled={pagination.currentPage === pagination.totalPages - 1}
              className="btn-small btn-outline"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;