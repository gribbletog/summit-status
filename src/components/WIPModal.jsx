import React, { useState } from 'react';
import './WIPModal.css';

const WIPModal = ({ session, onSave, onClose }) => {
  // Convert HTML to plain text for editing in textarea
  const htmlToPlainText = (html) => {
    if (!html) return '';
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Replace <br> and <br/> with newlines
    temp.innerHTML = temp.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    
    // Replace </p> with double newline (paragraph break)
    temp.innerHTML = temp.innerHTML.replace(/<\/p>/gi, '\n\n');
    
    // Remove other HTML tags but keep the text
    let text = temp.textContent || temp.innerText || '';
    
    // Clean up excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    
    return text;
  };

  const [formData, setFormData] = useState({
    title: session['SESSION TITLE'] || '',
    description: htmlToPlainText(session['SESSION ABSTRACT'] || ''),
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

  // Convert plain text with line breaks to HTML
  const formatDescription = (text) => {
    if (!text) return '';
    
    // Check if the text already contains HTML tags
    const hasHTMLTags = /<[a-z][\s\S]*>/i.test(text);
    
    if (hasHTMLTags) {
      // If it has HTML, just return it (user pasted HTML)
      return text;
    }
    
    // Convert plain text to HTML with proper paragraph formatting
    // Split by double line breaks to create paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs
      .map(para => {
        // Within each paragraph, convert single line breaks to <br>
        const withBreaks = para.trim().replace(/\n/g, '<br>');
        return withBreaks ? `<p>${withBreaks}</p>` : '';
      })
      .filter(p => p)
      .join('\n');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and Description are required');
      return;
    }
    
    // Format the description before saving
    const formattedData = {
      ...formData,
      description: formatDescription(formData.description)
    };
    
    onSave(formattedData);
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
              <span className="field-hint">
                (Line breaks and paragraphs will be preserved. HTML is also supported.)
              </span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter session description. Use blank lines between paragraphs. HTML tags are also supported if needed."
              rows={10}
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

