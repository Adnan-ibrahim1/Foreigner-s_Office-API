import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import Dashboard from '../components/staff/Dashboard';
import ApplicationList from '../components/staff/ApplicationList';
import ApplicationDetail from '../components/staff/ApplicationDetail';
import Loading from '../components/common/Loading';

const StaffDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'list'
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    setIsLoading(true);
    
    if (authService.isAuthenticated()) {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await authService.login(loginForm.email, loginForm.password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setLoginForm({ email: '', password: '' });
      } else {
        setLoginError(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedApplication(null);
    navigate('/');
  };

  const handleApplicationSelect = (application) => {
    setSelectedApplication(application);
    setView('detail');
  };

  const handleApplicationUpdate = () => {
    // Refresh the application data
    setSelectedApplication(null);
    setView('dashboard');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (loginError) {
      setLoginError('');
    }
  };

  if (isLoading) {
    return (
      <div className="staff-dashboard-loading">
        <Loading size="large" text="Lade Mitarbeiter-Bereich..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="staff-login">
        <div className="container">
          <div className="login-container">
            <div className="login-card">
              <h1>Mitarbeiter-Anmeldung</h1>
              <p>Melden Sie sich an, um auf den Mitarbeiterbereich zuzugreifen.</p>
              
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">E-Mail-Adresse</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleInputChange}
                    className={`form-input ${loginError ? 'error' : ''}`}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Passwort</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleInputChange}
                    className={`form-input ${loginError ? 'error' : ''}`}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                
                {loginError && (
                  <div className="error-message">
                    {loginError}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? <Loading size="small" text="" /> : 'Anmelden'}
                </button>
              </form>
              
              <div className="login-help">
                <p>
                  <strong>Probleme beim Anmelden?</strong><br />
                  Kontaktieren Sie den IT-Support unter it-support@leipzig.de
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Mitarbeiter-Dashboard</h1>
            <p>Willkommen, {user?.name || user?.email}</p>
          </div>
          <div className="header-right">
            <div className="view-switcher">
              <button
                onClick={() => setView('dashboard')}
                className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setView('list')}
                className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline'}`}
              >
                📋 Antragsliste
              </button>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Abmelden
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {view === 'dashboard' && (
            <Dashboard onSelectApplication={handleApplicationSelect} />
          )}
          
          {view === 'list' && (
            <div className="list-view">
              <div className="list-sidebar">
                <ApplicationList 
                  onSelectApplication={handleApplicationSelect}
                  selectedApplication={selectedApplication}
                />
              </div>
              <div className="list-main">
                <ApplicationDetail
                  application={selectedApplication}
                  onUpdate={handleApplicationUpdate}
                  onClose={() => setSelectedApplication(null)}
                />
              </div>
            </div>
          )}
          
          {view === 'detail' && (
            <div className="detail-view">
              <button 
                onClick={() => setView('dashboard')}
                className="btn btn-outline back-btn"
              >
                ← Zurück zum Dashboard
              </button>
              <ApplicationDetail
                application={selectedApplication}
                onUpdate={handleApplicationUpdate}
                onClose={() => {
                  setSelectedApplication(null);
                  setView('dashboard');
                }}
              />
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Online seit:</span>
            <span className="stat-value">{new Date().toLocaleTimeString('de-DE')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Benutzer:</span>
            <span className="stat-value">{user?.name || 'Unbekannt'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rolle:</span>
            <span className="stat-value">{user?.is_admin ? 'Administrator' : 'Mitarbeiter'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;