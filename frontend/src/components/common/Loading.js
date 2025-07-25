import React from 'react';

const Loading = ({ size = 'medium', text = 'Lädt...' }) => {
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
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;