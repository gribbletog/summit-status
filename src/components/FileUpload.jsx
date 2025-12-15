import { useRef } from 'react';
import './FileUpload.css';

function FileUpload({ onFileUpload, compact = false }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (compact) {
    return (
      <div className="file-upload-compact">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          style={{ display: 'none' }}
        />
        <button
          className="reload-button"
          onClick={() => fileInputRef.current.click()}
        >
          📁 Load New CSV
        </button>
      </div>
    );
  }

  return (
    <div className="file-upload-container">
      <div
        className="file-upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="upload-icon">📊</div>
        <h2>Upload CSV File</h2>
        <p>Drag and drop your Summit 2025 Session Details Report.csv here</p>
        <p className="upload-subtext">or click to browse</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default FileUpload;

