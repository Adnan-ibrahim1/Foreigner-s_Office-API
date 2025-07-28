import React from 'react';
import { T } from '../common/LanguageSwitcher';

const Loading = ({ size = 'medium', text }) => {
  const sizeClasses = {
    small: 'loading-small',
    medium: 'loading-medium',
    large: 'loading-large'
  };

  return (
    <div className={`loading-container ${sizeClasses[size]}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      {text !== undefined ? (
        <p className="loading-text">{text}</p>
      ) : (
        <p className="loading-text"><T>Lädt...</T></p>
      )}
    </div>
  );
};

export default Loading;
