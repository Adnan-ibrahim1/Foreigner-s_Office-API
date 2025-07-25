import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { APPLICATION_STATUS, APPLICATION_TYPES } from '../../utils/constants';
import { getStatusLabel, getApplicationTypeLabel, formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';

const Dashboard = ({ onSelectApplication }) => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    sortBy: 'submitted_at',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      params.sort_by = filters.sortBy;
      params.sort_order = filters.sortOrder;

      const response = await applicationAPI.getAllApplications(params);
      setApplications(response.data.applications || []);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Fehler beim Laden der Anträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      [APPLICATION_STATUS.SUBMITTED]: 'badge-primary',
      [APPLICATION_STATUS.IN_REVIEW]: 'badge-warning',
      [APPLICATION_STATUS.APPROVED]: 'badge-success',
      [APPLICATION_STATUS.REJECTED]: 'badge-danger',
      [APPLICATION_STATUS.COMPLETED]: 'badge-secondary'
    };
    return `status-badge ${classes[status] || 'badge-default'}`;
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={fetchApplications} className="btn btn-primary">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h2>Antrags-Dashboard</h2>
        <button onClick={fetchApplications} className="btn btn-outline">
          🔄 Aktualisieren
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total || 0}</div>
          <div className="stat-label">Gesamt</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.submitted || 0}</div>
          <div className="stat-label">Neu eingereicht</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.in_review || 0}</div>
          <div className="stat-label">In Bearbeitung</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.urgent || 0}</div>
          <div className="stat-label">Eilanträge</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">Alle Status</option>
              {Object.values(APPLICATION_STATUS).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Typ:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="form-select"
            >
              <option value="">Alle Typen</option>
              {Object.values(APPLICATION_TYPES).map(type => (
                <option key={type} value={type}>
                  {getApplicationTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Suche:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Name, Referenznummer..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <Loading text="Lade Anträge..." />
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('reference_number')}>
                  Referenznummer {getSortIcon('reference_number')}
                </th>
                <th onClick={() => handleSort('type')}>
                  Typ {getSortIcon('type')}
                </th>
                <th onClick={() => handleSort('first_name')}>
                  Antragsteller {getSortIcon('first_name')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('submitted_at')}>
                  Eingereicht {getSortIcon('submitted_at')}
                </th>
                <th onClick={() => handleSort('urgent_request')}>
                  Eilantrag {getSortIcon('urgent_request')}
                </th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Keine Anträge gefunden
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="application-row">
                    <td className="reference-cell">
                      <span className="reference-number">{app.reference_number}</span>
                    </td>
                    <td>{getApplicationTypeLabel(app.type)}</td>
                    <td>
                      <div className="applicant-info">
                        <div className="name">{app.first_name} {app.last_name}</div>
                        <div className="email">{app.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(app.status)}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td>{formatDate(app.submitted_at)}</td>
                    <td>
                      {app.urgent_request && (
                        <span className="urgent-badge">Eilantrag</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="btn btn-small btn-primary"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {applications.length > 0 && (
            <div className="table-footer">
              <p>{applications.length} Anträge angezeigt</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;