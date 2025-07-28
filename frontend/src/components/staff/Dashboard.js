import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';
import { APPLICATION_STATUS, APPLICATION_TYPES } from '../../utils/constants';
import { getStatusLabel, getApplicationTypeLabel, formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import { T} from '../common/LanguageSwitcher';

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
      setError('');
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(<T>Fehler beim Laden der Anträge</T>);
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
          <T>Erneut versuchen</T>
        </button>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h2><T>Antrags-Dashboard</T></h2>
        <button onClick={fetchApplications} className="btn btn-outline">
          🔄 <T>Aktualisieren</T>
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total || 0}</div>
          <div className="stat-label"><T>Gesamt</T></div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.submitted || 0}</div>
          <div className="stat-label"><T>Neu eingereicht</T></div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.in_review || 0}</div>
          <div className="stat-label"><T>In Bearbeitung</T></div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.urgent || 0}</div>
          <div className="stat-label"><T>Eilanträge</T></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label><T>Status:</T></label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value=""><T>Alle Status</T></option>
              {Object.values(APPLICATION_STATUS).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label><T>Typ:</T></label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="form-select"
            >
              <option value=""><T>Alle Typen</T></option>
              {Object.values(APPLICATION_TYPES).map(type => (
                <option key={type} value={type}>
                  {getApplicationTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <label><T>Suche:</T></label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder={<T>Name, Referenznummer...</T>}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <Loading text={<T>Lade Anträge...</T>} />
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('reference_number')}>
                  <T>Referenznummer</T> {getSortIcon('reference_number')}
                </th>
                <th onClick={() => handleSort('type')}>
                  <T>Typ</T> {getSortIcon('type')}
                </th>
                <th onClick={() => handleSort('first_name')}>
                  <T>Antragsteller</T> {getSortIcon('first_name')}
                </th>
                <th onClick={() => handleSort('status')}>
                  <T>Status</T> {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('submitted_at')}>
                  <T>Eingereicht</T> {getSortIcon('submitted_at')}
                </th>
                <th onClick={() => handleSort('urgent_request')}>
                  <T>Eilantrag</T> {getSortIcon('urgent_request')}
                </th>
                <th><T>Aktionen</T></th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <T>Keine Anträge gefunden</T>
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
                        <span className="urgent-badge"><T>Eilantrag</T></span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="btn btn-small btn-primary"
                      >
                        <T>Details</T>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {applications.length > 0 && (
            <div className="table-footer">
              <p>
                <T>{applications.length} Anträge angezeigt</T>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
