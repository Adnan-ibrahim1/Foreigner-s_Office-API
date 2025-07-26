import { APPLICATION_TYPES, APPLICATION_STATUS, FORM_VALIDATION } from './constants';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getApplicationTypeLabel = (type) => {
  const labels = {
    [APPLICATION_TYPES.PASSPORT]: 'Reisepass',
    [APPLICATION_TYPES.ID_CARD]: 'Personalausweis',
    [APPLICATION_TYPES.BIRTH_CERTIFICATE]: 'Geburtsurkunde',
    [APPLICATION_TYPES.MARRIAGE_CERTIFICATE]: 'Heiratsurkunde',
    [APPLICATION_TYPES.RESIDENCE_CERTIFICATE]: 'Meldebescheinigung',
    [APPLICATION_TYPES.BUSINESS_LICENSE]: 'Gewerbeschein',
    [APPLICATION_TYPES.OTHER]: 'Sonstiges'
  };
  return labels[type] || type;
};

export const getStatusLabel = (status) => {
  const labels = {
    [APPLICATION_STATUS.SUBMITTED]: 'Eingereicht',
    [APPLICATION_STATUS.IN_REVIEW]: 'In Bearbeitung',
    [APPLICATION_STATUS.APPROVED]: 'Genehmigt',
    [APPLICATION_STATUS.REJECTED]: 'Abgelehnt',
    [APPLICATION_STATUS.COMPLETED]: 'Abgeschlossen'
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    [APPLICATION_STATUS.SUBMITTED]: '#007bff',
    [APPLICATION_STATUS.IN_REVIEW]: '#ffc107',
    [APPLICATION_STATUS.APPROVED]: '#28a745',
    [APPLICATION_STATUS.REJECTED]: '#dc3545',
    [APPLICATION_STATUS.COMPLETED]: '#6c757d'
  };
  return colors[status] || '#6c757d';
};

export const validateEmail = (email) => {
  return FORM_VALIDATION.EMAIL_REGEX.test(email);
};

export const validatePhone = (phone) => {
  return FORM_VALIDATION.PHONE_REGEX.test(phone);
};

export const validatePostalCode = (code) => {
  return FORM_VALIDATION.POSTAL_CODE_REGEX.test(code);
};

export const generateApplicationId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `LEI-${timestamp}-${random}`.toUpperCase();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};