export const APPLICATION_TYPES = {
  PASSPORT: 'passport',
  ID_CARD: 'id_card',
  BIRTH_CERTIFICATE: 'birth_certificate',
  MARRIAGE_CERTIFICATE: 'marriage_certificate',
  RESIDENCE_CERTIFICATE: 'residence_certificate',
  BUSINESS_LICENSE: 'business_license',
  OTHER: 'other'
};

export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const API_ENDPOINTS = {
  APPLICATIONS: '/applications',
  AUTH: '/auth',
  STATUS: '/status'
};

export const FORM_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  POSTAL_CODE_REGEX: /^\d{5}$/
};