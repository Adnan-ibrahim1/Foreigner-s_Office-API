import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StatusChecker from '../components/citizen/StatusChecker';
import ApplicationStatus from '../components/citizen/ApplicationStatus';
import { statusAPI } from '../services/api';
import { T } from '../components/common/LanguageSwitcher';

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
        setError(<T>Antrag nicht gefunden. Bitte überprüfen Sie Ihre Referenznummer.</T>);
      } else {
        setError(error.response?.data?.detail || <T>Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</T>);
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
          <h1><T>Antragsstatus überprüfen</T></h1>
          <p>
            <T>Verfolgen Sie den Bearbeitungsstand Ihres Antrags in Echtzeit.</T>
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
              <h3><T>Antrag nicht gefunden</T></h3>
              <p>{error}</p>
              <button 
                onClick={handleNewSearch}
                className="btn btn-primary"
              >
                <T>Erneut versuchen</T>
              </button>
            </div>
            
            <div className="help-section">
              <h4><T>Hilfe bei der Suche</T></h4>
              <ul>
                <li><T>Überprüfen Sie, ob Sie die Referenznummer korrekt eingegeben haben</T></li>
                <li><T>Die Referenznummer hat das Format: LEI-XXXXXX-XXXXX</T></li>
                <li><T>Groß- und Kleinschreibung spielen keine Rolle</T></li>
                <li><T>Verwenden Sie keine Leerzeichen oder Bindestriche zwischen den Zeichen</T></li>
              </ul>
              
              <div className="contact-help">
                <h4><T>Immer noch Probleme?</T></h4>
                <p>
                  <T>
                    Kontaktieren Sie uns unter <strong>+49 341 123456</strong> oder 
                    <strong> buergerbuero@leipzig.de</strong>
                  </T>
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
                <T>Anderen Antrag suchen</T>
              </button>
              <button 
                onClick={() => handleStatusCheck(application.reference_number)}
                className="btn btn-outline"
                disabled={isLoading}
              >
                <T>Status aktualisieren</T>
              </button>
            </div>
          </div>
        )}

        <div className="info-section">
          <div className="info-grid">
            <div className="info-card">
              <h3>🔄 <T>Automatische Updates</T></h3>
              <p>
                <T>
                  Sie erhalten automatisch E-Mail-Benachrichtigungen, 
                  wenn sich der Status Ihres Antrags ändert.
                </T>
              </p>
            </div>
            <div className="info-card">
              <h3>⏱️ <T>Bearbeitungszeiten</T></h3>
              <p>
                <T>Normale Anträge: 3-5 Werktage</T><br />
                <T>Eilanträge: 1-2 Werktage</T><br />
                <T>(Je nach Antragstyp)</T>
              </p>
            </div>
            <div className="info-card">
              <h3>📞 <T>Support</T></h3>
              <p>
                <T>
                  Bei Fragen stehen wir Ihnen gerne zur Verfügung:<br />
                  Tel: +49 341 123456<br />
                  E-Mail: buergerbuero@leipzig.de
                </T>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckStatus;
