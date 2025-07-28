import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/citizen/ApplicationForm';
import { applicationAPI } from '../services/api';
import { T } from '../components/common/LanguageSwitcher';

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
        error: error.response?.data?.detail || <T>Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</T>
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
              <h1><T>Antrag erfolgreich eingereicht!</T></h1>
              <p>
                <T>Ihr Antrag wurde erfolgreich eingereicht und hat die Referenznummer:</T>
              </p>
              <div className="reference-number">
                {submitResult.referenceNumber}
              </div>
              <p>
                <T>Bitte notieren Sie sich diese Nummer. Sie benötigen sie, um den Status Ihres Antrags zu verfolgen.</T>
              </p>
              <div className="next-steps">
                <h3><T>Nächste Schritte:</T></h3>
                <ul>
                  <li><T>Sie erhalten eine Bestätigungs-E-Mail mit allen Details</T></li>
                  <li><T>Wir werden Ihren Antrag innerhalb von 2-3 Werktagen bearbeiten</T></li>
                  <li><T>Sie werden über den Fortschritt per E-Mail informiert</T></li>
                  <li><T>Den aktuellen Status können Sie jederzeit online überprüfen</T></li>
                </ul>
              </div>
              <div className="actions">
                <button 
                  onClick={() => navigate(`/status?ref=${submitResult.referenceNumber}`)}
                  className="btn btn-primary"
                >
                  <T>Status überprüfen</T>
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="btn btn-secondary"
                >
                  <T>Zur Startseite</T>
                </button>
              </div>
              <p className="redirect-notice">
                <T>Sie werden automatisch zur Statusseite weitergeleitet...</T>
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
              <h1><T>Fehler beim Einreichen des Antrags</T></h1>
              <p>{submitResult.error}</p>
              <button 
                onClick={() => setSubmitResult(null)}
                className="btn btn-primary"
              >
                <T>Erneut versuchen</T>
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
          <h1><T>Antrag stellen</T></h1>
          <p>
            <T>Füllen Sie das folgende Formular aus, um Ihren Antrag zu stellen. Alle mit * markierten Felder sind Pflichtfelder.</T>
          </p>
        </div>

        <div className="form-container">
          <ApplicationForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="help-section">
          <h3><T>Benötigen Sie Hilfe?</T></h3>
          <div className="help-grid">
            <div className="help-item">
              <h4>📞 <T>Telefonische Beratung</T></h4>
              <p>
                <T>Rufen Sie uns an:</T> +49 341 123456<br />
                <T>Mo-Fr: 8:00-16:00 Uhr</T>
              </p>
            </div>
            <div className="help-item">
              <h4>✉️ <T>E-Mail Support</T></h4>
              <p>
                <T>Schreiben Sie uns:</T> buergerbuero@leipzig.de<br />
                <T>Wir antworten innerhalb von 24 Stunden</T>
              </p>
            </div>
            <div className="help-item">
              <h4>🏢 <T>Persönlicher Besuch</T></h4>
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
