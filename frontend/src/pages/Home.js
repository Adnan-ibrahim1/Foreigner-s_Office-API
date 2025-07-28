import React from 'react';
import { Link } from 'react-router-dom';
import { T, useTranslation } from '../components/common/LanguageSwitcher';

const Home = () => {
  const { currentLang, changeLanguage, isTranslating, availableLanguages } = useTranslation();
  
  const getFlag = (code) => {
    const flags = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
      'ar': '🇸🇦', 'hi': '🇮🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱'
    };
    return flags[code] || '🌐';
  };

  const commonLanguages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const services = [
    {
      id: 1,
      title: 'Personalausweis',
      description: 'Beantragen Sie einen neuen Personalausweis oder verlängern Sie den bestehenden.',
      icon: '🆔'
    },
    {
      id: 2,
      title: 'Reisepass',
      description: 'Stellen Sie einen Antrag für Ihren neuen Reisepass für Auslandsreisen.',
      icon: '📖'
    },
    {
      id: 3,
      title: 'Meldebescheinigung',
      description: 'Erhalten Sie eine Bescheinigung über Ihre gemeldete Adresse.',
      icon: '🏠'
    },
    {
      id: 4,
      title: 'Geburtsurkunde',
      description: 'Beantragen Sie eine offizielle Geburtsurkunde.',
      icon: '👶'
    },
    {
      id: 5,
      title: 'Heiratsurkunde',
      description: 'Erhalten Sie eine Kopie Ihrer Heiratsurkunde.',
      icon: '💒'
    },
    {
      id: 6,
      title: 'Gewerbeschein',
      description: 'Melden Sie Ihr Gewerbe an oder ummelden.',
      icon: '🏢'
    }
  ];

  return (
    <div className="home-page">
      {/* Language Switcher Section */}
      <section className="language-switcher" style={{ backgroundColor: '#f8f9fa', padding: '1rem 0', borderBottom: '1px solid #dee2e6' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#495057' }}>
              <T>Select Language / Sprache wählen</T>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {commonLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  disabled={isTranslating}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #dee2e6',
                    backgroundColor: currentLang === lang.code ? '#007bff' : '#ffffff',
                    color: currentLang === lang.code ? '#ffffff' : '#495057',
                    cursor: isTranslating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    opacity: isTranslating ? 0.6 : 1
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          {isTranslating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#007bff' }}>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid #007bff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '0.9rem' }}>
                <T>Translating...</T>
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1><T>Willkommen beim Leipzig Bürgerbüro</T></h1>
            <p className="hero-subtitle">
              <T>Stellen Sie Ihre Anträge bequem online und verfolgen Sie den Status in Echtzeit.</T>
            </p>
            <div className="hero-actions">
              <Link to="/submit" className="btn btn-primary btn-large">
                <T>Antrag stellen</T>
              </Link>
              <Link to="/status" className="btn btn-secondary btn-large">
                <T>Status prüfen</T>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2><T>Unsere Dienstleistungen</T></h2>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3><T>{service.title}</T></h3>
                <p><T>{service.description}</T></p>
                <Link to="/submit" className="btn btn-outline">
                  <T>Beantragen</T>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3><T>🕒 Schnell & Einfach</T></h3>
              <p>
                <T>Stellen Sie Ihre Anträge online in wenigen Minuten. Keine langen Wartezeiten mehr!</T>
              </p>
            </div>
            <div className="info-card">
              <h3><T>🔍 Status verfolgen</T></h3>
              <p>
                <T>Verfolgen Sie den Bearbeitungsstand Ihres Antrags jederzeit online.</T>
              </p>
            </div>
            <div className="info-card">
              <h3><T>🔒 Sicher & Zuverlässig</T></h3>
              <p>
                <T>Ihre Daten sind bei uns sicher und werden vertraulich behandelt.</T>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-info">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-item">
              <h3><T>Persönliche Beratung</T></h3>
              <p>
                <T>Benötigen Sie Hilfe? Besuchen Sie uns im Neuen Rathaus oder vereinbaren Sie einen Termin.</T>
              </p>
              <p>
                <strong><T>Adresse:</T></strong><br />
                <T>Neues Rathaus</T><br />
                Martin-Luther-Ring 4-6<br />
                04109 Leipzig
              </p>
            </div>
            <div className="contact-item">
              <h3><T>Kontakt</T></h3>
              <p>
                <strong><T>Telefon:</T></strong> +49 341 123456<br />
                <strong><T>E-Mail:</T></strong> buergerbuero@leipzig.de
              </p>
              <p>
                <strong><T>Öffnungszeiten:</T></strong><br />
                <T>Mo-Mi: 8:00-16:00 Uhr</T><br />
                <T>Do: 8:00-18:00 Uhr</T><br />
                <T>Fr: 8:00-12:00 Uhr</T>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;