import React from 'react';

const Button = ({ children, type = 'button', className = '', ...props }) => (
  <button
    type={type}
    className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;