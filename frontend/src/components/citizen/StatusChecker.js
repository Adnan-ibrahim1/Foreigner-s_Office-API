import React, { useState } from 'react';
import Loading from '../common/Loading';
import { T } from '../common/LanguageSwitcher';

const StatusChecker = ({ onCheck, isLoading }) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!referenceNumber.trim()) {
      setError(<T>Bitte geben Sie eine Referenznummer ein</T>);
      return;
    }

    if (referenceNumber.length < 5) {
      setError(<T>Die Referenznummer ist zu kurz</T>);
      return;
    }

    setError('');
    onCheck(referenceNumber.trim());
  };

  const handleInputChange = (e) => {
    setReferenceNumber(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="status-checker">
      <div className="checker-card">
        <h2><T>Status überprüfen</T></h2>
        <p>
          <T>
            Geben Sie Ihre Referenznummer ein, um den aktuellen Status 
            Ihres Antrags zu überprüfen.
          </T>
        </p>

        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label htmlFor="referenceNumber" className="form-label">
              <T>Referenznummer</T>
            </label>
            <input
              type="text"
              id="referenceNumber"
              value={referenceNumber}
              onChange={handleInputChange}
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="z.B. LEI-ABC123-XYZ"
              disabled={isLoading}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={isLoading}
          >
            {isLoading ? <Loading size="small" text="" /> : <T>Status prüfen</T>}
          </button>
        </form>

        <div className="help-text">
          <h4><T>Wo finde ich meine Referenznummer?</T></h4>
          <ul>
            <li><T>In der Bestätigungs-E-Mail nach der Antragstellung</T></li>
            <li><T>In der SMS, die Sie erhalten haben</T></li>
            <li><T>Auf dem Ausdruck, den Sie nach der Online-Antragstellung erhalten haben</T></li>
          </ul>

          <p>
            <strong><T>Format:</T></strong>{' '}
            <T>
              Die Referenznummer hat das Format LEI-XXXXXX-XXXXX 
              und besteht aus Buchstaben und Zahlen.
            </T>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusChecker;
