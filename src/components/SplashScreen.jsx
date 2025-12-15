import React from 'react';
import './SplashScreen.css';
import FileUpload from './FileUpload';

const SplashScreen = ({ onFileUpload, onClose, showCloseButton = false }) => {
  return (
    <div className="splash-overlay">
      <div className="splash-content">
        {showCloseButton && (
          <button className="splash-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
        <h1 className="splash-title">Welcome to the Summit Status Dashboard</h1>
        <div className="splash-body">
          <p>
            Upload the latest CSV from the track manager portal to get started 
            (View Session Details &gt; Actions in upper right &gt; Download as CSV).
          </p>
          <p>
            This dashboard will help you visualize and quickly understand the current 
            status of the event. If you want to see any changes please let me know.
          </p>
        </div>
        <div className="splash-upload">
          <FileUpload onFileUpload={onFileUpload} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

