import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/auth';
import { T } from '../common/LanguageSwitcher';

const Header = () => {
  const location = useLocation();
  const isStaffArea = location.pathname.startsWith('/staff');
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1><T>Leipzig Bürgerbüro</T></h1>
          </Link>

          <nav className="nav">
            {!isStaffArea ? (
              <>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                >
                  <T>Startseite</T>
                </Link>
                <Link 
                  to="/submit" 
                  className={location.pathname === '/submit' ? 'nav-link active' : 'nav-link'}
                >
                  <T>Antrag stellen</T>
                </Link>
                <Link 
                  to="/status" 
                  className={location.pathname === '/status' ? 'nav-link active' : 'nav-link'}
                >
                  <T>Status prüfen</T>
                </Link>
                <Link to="/staff" className="nav-link staff-link">
                  <T>Mitarbeiter-Bereich</T>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/staff" 
                  className={location.pathname === '/staff' ? 'nav-link active' : 'nav-link'}
                >
                  <T>Dashboard</T>
                </Link>
                {user && (
                  <>
                    <span className="user-info">
                      <T>Willkommen</T>, {user.name}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                      <T>Abmelden</T>
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
