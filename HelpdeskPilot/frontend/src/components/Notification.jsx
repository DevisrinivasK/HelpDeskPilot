import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const typeStyles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700'
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs w-full">
      <div className={`border-l-4 p-4 rounded-md shadow-lg ${typeStyles[type]}`}>
        <div className="flex justify-between items-center">
          <p className="text-base">{message}</p>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;