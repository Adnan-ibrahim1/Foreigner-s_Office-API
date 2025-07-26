import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { APPLICATION_STATUS, APPLICATION_TYPES } from '../../utils/constants';
import { getStatusLabel, getApplicationTypeLabel, formatDateTime, debounce } from '../../utils/helpers';
import Loading from '../common/Loading';

const ApplicationList = ({ onSelectApplication, selectedApplication }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const debouncedSearch = debounce((term) => {
    fetchApplications(term);
  }, 300);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchApplications();
    }
  }, [searchTerm]);

  const fetchApplications = async (search = searchTerm) => {
    setIsLoading(true);
    try {
      const params = {
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;

      const response = await applicationAPI.getAllApplications(params);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Fehler beim Laden der Anträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      [APPLICATION_STATUS.SUBMITTED]: 'status-submitted',
      [APPLICATION_STATUS.IN_REVIEW]: 'status-in-review',
      [APPLICATION_STATUS.APPROVED]: 'status-approved',
      [APPLICATION_STATUS.REJECTED]: 'status-rejected',
      [APPLICATION_STATUS.COMPLETED]: 'status-completed'
    };
    return classes[status] || 'status-default';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (error) {
    return (
      <div className="application-list-error">
        <p>{error}</p>
        <button onClick={fetchApplications} className="btn btn-primary">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="application-list">
      <div className="list-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Suche nach Name, E-Mail oder Referenznummer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Status</option>
            {Object.values(APPLICATION_STATUS).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Alle Typen</option>
            {Object.values(APPLICATION_TYPES).map(type => (
              <option key={type} value={type}>
                {getApplicationTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Loading text="Lade Anträge..." />
      ) : (
        <div className="applications-container">
          <div className="applications-header">
            <div className="sort-controls">
              <button
                onClick={() => handleSort('submitted_at')}
                className={`sort-btn ${sortBy === 'submitted_at' ? 'active' : ''}`}
              >
                Datum{getSortIcon('submitted_at')}
              </button>
              <button
                onClick={() => handleSort('status')}
                className={`sort-btn ${sortBy === 'status' ? 'active' : ''}`}
              >
                Status{getSortIcon('status')}
              </button>
              <button
                onClick={() => handleSort('type')}
                className={`sort-btn ${sortBy === 'type' ? 'active' : ''}`}
              >
                Typ{getSortIcon('type')}
              </button>
            </div>
            <span className="results-count">
              {applications.length} Anträge
            </span>
          </div>

          <div className="applications-list">
            {applications.length === 0 ? (
              <div className="no-applications">
                <p>Keine Anträge gefunden.</p>
              </div>
            ) : (
              applications.map(application => (
                <div
                  key={application.id}
                  className={`application-item ${
                    selectedApplication?.id === application.id ? 'selected' : ''
                  }`}
                  onClick={() => onSelectApplication(application)}
                >
                  <div className="application-header">
                    <div className="reference-number">
                      {application.reference_number}
                    </div>
                    <div className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </div>
                  </div>
                  
                  <div className="application-info">
                    <div className="applicant-name">
                      {application.first_name} {application.last_name}
                    </div>
                    <div className="application-type">
                      {getApplicationTypeLabel(application.type)}
                    </div>
                  </div>
                  
                  <div className="application-meta">
                    <div className="submitted-date">
                      {formatDateTime(application.submitted_at)}
                    </div>
                    {application.urgent_request && (
                      <div className="urgent-indicator">
                        ⚡ Eilantrag
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;