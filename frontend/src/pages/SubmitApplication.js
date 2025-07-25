import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/citizen/ApplicationForm';
import { applicationAPI } from '../services/api';

const SubmitApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (applicationData) => {
    setIsSubmitting(true);
    
    try {
      const response = await applicationAPI.submitApplication(applicationData);
      const { reference_number, id } = response.data;
      
      setSubmitResult({
        success: true,
        referenceNumber: reference_number,
        applicationId: id
      });
      
      // Redirect to status page after 3 seconds
      setTimeout(() => {
        navigate(`/status?ref=${reference_number}`);
      }, 3000);
      
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitResult({
        success: false,
        error: error.response?.data?.detail || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    if (submitResult.success) {
      return (
        <div className="submit-application-page">
          <div className="container">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h1>Antrag erfolgreich eingereicht!</h1>
              <p>
                Ihr Antrag wurde erfolgreich eingereicht und hat die Referenznummer:
              </p>
              <div className="reference-number">
                {submitResult.referenceNumber}
              </div>
              <p>
                Bitte notieren Sie sich diese Nummer. Sie benötigen sie, um den Status 
                Ihres Antrags zu verfolgen.
              </p>
              <div className="next-steps">
                <h3>Nächste Schritte:</h3>
                <ul>
                  <li>Sie erhalten eine Bestätigungs-E-Mail mit allen Details</li>
                  <li>Wir werden Ihren Antrag innerhalb von 2-3 Werktagen bearbeiten</li>
                  <li>Sie werden über den Fortschritt per E-Mail informiert</li>
                  <li>Den aktuellen Status können Sie jederzeit online überprüfen</li>
                </ul>
              </div>
              <div className="actions">
                <button 
                  onClick={() => navigate(`/status?ref=${submitResult.referenceNumber}`)}
                  className="btn btn-primary"
                >
                  Status überprüfen
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                >
                  Zur Startseite
                </button>
              </div>
              <p className="redirect-notice">
                Sie werden automatisch zur Statusseite weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="submit-application-page">
          <div className="container">
            <div className="error-message">
              <div className="error-icon">❌</div>
              <h1>Fehler beim Einreichen des Antrags</h1>
              <p>{submitResult.error}</p>
              <button 
                onClick={() => setSubmitResult(null)}
                className="btn btn-primary"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="submit-application-page">
      <div className="container">
        <div className="page-header">
          <h1>Antrag stellen</h1>
          <p>
            Füllen Sie das folgende Formular aus, um Ihren Antrag zu stellen. 
            Alle mit * markierten Felder sind Pflichtfelder.
          </p>
        </div>

        <div className="form-container">
          <ApplicationForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="help-section">
          <h3>Benötigen Sie Hilfe?</h3>
          <div className="help-grid">
            <div className="help-item">
              <h4>📞 Telefonische Beratung</h4>
              <p>
                Rufen Sie uns an: +49 341 123456<br />
                Mo-Fr: 8:00-16:00 Uhr
              </p>
            </div>
            <div className="help-item">
              <h4>✉️ E-Mail Support</h4>
              <p>
                Schreiben Sie uns: buergerbuero@leipzig.de<br />
                Wir antworten innerhalb von 24 Stunden
              </p>
            </div>
            <div className="help-item">
              <h4>🏢 Persönlicher Besuch</h4>
              <p>
                Neues Rathaus, Martin-Luther-Ring 4-6<br />
                04109 Leipzig
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitApplication;