import React from 'react';

const ProcessingNotification = ({ 
  status, 
  message, 
  details, 
  type = 'info' // 'info', 'success', 'warning', 'error'
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: '✓'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: '⚠️'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: '✗'
        };
      default: // info
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{styles.icon}</span>
        <div className="flex-1">
          <h3 className={`${styles.text} font-semibold`}>{status}</h3>
          <p className={`${styles.text} mt-1`}>{message}</p>
          {details && (
            <ul className={`${styles.text} text-sm mt-2 space-y-1`}>
              {details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingNotification;