import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
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
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Willkommen beim Leipzig Bürgerbüro</h1>
            <p className="hero-subtitle">
              Stellen Sie Ihre Anträge bequem online und verfolgen Sie den Status in Echtzeit.
            </p>
            <div className="hero-actions">
              <Link to="/submit" className="btn btn-primary btn-large">
                Antrag stellen
              </Link>
              <Link to="/status" className="btn btn-secondary btn-large">
                Status prüfen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2>Unsere Dienstleistungen</h2>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/submit" className="btn btn-outline">
                  Beantragen
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
              <h3>🕒 Schnell & Einfach</h3>
              <p>
                Stellen Sie Ihre Anträge online in wenigen Minuten. 
                Keine langen Wartezeiten mehr!
              </p>
            </div>
            <div className="info-card">
              <h3>🔍 Status verfolgen</h3>
              <p>
                Verfolgen Sie den Bearbeitungsstand Ihres Antrags 
                jederzeit online.
              </p>
            </div>
            <div className="info-card">
              <h3>🔒 Sicher & Zuverlässig</h3>
              <p>
                Ihre Daten sind bei uns sicher und werden 
                vertraulich behandelt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-info">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-item">
              <h3>Persönliche Beratung</h3>
              <p>
                Benötigen Sie Hilfe? Besuchen Sie uns im Neuen Rathaus 
                oder vereinbaren Sie einen Termin.
              </p>
              <p>
                <strong>Adresse:</strong><br />
                Neues Rathaus<br />
                Martin-Luther-Ring 4-6<br />
                04109 Leipzig
              </p>
            </div>
            <div className="contact-item">
              <h3>Kontakt</h3>
              <p>
                <strong>Telefon:</strong> +49 341 123456<br />
                <strong>E-Mail:</strong> buergerbuero@leipzig.de
              </p>
              <p>
                <strong>Öffnungszeiten:</strong><br />
                Mo-Mi: 8:00-16:00 Uhr<br />
                Do: 8:00-18:00 Uhr<br />
                Fr: 8:00-12:00 Uhr
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;