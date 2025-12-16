import './SessionCard.css';
import { hasWIPOverride as checkHasWIPOverride } from '../utils/wipStorage';

function SessionCard({ session, isWIP = false, hasWIPOverride = false, onEditWIP }) {
  // Always check localStorage for latest WIP override status
  const currentHasWIPOverride = checkHasWIPOverride(session['SESSION CODE']);
  const renderHTML = (html) => {
    return { __html: html };
  };

  const getBadgeClass = (published) => {
    return published?.toLowerCase() === 'yes' ? 'badge-published' : 'badge-unpublished';
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    // Parse the date (assuming format like "4/19/26")
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format as "Sunday, April 19"
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const cleanCompanyName = (companyName) => {
    if (!companyName) return null;
    
    // Split by comma and trim
    const parts = companyName.split(',').map(part => part.trim());
    
    // Remove duplicates using Set
    const uniqueParts = [...new Set(parts)];
    
    // Return the unique parts joined
    return uniqueParts.join(', ');
  };

  const parseAudienceType = (audienceType) => {
    if (!audienceType) return null;
    
    // Split by comma and trim whitespace
    const items = audienceType.split(',').map(item => item.trim()).filter(item => item);
    
    // If only one item, return it as plain text
    if (items.length === 1) {
      return <div className="field-value">{items[0]}</div>;
    }
    
    // If multiple items, return as a bulleted list
    return (
      <ul className="field-value-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="session-card-wrapper">
      <div className="session-meta-bar">
        {session['CFP: INTERNAL TRACK (SUMMIT)'] && (
          <div className="session-track-label">{session['CFP: INTERNAL TRACK (SUMMIT)']}</div>
        )}
        {session['SESSION CODE'] && (
          <div className="session-code-label">{session['SESSION CODE']}</div>
        )}
      </div>
      <div className="session-card">
        <div className="session-header">
          <div className="session-title-group">
            <h3 className="session-title">{session['SESSION TITLE']}</h3>
            {session['CFP: SESSION FORMAT']?.toLowerCase() === 'online' && (
              <span className="online-badge">Online</span>
            )}
          </div>
        <div className="session-badges">
          <span className={`badge ${getBadgeClass(session['PUBLISHED'])}`}>
            {session['PUBLISHED']?.toLowerCase() === 'yes' ? '✓ Published' : '⏳ Unpublished'}
          </span>
          {session['SESSION STATUS'] && (
            <span className="badge badge-status">{session['SESSION STATUS']}</span>
          )}
          {isWIP && onEditWIP && (
            <button className="edit-wip-btn" onClick={onEditWIP} title="Edit WIP data">
              {currentHasWIPOverride ? '📝 Edit WIP' : 'Add WIP Data'}
            </button>
          )}
        </div>
      </div>

      <div className="session-body">
        {session['SESSION ABSTRACT'] && (
          <div className="session-field">
            <label>Description</label>
            <div
              className="session-abstract"
              dangerouslySetInnerHTML={renderHTML(session['SESSION ABSTRACT'])}
            />
          </div>
        )}

        <div className="session-details-grid">
          {session['CFP: SESSION TYPE'] && (
            <div className="session-field">
              <label>Session Type</label>
              <div className="field-value">{session['CFP: SESSION TYPE']}</div>
            </div>
          )}

          {session['CFP: INTERNAL TRACK (SUMMIT)'] && (
            <div className="session-field">
              <label>Internal Track</label>
              <div className="field-value">{session['CFP: INTERNAL TRACK (SUMMIT)']}</div>
            </div>
          )}

          {session['SESSION DATE'] && (
            <div className="session-field">
              <label>Date</label>
              <div className="field-value">{formatDate(session['SESSION DATE'])}</div>
            </div>
          )}

          {session['SESSION START TIME'] && session['SESSION END TIME'] && (
            <div className="session-field">
              <label>Time</label>
              <div className="field-value">
                {session['SESSION START TIME']} - {session['SESSION END TIME']}
              </div>
            </div>
          )}

          {session['SESSION ROOM'] && (
            <div className="session-field">
              <label>Room</label>
              <div className="field-value">{session['SESSION ROOM']}</div>
            </div>
          )}

          {session['SESSION CAPACITY'] && (
            <div className="session-field">
              <label>Capacity</label>
              <div className="field-value">{session['SESSION CAPACITY']}</div>
            </div>
          )}

          {session['CFP: TECHNICAL LEVEL'] && (
            <div className="session-field">
              <label>Technical Level</label>
              <div className="field-value">{session['CFP: TECHNICAL LEVEL']}</div>
            </div>
          )}

          {session['CFP: AUDIENCE TYPE'] && (
            <div className="session-field">
              <label>Audience Type</label>
              {parseAudienceType(session['CFP: AUDIENCE TYPE'])}
            </div>
          )}

          {session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'] && (
            <div className="session-field">
              <label>Speaker</label>
              <div className="field-value">
                <div className="speaker-name-value">{session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME']}</div>
                {cleanCompanyName(session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']) && (
                  <div className="speaker-company">{cleanCompanyName(session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY'])}</div>
                )}
              </div>
            </div>
          )}

          {session['SPEAKER NAME'] && (
            <div className="session-field">
              <label>Co-presenter</label>
              <div className="field-value">
                <div className="speaker-name-value">{session['SPEAKER NAME']}</div>
                {cleanCompanyName(session['SPEAKER COMPANY']) && (
                  <div className="speaker-company">{cleanCompanyName(session['SPEAKER COMPANY'])}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {session['SESSION CATALOG URL'] && (
          <div className="session-footer">
            <a
              href={session['SESSION CATALOG URL']}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-link"
            >
              View in Catalog →
            </a>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default SessionCard;

