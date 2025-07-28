import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import Dashboard from '../components/staff/Dashboard';
import ApplicationList from '../components/staff/ApplicationList';
import ApplicationDetail from '../components/staff/ApplicationDetail';
import Loading from '../components/common/Loading';
import { T } from '../components/common/LanguageSwitcher';

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
      setLoginError(<T>Ein unerwarteter Fehler ist aufgetreten</T>);
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
        <Loading size="large" text={<T>Lade Mitarbeiter-Bereich...</T>} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="staff-login">
        <div className="container">
          <div className="login-container">
            <div className="login-card">
              <h1><T>Mitarbeiter-Anmeldung</T></h1>
              <p><T>Melden Sie sich an, um auf den Mitarbeiterbereich zuzugreifen.</T></p>
              
              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label"><T>E-Mail-Adresse</T></label>
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
                  <label htmlFor="password" className="form-label"><T>Passwort</T></label>
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
                  {isLoggingIn ? <Loading size="small" text="" /> : <T>Anmelden</T>}
                </button>
              </form>
              
              <div className="login-help">
                <p>
                  <strong><T>Probleme beim Anmelden?</T></strong><br />
                  <T>Kontaktieren Sie den IT-Support unter it-support@leipzig.de</T>
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
            <h1><T>Mitarbeiter-Dashboard</T></h1>
            <p>
              <T>Willkommen,</T> {user?.name || user?.email}
            </p>
          </div>
          <div className="header-right">
            <div className="view-switcher">
              <button
                onClick={() => setView('dashboard')}
                className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
              >
                📊 <T>Dashboard</T>
              </button>
              <button
                onClick={() => setView('list')}
                className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline'}`}
              >
                📋 <T>Antragsliste</T>
              </button>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              <T>Abmelden</T>
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
                ← <T>Zurück zum Dashboard</T>
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
            <span className="stat-label"><T>Online seit:</T></span>
            <span className="stat-value">{new Date().toLocaleTimeString('de-DE')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label"><T>Benutzer:</T></span>
            <span className="stat-value">{user?.name || <T>Unbekannt</T>}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label"><T>Rolle:</T></span>
            <span className="stat-value">{user?.is_admin ? <T>Administrator</T> : <T>Mitarbeiter</T>}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
