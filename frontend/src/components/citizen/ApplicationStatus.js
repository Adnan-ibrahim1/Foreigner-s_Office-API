import React from 'react';
import { getApplicationTypeLabel, getStatusLabel, getStatusColor, formatDateTime } from '../../utils/helpers';
import { APPLICATION_STATUS } from '../../utils/constants';

const ApplicationStatus = ({ application }) => {
  const getStatusProgress = (status) => {
    const statusOrder = [
      APPLICATION_STATUS.SUBMITTED,
      APPLICATION_STATUS.IN_REVIEW,
      APPLICATION_STATUS.APPROVED,
      APPLICATION_STATUS.COMPLETED
    ];
    
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getStatusIcon = (status) => {
    const icons = {
      [APPLICATION_STATUS.SUBMITTED]: '📝',
      [APPLICATION_STATUS.IN_REVIEW]: '🔍',
      [APPLICATION_STATUS.APPROVED]: '✅',
      [APPLICATION_STATUS.REJECTED]: '❌',
      [APPLICATION_STATUS.COMPLETED]: '🎉'
    };
    return icons[status] || '📋';
  };

  const getEstimatedCompletion = (status, submittedDate) => {
    if (status === APPLICATION_STATUS.COMPLETED) return null;
    if (status === APPLICATION_STATUS.REJECTED) return null;

    const submitted = new Date(submittedDate);
    const businessDays = application.urgent_request ? 2 : 5;
    
    // Add business days (excluding weekends)
    let estimatedDate = new Date(submitted);
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
      if (estimatedDate.getDay() !== 0 && estimatedDate.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return estimatedDate;
  };

  const estimatedCompletion = getEstimatedCompletion(application.status, application.submitted_at);

  return (
    <div className="application-status">
      <div className="status-header">
        <div className="status-icon">
          {getStatusIcon(application.status)}
        </div>
        <div className="status-info">
          <h2>Antragsstatus</h2>
          <p className="reference-number">
            Referenznummer: <strong>{application.reference_number}</strong>
          </p>
        </div>
      </div>

      <div className="status-card">
        <div className="status-current">
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(application.status) }}
          >
            {getStatusLabel(application.status)}
          </div>
          {application.status !== APPLICATION_STATUS.REJECTED && 
           application.status !== APPLICATION_STATUS.COMPLETED && (
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${getStatusProgress(application.status)}%`,
                  backgroundColor: getStatusColor(application.status)
                }}
              />
            </div>
          )}
        </div>

        <div className="application-details">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Antragstyp:</label>
              <span>{getApplicationTypeLabel(application.type)}</span>
            </div>
            <div className="detail-item">
              <label>Eingereicht am:</label>
              <span>{formatDateTime(application.submitted_at)}</span>
            </div>
            <div className="detail-item">
              <label>Antragsteller:</label>
              <span>{application.first_name} {application.last_name}</span>
            </div>
            {application.urgent_request && (
              <div className="detail-item">
                <label>Eilantrag:</label>
                <span className="urgent-badge">Ja</span>
              </div>
            )}
            {estimatedCompletion && (
              <div className="detail-item">
                <label>Voraussichtliche Fertigstellung:</label>
                <span>{formatDateTime(estimatedCompletion)}</span>
              </div>
            )}
          </div>
        </div>

        {application.staff_notes && application.staff_notes.trim() && (
          <div className="status-notes">
            <h4>Hinweise:</h4>
            <p>{application.staff_notes}</p>
          </div>
        )}

        <div className="status-timeline">
          <h4>Bearbeitungsverlauf:</h4>
          <div className="timeline">
            <div className="timeline-item active">
              <div className="timeline-marker">📝</div>
              <div className="timeline-content">
                <div className="timeline-title">Antrag eingereicht</div>
                <div className="timeline-date">
                  {formatDateTime(application.submitted_at)}
                </div>
              </div>
            </div>
            
            {application.status !== APPLICATION_STATUS.SUBMITTED && (
              <div className="timeline-item active">
                <div className="timeline-marker">🔍</div>
                <div className="timeline-content">
                  <div className="timeline-title">Bearbeitung begonnen</div>
                  <div className="timeline-date">
                    {application.updated_at && formatDateTime(application.updated_at)}
                  </div>
                </div>
              </div>
            )}
            
            {(application.status === APPLICATION_STATUS.APPROVED || 
              application.status === APPLICATION_STATUS.COMPLETED) && (
              <div className="timeline-item active">
                <div className="timeline-marker">✅</div>
                <div className="timeline-content">
                  <div className="timeline-title">Antrag genehmigt</div>
                  <div className="timeline-date">
                    {application.updated_at && formatDateTime(application.updated_at)}
                  </div>
                </div>
              </div>
            )}
            
            {application.status === APPLICATION_STATUS.REJECTED && (
              <div className="timeline-item active rejected">
                <div className="timeline-marker">❌</div>
                <div className="timeline-content">
                  <div className="timeline-title">Antrag abgelehnt</div>
                  <div className="timeline-date">
                    {application.updated_at && formatDateTime(application.updated_at)}
                  </div>
                </div>
              </div>
            )}
            
            {application.status === APPLICATION_STATUS.COMPLETED && (
              <div className="timeline-item active">
                <div className="timeline-marker">🎉</div>
                <div className="timeline-content">
                  <div className="timeline-title">Abgeschlossen</div>
                  <div className="timeline-date">
                    {application.updated_at && formatDateTime(application.updated_at)}
                  </div>
                </div>
              </div>
            )}

            {application.status !== APPLICATION_STATUS.REJECTED && 
             application.status !== APPLICATION_STATUS.COMPLETED && (
              <div className="timeline-item pending">
                <div className="timeline-marker">🎉</div>
                <div className="timeline-content">
                  <div className="timeline-title">Abschluss</div>
                  <div className="timeline-date">Ausstehend</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="status-actions">
          {application.status === APPLICATION_STATUS.IN_REVIEW && (
            <div className="info-box">
              <p>
                <strong>Ihr Antrag wird bearbeitet.</strong><br />
                Sie erhalten eine E-Mail-Benachrichtigung, sobald es Neuigkeiten gibt.
              </p>
            </div>
          )}
          
          {application.status === APPLICATION_STATUS.APPROVED && (
            <div className="info-box success">
              <p>
                <strong>Ihr Antrag wurde genehmigt!</strong><br />
                Die Dokumente werden vorbereitet. Sie werden benachrichtigt, 
                sobald sie zur Abholung bereit sind.
              </p>
            </div>
          )}
          
          {application.status === APPLICATION_STATUS.COMPLETED && (
            <div className="info-box success">
              <p>
                <strong>Ihr Antrag ist abgeschlossen!</strong><br />
                Sie können Ihre Dokumente im Bürgerbüro abholen oder sie wurden 
                bereits an Sie versandt.
              </p>
            </div>
          )}
          
          {application.status === APPLICATION_STATUS.REJECTED && (
            <div className="info-box error">
              <p>
                <strong>Ihr Antrag wurde abgelehnt.</strong><br />
                Weitere Informationen finden Sie in den Hinweisen oben oder 
                kontaktieren Sie uns für Details.
              </p>
            </div>
          )}
        </div>

        <div className="contact-info">
          <h4>Fragen zu Ihrem Antrag?</h4>
          <p>
            Kontaktieren Sie uns unter <strong>+49 341 123456</strong> oder 
            <strong> buergerbuero@leipzig.de</strong><br />
            Halten Sie dabei Ihre Referenznummer bereit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;