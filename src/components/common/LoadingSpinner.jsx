import React from "react";

/**
 * LoadingSpinner - A reusable loading spinner component
 * @param {string} text - Text to display below the spinner
 * @param {string} size - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  text = "Loading...", 
  size = "md",
  className = "" 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`rounded-full ${sizeClasses[size]}`}
        style={{
          borderColor: 'var(--primary)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
          display: 'inline-block'
        }}
      />
      {text && (
        <p className={`text-secondary ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

