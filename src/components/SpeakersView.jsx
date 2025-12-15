import { useState, useMemo } from 'react';
import SessionCard from './SessionCard';
import './SpeakersView.css';

function SpeakersView({ sessions, showFilterOverlay, onCloseFilterOverlay }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [speakerCompanyFilter, setSpeakerCompanyFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('');

  // Helper function to clean company names
  const cleanCompanyName = (companyName) => {
    if (!companyName) return null;
    
    // Split by comma and trim
    const parts = companyName.split(',').map(part => part.trim());
    
    // Remove duplicates using Set
    const uniqueParts = [...new Set(parts)];
    
    // Return the unique parts joined
    return uniqueParts.join(', ');
  };

  // Get unique speaker companies
  const speakerCompanies = useMemo(() => {
    const companies = new Set();
    sessions.forEach(session => {
      if (session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']) {
        const cleaned = cleanCompanyName(session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']);
        if (cleaned) companies.add(cleaned);
      }
      if (session['SPEAKER COMPANY']) {
        const cleaned = cleanCompanyName(session['SPEAKER COMPANY']);
        if (cleaned) companies.add(cleaned);
      }
    });
    return Array.from(companies).sort();
  }, [sessions]);

  // Get unique tracks (using Internal Track)
  const tracks = useMemo(() => {
    const trackSet = new Set();
    sessions.forEach(session => {
      if (session['CFP: INTERNAL TRACK (SUMMIT)']) {
        trackSet.add(session['CFP: INTERNAL TRACK (SUMMIT)']);
      }
    });
    return Array.from(trackSet).sort();
  }, [sessions]);

  // Get unique session types
  const sessionTypes = useMemo(() => {
    const typesSet = new Set();
    sessions.forEach(session => {
      if (session['DERIVED_SESSION_TYPE']) {
        typesSet.add(session['DERIVED_SESSION_TYPE']);
      }
    });
    return Array.from(typesSet).sort();
  }, [sessions]);

  // Build speaker rows - one row per session
  const speakerRows = useMemo(() => {
    const rows = [];
    
    sessions.forEach(session => {
      const speaker1 = session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'];
      const speaker2 = session['SPEAKER NAME'];
      const speaker1Company = session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY'];
      const speaker2Company = session['SPEAKER COMPANY'];

      // Only create one row per session with assigned speaker as main speaker
      if (speaker1 || speaker2) {
        rows.push({
          speaker: speaker1 || '',
          coSpeaker: speaker2 || '',
          speakerCompany: cleanCompanyName(speaker1Company) || '',
          coSpeakerCompany: cleanCompanyName(speaker2Company) || '',
          sessionCode: session['SESSION CODE'],
          internalTrack: session['CFP: INTERNAL TRACK (SUMMIT)'] || '',
          sessionType: session['DERIVED_SESSION_TYPE'] || '',
          published: session['PUBLISHED'] || '',
          session: session,
          rowId: session['SESSION CODE']
        });
      }
    });

    return rows;
  }, [sessions]);

  // Filter rows by speaker company, track, and session type
  const filteredRows = useMemo(() => {
    let filtered = speakerRows;
    
    if (speakerCompanyFilter) {
      filtered = filtered.filter(row => 
        row.speakerCompany === speakerCompanyFilter || 
        row.coSpeakerCompany === speakerCompanyFilter
      );
    }

    if (trackFilter) {
      filtered = filtered.filter(row => 
        row.internalTrack === trackFilter
      );
    }

    if (sessionTypeFilter) {
      filtered = filtered.filter(row => 
        row.sessionType === sessionTypeFilter
      );
    }
    
    return filtered;
  }, [speakerRows, speakerCompanyFilter, trackFilter, sessionTypeFilter]);

  const toggleRow = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="speakers-view">
      {showFilterOverlay && (
        <div className="filter-overlay-backdrop" onClick={onCloseFilterOverlay}>
          <div className="filter-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <button className="filter-overlay-close" onClick={onCloseFilterOverlay}>&times;</button>
            
            <div className="speakers-filter-panel">
              {/* Session Type Radio Buttons */}
              <div className="filter-section">
                <label className="filter-section-label">Session Type</label>
                <div className="radio-group-horizontal">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="sessionType"
                      value=""
                      checked={sessionTypeFilter === ''}
                      onChange={(e) => setSessionTypeFilter(e.target.value)}
                    />
                    <span>All</span>
                  </label>
                  {sessionTypes.map((type) => (
                    <label key={type} className="radio-label">
                      <input
                        type="radio"
                        name="sessionType"
                        value={type}
                        checked={sessionTypeFilter === type}
                        onChange={(e) => setSessionTypeFilter(e.target.value)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dropdown Filters */}
              <div className="filters-grid">
                <div className="filter-group">
                  <label htmlFor="speakerCompany">Speaker Company</label>
                  <select
                    id="speakerCompany"
                    value={speakerCompanyFilter}
                    onChange={(e) => setSpeakerCompanyFilter(e.target.value)}
                  >
                    <option value="">All Companies</option>
                    {speakerCompanies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="track">Track</label>
                  <select
                    id="track"
                    value={trackFilter}
                    onChange={(e) => setTrackFilter(e.target.value)}
                  >
                    <option value="">All Tracks</option>
                    {tracks.map((track) => (
                      <option key={track} value={track}>
                        {track}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="speakers-table-container">
        <div className="results-info">
          <h2>Speakers</h2>
          <span className="results-count">
            {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <table className="speakers-table">
          <thead>
            <tr>
              <th className="expand-column"></th>
              <th>Speaker</th>
              <th>Co-speaker</th>
              <th>ID</th>
              <th>Track</th>
              <th>Type</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <>
                <tr key={row.rowId} className="speaker-row">
                  <td className="expand-column">
                    <button
                      className={`expand-button ${expandedRows.has(row.rowId) ? 'expanded' : ''}`}
                      onClick={() => toggleRow(row.rowId)}
                      aria-label={expandedRows.has(row.rowId) ? 'Collapse' : 'Expand'}
                    >
                      ▶
                    </button>
                  </td>
                  <td className="speaker-name">{row.speaker}</td>
                  <td>{row.coSpeaker}</td>
                  <td className="session-code-cell">{row.sessionCode}</td>
                  <td>{row.internalTrack}</td>
                  <td>{row.sessionType}</td>
                  <td>
                    <span className={`published-badge ${row.published.toLowerCase() === 'yes' ? 'published' : 'unpublished'}`}>
                      {row.published.toLowerCase() === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
                {expandedRows.has(row.rowId) && (
                  <tr key={`${row.rowId}-expanded`} className="expanded-row">
                    <td colSpan="7">
                      <div className="expanded-content">
                        <SessionCard session={row.session} />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="no-results">
            <p>No speakers match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpeakersView;

