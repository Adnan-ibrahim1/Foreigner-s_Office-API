import React, { useState } from 'react';
import { APPLICATION_TYPES } from '../../utils/constants';
import { validateEmail, validatePhone, validatePostalCode, getApplicationTypeLabel } from '../../utils/helpers';
import Loading from '../common/Loading';

const ApplicationForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    type: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    birthDate: '',
    notes: '',
    urgentRequest: false,
    documents: []
  });

  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setFormData(prev => ({
      ...prev,
      documents: selectedFiles
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) newErrors.type = 'Antragstyp ist erforderlich';
    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail-Adresse ist erforderlich';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefonnummer ist erforderlich';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Ungültige Telefonnummer';
    }
    if (!formData.address.trim()) newErrors.address = 'Adresse ist erforderlich';
    if (!formData.city.trim()) newErrors.city = 'Stadt ist erforderlich';
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postleitzahl ist erforderlich';
    } else if (!validatePostalCode(formData.postalCode)) {
      newErrors.postalCode = 'Ungültige Postleitzahl';
    }
    if (!formData.birthDate) newErrors.birthDate = 'Geburtsdatum ist erforderlich';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const applicationData = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key !== 'documents') {
        applicationData.append(key, formData[key]);
      }
    });

    // Add files
    files.forEach(file => {
      applicationData.append('documents', file);
    });

    onSubmit(applicationData);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setFormData(prev => ({
      ...prev,
      documents: newFiles
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <div className="form-section">
        <h3>Antragstyp</h3>
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Welchen Service benötigen Sie? *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`form-select ${errors.type ? 'error' : ''}`}
            required
          >
            <option value="">Bitte wählen...</option>
            {Object.values(APPLICATION_TYPES).map(type => (
              <option key={type} value={type}>
                {getApplicationTypeLabel(type)}
              </option>
            ))}
          </select>
          {errors.type && <span className="error-message">{errors.type}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Persönliche Daten</h3>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">Vorname *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              required
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">Nachname *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              required
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="birthDate" className="form-label">Geburtsdatum *</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className={`form-input ${errors.birthDate ? 'error' : ''}`}
            required
          />
          {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Kontaktdaten</h3>
        <div className="form-group">
          <label htmlFor="email" className="form-label">E-Mail-Adresse *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Telefonnummer *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
            required
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>Adresse</h3>
        <div className="form-group">
          <label htmlFor="address" className="form-label">Straße und Hausnummer *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`form-input ${errors.address ? 'error' : ''}`}
            required
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="postalCode" className="form-label">Postleitzahl *</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className={`form-input ${errors.postalCode ? 'error' : ''}`}
              maxLength="5"
              required
            />
            {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="city" className="form-label">Stadt *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`form-input ${errors.city ? 'error' : ''}`}
              required
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Dokumente</h3>
        <div className="form-group">
          <label htmlFor="documents" className="form-label">
            Dokumente anhängen (optional)
          </label>
          <input
            type="file"
            id="documents"
            name="documents"
            onChange={handleFileChange}
            className="form-file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <small className="form-help">
            Erlaubte Dateiformate: PDF, JPG, PNG, DOC, DOCX (max. 10MB pro Datei)
          </small>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            <h4>Ausgewählte Dateien:</h4>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="btn btn-small btn-danger"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Zusätzliche Informationen</h3>
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Anmerkungen (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            rows="4"
            placeholder="Fügen Sie hier zusätzliche Informationen hinzu..."
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              name="urgentRequest"
              checked={formData.urgentRequest}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            Eilantrag (Zusätzliche Gebühren können anfallen)
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loading size="small" text="" /> : 'Antrag einreichen'}
        </button>
        <p className="form-note">
          * Pflichtfelder müssen ausgefüllt werden
        </p>
      </div>
    </form>
  );
};

export default ApplicationForm;