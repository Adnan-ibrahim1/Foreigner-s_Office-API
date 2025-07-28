import React, { useState } from 'react';
import { applicationAPI } from '../../services/api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { getApplicationTypeLabel, getStatusLabel, formatDateTime } from '../../utils/helpers';
import Loading from '../common/Loading';
import { T} from '../common/LanguageSwitcher';

const ApplicationDetail = ({ application, onUpdate, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(application?.status || '');
  const [notes, setNotes] = useState(application?.staff_notes || '');
  const [comment, setComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (!application) {
    return (
      <div className="application-detail empty">
        <p><T>Wählen Sie einen Antrag aus der Liste aus, um Details anzuzeigen.</T></p>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (newStatus === application.status && notes === application.staff_notes) {
      return;
    }

    setIsUpdating(true);
    try {
      await applicationAPI.updateApplicationStatus(application.id, newStatus, notes);
      onUpdate();
    } catch (error) {
      console.error('Error updating application:', error);
      alert(<T>Fehler beim Aktualisieren des Antrags</T>);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setIsAddingComment(true);
    try {
      await applicationAPI.addComment(application.id, comment);
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(<T>Fehler beim Hinzufügen des Kommentars</T>);
    } finally {
      setIsAddingComment(false);
    }
  };

  const canUpdateStatus = () => {
    return application.status !== APPLICATION_STATUS.COMPLETED && 
           application.status !== APPLICATION_STATUS.REJECTED;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      [APPLICATION_STATUS.SUBMITTED]: APPLICATION_STATUS.IN_REVIEW,
      [APPLICATION_STATUS.IN_REVIEW]: APPLICATION_STATUS.APPROVED,
      [APPLICATION_STATUS.APPROVED]: APPLICATION_STATUS.COMPLETED
    };
    return statusFlow[currentStatus];
  };

  return (
    <div className="application-detail">
      <div className="detail-header">
        <div className="header-left">
          <h2><T>Antragsdetails</T></h2>
          <span className="reference-number">{application.reference_number}</span>
        </div>
        <button onClick={onClose} className="close-btn" title={<T>Schließen</T>}>
          ✕
        </button>
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <section className="detail-section">
          <h3><T>Grundinformationen</T></h3>
          <div className="info-grid">
            <div className="info-item">
              <label><T>Antragstyp:</T></label>
              <span>{getApplicationTypeLabel(application.type)}</span>
            </div>
            <div className="info-item">
              <label><T>Status:</T></label>
              <span className={`status-badge status-${application.status}`}>
                {getStatusLabel(application.status)}
              </span>
            </div>
            <div className="info-item">
              <label><T>Eingereicht am:</T></label>
              <span>{formatDateTime(application.submitted_at)}</span>
            </div>
            <div className="info-item">
              <label><T>Zuletzt aktualisiert:</T></label>
              <span>{formatDateTime(application.updated_at)}</span>
            </div>
            {application.urgent_request && (
              <div className="info-item">
                <label><T>Eilantrag:</T></label>
                <span className="urgent-badge"><T>Ja</T></span>
              </div>
            )}
          </div>
        </section>

        {/* Applicant Information */}
        <section className="detail-section">
          <h3><T>Antragsteller</T></h3>
          <div className="info-grid">
            <div className="info-item">
              <label><T>Name:</T></label>
              <span>{application.first_name} {application.last_name}</span>
            </div>
            <div className="info-item">
              <label><T>Geburtsdatum:</T></label>
              <span>{application.birth_date}</span>
            </div>
            <div className="info-item">
              <label><T>E-Mail:</T></label>
              <span>
                <a href={`mailto:${application.email}`}>{application.email}</a>
              </span>
            </div>
            <div className="info-item">
              <label><T>Telefon:</T></label>
              <span>
                <a href={`tel:${application.phone}`}>{application.phone}</a>
              </span>
            </div>
            <div className="info-item full-width">
              <label><T>Adresse:</T></label>
              <span>
                {application.address}<br />
                {application.postal_code} {application.city}
              </span>
            </div>
          </div>
        </section>

        {/* Notes and Comments */}
        {application.notes && (
          <section className="detail-section">
            <h3><T>Anmerkungen des Antragstellers</T></h3>
            <div className="notes-content">
              {application.notes}
            </div>
          </section>
        )}

        {/* Documents */}
        {application.documents && application.documents.length > 0 && (
          <section className="detail-section">
            <h3><T>Dokumente</T></h3>
            <div className="documents-list">
              {application.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="document-name">{doc.name}</span>
                  <span className="document-size">({doc.size})</span>
                  <button className="btn btn-small btn-outline">
                    <T>Herunterladen</T>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Status Update */}
        <section className="detail-section">
          <h3><T>Status aktualisieren</T></h3>
          <div className="status-update">
            <div className="form-group">
              <label htmlFor="status-select"><T>Neuer Status:</T></label>
              <select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-select"
                disabled={!canUpdateStatus()}
              >
                {Object.values(APPLICATION_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notes-textarea"><T>Interne Notizen:</T></label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows="4"
                placeholder={<T>Interne Notizen für andere Mitarbeiter...</T>}
              />
            </div>

            <div className="status-actions">
              <button
                onClick={handleStatusUpdate}
                className="btn btn-primary"
                disabled={isUpdating || !canUpdateStatus()}
              >
                {isUpdating ? <Loading size="small" text="" /> : <T>Status aktualisieren</T>}
              </button>
              
              {canUpdateStatus() && getNextStatus(application.status) && (
                <button
                  onClick={() => {
                    setNewStatus(getNextStatus(application.status));
                    setTimeout(handleStatusUpdate, 100);
                  }}
                  className="btn btn-outline"
                  disabled={isUpdating}
                >
                  <T>Zum nächsten Status</T>
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApplicationDetail;
