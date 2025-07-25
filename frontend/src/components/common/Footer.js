import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Kontakt</h3>
            <p>
              <strong>Leipzig Bürgerbüro</strong><br />
              Neues Rathaus<br />
              Martin-Luther-Ring 4-6<br />
              04109 Leipzig
            </p>
            <p>
              <strong>Telefon:</strong> {process.env.REACT_APP_CONTACT_PHONE || '+49 341 123456'}<br />
              <strong>E-Mail:</strong> {process.env.REACT_APP_CONTACT_EMAIL || 'buergerbuero@leipzig.de'}
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Öffnungszeiten</h3>
            <p>
              <strong>Montag - Mittwoch:</strong> 8:00 - 16:00 Uhr<br />
              <strong>Donnerstag:</strong> 8:00 - 18:00 Uhr<br />
              <strong>Freitag:</strong> 8:00 - 12:00 Uhr<br />
              <strong>Samstag:</strong> Geschlossen
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li>Personalausweis beantragen</li>
              <li>Reisepass beantragen</li>
              <li>Meldebescheinigung</li>
              <li>Geburtsurkunde</li>
              <li>Gewerbeschein</li>
              <li>Weitere Dienstleistungen</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Rechtliches</h3>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Impressum</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Datenschutz</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Barrierefreiheit</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Sitemap</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Stadt Leipzig. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;