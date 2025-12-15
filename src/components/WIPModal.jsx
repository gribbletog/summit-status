import React, { useState } from 'react';
import './WIPModal.css';

const WIPModal = ({ session, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: session['SESSION TITLE'] || '',
    description: session['SESSION ABSTRACT'] || '',
    speaker1: session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'] || '',
    speaker1Company: session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY'] || '',
    speaker2: session['SPEAKER NAME'] || '',
    speaker2Company: session['SPEAKER COMPANY'] || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and Description are required');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="wip-modal-overlay" onClick={onClose}>
      <div className="wip-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="wip-modal-close" onClick={onClose}>×</button>
        
        <h2 className="wip-modal-title">Edit Work-in-Progress Session</h2>
        
        <div className="wip-session-info">
          <div className="wip-info-item">
            <strong>Session Code:</strong> {session['SESSION CODE']}
          </div>
          <div className="wip-info-item">
            <strong>Track:</strong> {session['CFP: INTERNAL TRACK (SUMMIT)']}
          </div>
          <div className="wip-info-item">
            <strong>Type:</strong> {session['DERIVED_SESSION_TYPE']}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="wip-form">
          <div className="wip-form-group">
            <label htmlFor="title">
              Session Title <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter session title"
              required
            />
          </div>

          <div className="wip-form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter session description (HTML supported)"
              rows={8}
              required
            />
          </div>

          <div className="wip-speakers-section">
            <h3>Speaker (Optional)</h3>
            <div className="wip-form-row">
              <div className="wip-form-group">
                <label htmlFor="speaker1">Name</label>
                <input
                  id="speaker1"
                  type="text"
                  value={formData.speaker1}
                  onChange={(e) => handleChange('speaker1', e.target.value)}
                  placeholder="Speaker name"
                />
              </div>
              <div className="wip-form-group">
                <label htmlFor="speaker1Company">Company</label>
                <input
                  id="speaker1Company"
                  type="text"
                  value={formData.speaker1Company}
                  onChange={(e) => handleChange('speaker1Company', e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>

            <h3>Co-presenter (Optional)</h3>
            <div className="wip-form-row">
              <div className="wip-form-group">
                <label htmlFor="speaker2">Name</label>
                <input
                  id="speaker2"
                  type="text"
                  value={formData.speaker2}
                  onChange={(e) => handleChange('speaker2', e.target.value)}
                  placeholder="Co-presenter name"
                />
              </div>
              <div className="wip-form-group">
                <label htmlFor="speaker2Company">Company</label>
                <input
                  id="speaker2Company"
                  type="text"
                  value={formData.speaker2Company}
                  onChange={(e) => handleChange('speaker2Company', e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </div>
          </div>

          <div className="wip-form-actions">
            <button type="button" onClick={onClose} className="wip-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="wip-btn-save">
              Save WIP Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WIPModal;

