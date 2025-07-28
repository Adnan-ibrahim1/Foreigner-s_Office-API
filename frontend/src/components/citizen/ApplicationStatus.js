import React from 'react';
import { getApplicationTypeLabel, getStatusLabel, getStatusColor, formatDateTime } from '../../utils/helpers';
import { APPLICATION_STATUS } from '../../utils/constants';
import { T } from '../common/LanguageSwitcher';

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
          <h2><T>Antragsstatus</T></h2>
          <p className="reference-number">
            <T>Referenznummer:</T> <strong>{application.reference_number}</strong>
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
              <label><T>Antragstyp:</T></label>
              <span>{getApplicationTypeLabel(application.type)}</span>
            </div>
            <div className="detail-item">
              <label><T>Eingereicht am:</T></label>
              <span>{formatDateTime(application.submitted_at)}</span>
            </div>
            <div className="detail-item">
              <label><T>Antragsteller:</T></label>
              <span>{application.first_name} {application.last_name}</span>
            </div>
            {application.urgent_request && (
              <div className="detail-item">
                <label><T>Eilantrag:</T></label>
                <span className="urgent-badge"><T>Ja</T></span>
              </div>
            )}
            {estimatedCompletion && (
              <div className="detail-item">
                <label><T>Voraussichtliche Fertigstellung:</T></label>
                <span>{formatDateTime(estimatedCompletion)}</span>
              </div>
            )}
          </div>
        </div>

        {application.staff_notes && application.staff_notes.trim() && (
          <div className="status-notes">
            <h4><T>Hinweise:</T></h4>
            <p>{application.staff_notes}</p>
          </div>
        )}

        <div className="status-timeline">
          <h4><T>Bearbeitungsverlauf:</T></h4>
          <div className="timeline">
            <div className="timeline-item active">
              <div className="timeline-marker">📝</div>
              <div className="timeline-content">
                <div className="timeline-title"><T>Antrag eingereicht</T></div>
                <div className="timeline-date">
                  {formatDateTime(application.submitted_at)}
                </div>
              </div>
            </div>

            {application.status !== APPLICATION_STATUS.SUBMITTED && (
              <div className="timeline-item active">
                <div className="timeline-marker">🔍</div>
                <div className="timeline-content">
                  <div className="timeline-title"><T>Bearbeitung begonnen</T></div>
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
                  <div className="timeline-title"><T>Antrag genehmigt</T></div>
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
                  <div className="timeline-title"><T>Antrag abgelehnt</T></div>
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
                  <div className="timeline-title"><T>Abgeschlossen</T></div>
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
                    <div className="timeline-title"><T>Abschluss</T></div>
                    <div className="timeline-date"><T>Ausstehend</T></div>
                  </div>
                </div>
            )}
          </div>
        </div>

        <div className="status-actions">
          {application.status === APPLICATION_STATUS.IN_REVIEW && (
            <div className="info-box">
              <p>
                <strong><T>Ihr Antrag wird bearbeitet.</T></strong><br />
                <T>Sie erhalten eine E-Mail-Benachrichtigung, sobald es Neuigkeiten gibt.</T>
              </p>
            </div>
          )}

          {application.status === APPLICATION_STATUS.APPROVED && (
            <div className="info-box success">
              <p>
                <strong><T>Ihr Antrag wurde genehmigt!</T></strong><br />
                <T>Die Dokumente werden vorbereitet. Sie werden benachrichtigt, sobald sie zur Abholung bereit sind.</T>
              </p>
            </div>
          )}

          {application.status === APPLICATION_STATUS.COMPLETED && (
            <div className="info-box success">
              <p>
                <strong><T>Ihr Antrag ist abgeschlossen!</T></strong><br />
                <T>Sie können Ihre Dokumente im Bürgerbüro abholen oder sie wurden bereits an Sie versandt.</T>
              </p>
            </div>
          )}

          {application.status === APPLICATION_STATUS.REJECTED && (
            <div className="info-box error">
              <p>
                <strong><T>Ihr Antrag wurde abgelehnt.</T></strong><br />
                <T>Weitere Informationen finden Sie in den Hinweisen oben oder kontaktieren Sie uns für Details.</T>
              </p>
            </div>
          )}
        </div>

        <div className="contact-info">
          <h4><T>Fragen zu Ihrem Antrag?</T></h4>
          <p>
            <T>Kontaktieren Sie uns unter</T> <strong>+49 341 123456</strong> <T>oder</T>
            <strong> buergerbuero@leipzig.de</strong><br />
            <T>Halten Sie dabei Ihre Referenznummer bereit.</T>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
