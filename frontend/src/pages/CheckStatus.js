import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatusChecker from '../components/citizen/StatusChecker';
import ApplicationStatus from '../components/citizen/ApplicationStatus';
import { statusAPI } from '../services/api';

const CheckStatus = () => {
  const [searchParams] = useSearchParams();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if reference number is provided in URL
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      handleStatusCheck(refFromUrl);
    }
  }, [searchParams]);

  const handleStatusCheck = async (referenceNumber) => {
    setIsLoading(true);
    setError('');
    setApplication(null);

    try {
      const response = await statusAPI.checkStatus(referenceNumber);
      setApplication(response.data);
    } catch (error) {
      console.error('Status check error:', error);
      if (error.response?.status === 404) {
        setError('Antrag nicht gefunden. Bitte überprüfen Sie Ihre Referenznummer.');
      } else {
        setError(error.response?.data?.detail || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setApplication(null);
    setError('');
  };

  return (
    <div className="check-status-page">
      <div className="container">
        <div className="page-header">
          <h1>Antragsstatus überprüfen</h1>
          <p>
            Verfolgen Sie den Bearbeitungsstand Ihres Antrags in Echtzeit.
          </p>
        </div>

        {!application && !error && (
          <StatusChecker 
            onCheck={handleStatusCheck}
            isLoading={isLoading}
          />
        )}

        {error && (
          <div className="error-container">
            <div className="error-message">
              <div className="error-icon">❌</div>
              <h3>Antrag nicht gefunden</h3>
              <p>{error}</p>
              <button 
                onClick={handleNewSearch}
                className="btn btn-primary"
              >
                Erneut versuchen
              </button>
            </div>
            
            <div className="help-section">
              <h4>Hilfe bei der Suche</h4>
              <ul>
                <li>Überprüfen Sie, ob Sie die Referenznummer korrekt eingegeben haben</li>
                <li>Die Referenznummer hat das Format: LEI-XXXXXX-XXXXX</li>
                <li>Groß- und Kleinschreibung spielen keine Rolle</li>
                <li>Verwenden Sie keine Leerzeichen oder Bindestriche zwischen den Zeichen</li>
              </ul>
              
              <div className="contact-help">
                <h4>Immer noch Probleme?</h4>
                <p>
                  Kontaktieren Sie uns unter <strong>+49 341 123456</strong> oder 
                  <strong> buergerbuero@leipzig.de</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {application && (
          <div className="status-container">
            <ApplicationStatus application={application} />
            
            <div className="status-actions">
              <button 
                onClick={handleNewSearch}
                className="btn btn-secondary"
              >
                Anderen Antrag suchen
              </button>
              <button 
                onClick={() => handleStatusCheck(application.reference_number)}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Status aktualisieren
              </button>
            </div>
          </div>
        )}

        <div className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <h3>🔄 Automatische Updates</h3>
              <p>
                Sie erhalten automatisch E-Mail-Benachrichtigungen, 
                wenn sich der Status Ihres Antrags ändert.
              </p>
            </div>
            <div className="info-card">
              <h3>⏱️ Bearbeitungszeiten</h3>
              <p>
                Normale Anträge: 3-5 Werktage<br />
                Eilanträge: 1-2 Werktage<br />
                (Je nach Antragstyp)
              </p>
            </div>
            <div className="info-card">
              <h3>📞 Support</h3>
              <p>
                Bei Fragen stehen wir Ihnen gerne zur Verfügung:<br />
                Tel: +49 341 123456<br />
                E-Mail: buergerbuero@leipzig.de
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;