import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/auth';

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
            <h1>Leipzig Bürgerbüro</h1>
          </Link>
          
          <nav className="nav">
            {!isStaffArea ? (
              <>
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
                >
                  Startseite
                </Link>
                <Link 
                  to="/submit" 
                  className={location.pathname === '/submit' ? 'nav-link active' : 'nav-link'}
                >
                  Antrag stellen
                </Link>
                <Link 
                  to="/status" 
                  className={location.pathname === '/status' ? 'nav-link active' : 'nav-link'}
                >
                  Status prüfen
                </Link>
                <Link to="/staff" className="nav-link staff-link">
                  Mitarbeiter-Bereich
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/staff" 
                  className={location.pathname === '/staff' ? 'nav-link active' : 'nav-link'}
                >
                  Dashboard
                </Link>
                {user && (
                  <>
                    <span className="user-info">
                      Willkommen, {user.name}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">
                      Abmelden
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