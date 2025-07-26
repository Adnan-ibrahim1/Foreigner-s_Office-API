import React, { useState } from 'react';
import Loading from '../common/Loading';

const StatusChecker = ({ onCheck, isLoading }) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!referenceNumber.trim()) {
      setError('Bitte geben Sie eine Referenznummer ein');
      return;
    }

    if (referenceNumber.length < 5) {
      setError('Die Referenznummer ist zu kurz');
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
        <h2>Status überprüfen</h2>
        <p>
          Geben Sie Ihre Referenznummer ein, um den aktuellen Status 
          Ihres Antrags zu überprüfen.
        </p>
        
        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label htmlFor="referenceNumber" className="form-label">
              Referenznummer
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
            {isLoading ? <Loading size="small" text="" /> : 'Status prüfen'}
          </button>
        </form>

        <div className="help-text">
          <h4>Wo finde ich meine Referenznummer?</h4>
          <ul>
            <li>In der Bestätigungs-E-Mail nach der Antragstellung</li>
            <li>In der SMS, die Sie erhalten haben</li>
            <li>Auf dem Ausdruck, den Sie nach der Online-Antragstellung erhalten haben</li>
          </ul>
          
          <p>
            <strong>Format:</strong> Die Referenznummer hat das Format LEI-XXXXXX-XXXXX 
            und besteht aus Buchstaben und Zahlen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusChecker;