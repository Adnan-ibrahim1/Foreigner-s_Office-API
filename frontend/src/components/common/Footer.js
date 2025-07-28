import React from 'react';
import { T } from '../common/LanguageSwitcher';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3><T>Kontakt</T></h3>
            <p>
              <strong><T>Leipzig Bürgerbüro</T></strong><br />
              <T>Neues Rathaus</T><br />
              <T>Martin-Luther-Ring 4-6</T><br />
              <T>04109 Leipzig</T>
            </p>
            <p>
              <strong><T>Telefon</T>:</strong> {process.env.REACT_APP_CONTACT_PHONE || '+49 341 123456'}<br />
              <strong><T>E-Mail</T>:</strong> {process.env.REACT_APP_CONTACT_EMAIL || 'buergerbuero@leipzig.de'}
            </p>
          </div>

          <div className="footer-section">
            <h3><T>Öffnungszeiten</T></h3>
            <p>
              <strong><T>Montag - Mittwoch</T>:</strong> <T>8:00 - 16:00 Uhr</T><br />
              <strong><T>Donnerstag</T>:</strong> <T>8:00 - 18:00 Uhr</T><br />
              <strong><T>Freitag</T>:</strong> <T>8:00 - 12:00 Uhr</T><br />
              <strong><T>Samstag</T>:</strong> <T>Geschlossen</T>
            </p>
          </div>

          <div className="footer-section">
            <h3><T>Services</T></h3>
            <ul>
              <li><T>Personalausweis beantragen</T></li>
              <li><T>Reisepass beantragen</T></li>
              <li><T>Meldebescheinigung</T></li>
              <li><T>Geburtsurkunde</T></li>
              <li><T>Gewerbeschein</T></li>
              <li><T>Weitere Dienstleistungen</T></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3><T>Rechtliches</T></h3>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}><T>Impressum</T></a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}><T>Datenschutz</T></a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}><T>Barrierefreiheit</T></a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}><T>Sitemap</T></a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 <T>Stadt Leipzig. Alle Rechte vorbehalten.</T></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
