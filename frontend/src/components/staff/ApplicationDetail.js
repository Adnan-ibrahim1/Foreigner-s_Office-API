import React, { useState } from 'react';
import { applicationAPI } from '../../services/api';
import { APPLICATION_STATUS } from '../../utils/constants';
import { getApplicationTypeLabel, getStatusLabel, formatDateTime } from '../../utils/helpers';
import Loading from '../common/Loading';

const ApplicationDetail = ({ application, onUpdate, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(application?.status || '');
  const [notes, setNotes] = useState(application?.staff_notes || '');
  const [comment, setComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (!application) {
    return (
      <div className="application-detail empty">
        <p>Wählen Sie einen Antrag aus der Liste aus, um Details anzuzeigen.</p>
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
      alert('Fehler beim Aktualisieren des Antrags');
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
      alert('Fehler beim Hinzufügen des Kommentars');
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
          <h2>Antragsdetails</h2>
          <span className="reference-number">{application.reference_number}</span>
        </div>
        <button onClick={onClose} className="close-btn" title="Schließen">
          ✕
        </button>
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <section className="detail-section">
          <h3>Grundinformationen</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Antragstyp:</label>
              <span>{getApplicationTypeLabel(application.type)}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge status-${application.status}`}>
                {getStatusLabel(application.status)}
              </span>
            </div>
            <div className="info-item">
              <label>Eingereicht am:</label>
              <span>{formatDateTime(application.submitted_at)}</span>
            </div>
            <div className="info-item">
              <label>Zuletzt aktualisiert:</label>
              <span>{formatDateTime(application.updated_at)}</span>
            </div>
            {application.urgent_request && (
              <div className="info-item">
                <label>Eilantrag:</label>
                <span className="urgent-badge">Ja</span>
              </div>
            )}
          </div>
        </section>

        {/* Applicant Information */}
        <section className="detail-section">
          <h3>Antragsteller</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{application.first_name} {application.last_name}</span>
            </div>
            <div className="info-item">
              <label>Geburtsdatum:</label>
              <span>{application.birth_date}</span>
            </div>
            <div className="info-item">
              <label>E-Mail:</label>
              <span>
                <a href={`mailto:${application.email}`}>{application.email}</a>
              </span>
            </div>
            <div className="info-item">
              <label>Telefon:</label>
              <span>
                <a href={`tel:${application.phone}`}>{application.phone}</a>
              </span>
            </div>
            <div className="info-item full-width">
              <label>Adresse:</label>
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
            <h3>Anmerkungen des Antragstellers</h3>
            <div className="notes-content">
              {application.notes}
            </div>
          </section>
        )}

        {/* Documents */}
        {application.documents && application.documents.length > 0 && (
          <section className="detail-section">
            <h3>Dokumente</h3>
            <div className="documents-list">
              {application.documents.map((doc, index) => (
                <div key={index} className="document-item">
                  <span className="document-name">{doc.name}</span>
                  <span className="document-size">({doc.size})</span>
                  <button className="btn btn-small btn-outline">
                    Herunterladen
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Status Update */}
        <section className="detail-section">
          <h3>Status aktualisieren</h3>
          <div className="status-update">
            <div className="form-group">
              <label htmlFor="status-select">Neuer Status:</label>
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
              <label htmlFor="notes-textarea">Interne Notizen:</label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows="4"
                placeholder="Interne Notizen für andere Mitarbeiter..."
              />
            </div>

            <div className="status-actions">
              <button
                onClick={handleStatusUpdate}
                className="btn btn-primary"
                disabled={isUpdating || !canUpdateStatus()}
              >
                {isUpdating ? <Loading size="small" text="" /> : 'Status aktualisieren'}
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
                  Zum nächsten Status
                </button>
              )}
            </div>
          </div>
        </section>
        </div>
    </div>)}
export default ApplicationDetail;