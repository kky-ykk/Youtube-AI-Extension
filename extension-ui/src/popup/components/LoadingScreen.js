import React from 'react';

const LoadingScreen = ({ message = "Loading...", subtext = "Please wait while we set up your AI assistant" }) => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">{message}</div>
      <div className="loading-subtext">{subtext}</div>
    </div>
  );
};

export default LoadingScreen;