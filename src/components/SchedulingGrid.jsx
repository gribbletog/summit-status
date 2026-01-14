import { useState, useEffect, useMemo } from 'react';
import { findSessionByCode } from '../utils/scheduleParser';
import { getSessionTrackColor, TRACK_COLORS } from '../utils/trackColors';
import './SchedulingGrid.css';

function SchedulingGrid({ schedule, allSessions, onScheduleUpload }) {
  const [view, setView] = useState('all'); // 'all', 'monday', 'tuesday', 'wednesday'
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'Session', 'Lab'
  const [showLegend, setShowLegend] = useState(true);
  const [showDescription, setShowDescription] = useState(false);

  // Get tracks that are actually in the schedule - MUST be before any conditional returns
  const tracksInSchedule = useMemo(() => {
    if (!allSessions || allSessions.length === 0) {
      // Return all tracks if no sessions loaded
      return Object.keys(TRACK_COLORS).sort();
    }
    
    const trackSet = new Set();
    allSessions.forEach(session => {
      const track = session['CFP: INTERNAL TRACK (SUMMIT)'];
      if (track && track.trim()) {
        trackSet.add(track.trim());
      }
    });
    
    return Array.from(trackSet).sort();
  }, [allSessions]);

  // Debug logging
  useEffect(() => {
    if (schedule) {
      console.log('📊 Schedule data in component:', {
        hasSchedule: !!schedule,
        timeSlots: schedule.timeSlots?.length || 0,
        venues: schedule.venues?.length || 0,
        days: schedule.days
      });
    }
  }, [schedule]);

  useEffect(() => {
    // If a session is selected, find its details from allSessions
    if (selectedSession && selectedSession.sessionCode && allSessions) {
      const details = findSessionByCode(allSessions, selectedSession.sessionCode);
      setSessionDetails(details);
    } else {
      setSessionDetails(null);
    }
  }, [selectedSession, allSessions]);

  if (!schedule || !schedule.timeSlots || schedule.timeSlots.length === 0) {
    return (
      <div className="scheduling-grid-empty">
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>No Scheduling Grid Loaded</h2>
          <p>Upload the scheduling grid CSV to visualize your Summit schedule and identify conflicts.</p>
          <button 
            className="upload-schedule-btn"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  onScheduleUpload(file);
                }
              };
              input.click();
            }}
          >
            📁 Upload Scheduling Grid CSV
          </button>
        </div>
      </div>
    );
  }

  // Filter schedule based on view and type
  const getFilteredSchedule = () => {
    if (!schedule || !schedule.timeSlots || !schedule.venues) {
      return { timeSlots: [], venues: [] };
    }
    
    let filtered = {
      timeSlots: [...(schedule.timeSlots || [])],
      venues: [...(schedule.venues || [])]
    };
    
    // Filter by day
    if (view !== 'all') {
      const day = view.charAt(0).toUpperCase() + view.slice(1);
      filtered.timeSlots = filtered.timeSlots.filter(slot => slot.day === day);
      filtered.venues = filtered.venues.map(venue => ({
        ...venue,
        sessions: (venue.sessions || []).filter(session => session.day === day)
      })).filter(venue => venue.sessions.length > 0);
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered.timeSlots = filtered.timeSlots.filter(slot => slot.type === filterType);
      filtered.venues = filtered.venues.map(venue => ({
        ...venue,
        sessions: (venue.sessions || []).filter(session => session.type === filterType)
      })).filter(venue => venue.sessions.length > 0);
    }
    
    return filtered;
  };

  const filteredSchedule = getFilteredSchedule();

  const handleCellClick = (venue, session) => {
    // Only open panel if there's meaningful content to show
    if (!session.sessionCode && !session.title && !session.isOpen && !session.isHold && !session.isTBD) {
      return; // Don't open panel for truly empty cells
    }
    
    setSelectedSession({
      ...session,
      venue: venue.name,
      capacity: venue.capacity
    });
  };

  const closeSidePanel = () => {
    setSelectedSession(null);
    setSessionDetails(null);
    setShowDescription(false); // Reset description accordion when closing panel
  };

  const getCellStyle = (session) => {
    // Get track color for THIS specific session (not the selected one)
    if (session.sessionCode && allSessions) {
      const details = findSessionByCode(allSessions, session.sessionCode);
      if (details) {
        const trackColor = getSessionTrackColor(details);
        if (trackColor) {
          return {
            background: trackColor.light,
            borderLeft: `4px solid ${trackColor.background}`
          };
        }
      }
    }
    
    // Default styling based on session state
    if (session.isDoNotSchedule) {
      return {
        background: '#ffe6e6',
        borderLeft: '4px solid #e74c3c'
      };
    }
    
    if (session.isOpen) {
      return {
        background: '#f8f9fa',
        borderLeft: '4px solid #dee2e6'
      };
    }
    
    if (session.isTBD || session.isHold) {
      return {
        background: '#fff9e6',
        borderLeft: '4px solid #f39c12'
      };
    }
    
    return {};
  };

  const getCellClassName = (session) => {
    const classes = ['schedule-cell'];
    
    if (session.isOpen) classes.push('open');
    if (session.isTBD) classes.push('tbd');
    if (session.isDoNotSchedule) classes.push('do-not-schedule');
    if (session.isHold) classes.push('hold');
    if (session.isRepeat) classes.push('repeat');
    if (session.sessionCode || session.title) classes.push('has-session');
    
    return classes.join(' ');
  };

  const formatSessionDisplay = (session) => {
    if (session.isOpen) {
      return <div className="session-state-label">OPEN</div>;
    }
    if (session.isDoNotSchedule) {
      return <div className="session-state-label danger">Do Not Schedule</div>;
    }
    if (session.isHold) {
      return <div className="session-state-label warning">HOLD</div>;
    }
    if (session.isRepeat) {
      return <div className="session-state-label info">REPEAT</div>;
    }
    
    // If we have a session code, try to get full details from allSessions
    if (session.sessionCode) {
      let displayTitle = session.title; // Title from scheduling grid (might be empty)
      
      // Try to get the full title from the main session details
      if (allSessions) {
        const details = findSessionByCode(allSessions, session.sessionCode);
        if (details && details['SESSION TITLE']) {
          displayTitle = details['SESSION TITLE'];
        }
      }
      
      return (
        <>
          <div className="session-code">{session.sessionCode}</div>
          {displayTitle && <div className="session-title">{displayTitle}</div>}
        </>
      );
    }
    
    // If we have only a title (no code), show it
    if (session.title) {
      return <div className="session-title">{session.title}</div>;
    }
    
    // Nothing to display
    return null;
  };

  const parseProducts = (productsString) => {
    if (!productsString) return [];
    return productsString.split(',').map(p => p.trim()).filter(p => p !== '');
  };

  const renderHTML = (html) => {
    return { __html: html };
  };

  return (
    <div className="scheduling-grid-container">
      {selectedSession && (
        <>
          <div className="details-overlay-backdrop" onClick={closeSidePanel}></div>
          <div className="details-overlay-panel">
            <button className="details-overlay-close" onClick={closeSidePanel} aria-label="Close panel">×</button>
            
            <div className="panel-content">
              {sessionDetails && (
                <div className="detail-section highlight-section">
                  <h3 className="session-full-title">{sessionDetails['SESSION TITLE']}</h3>
                  {sessionDetails['CFP: INTERNAL TRACK (SUMMIT)'] && (
                    <div className="track-badge" style={{
                      background: getSessionTrackColor(sessionDetails)?.background || '#667eea',
                      color: getSessionTrackColor(sessionDetails)?.text || '#ffffff'
                    }}>
                      {sessionDetails['CFP: INTERNAL TRACK (SUMMIT)']}
                    </div>
                  )}
                  
                  {/* Collapsible Description */}
                  {(sessionDetails['SESSION DESCRIPTION'] || sessionDetails['SESSION ABSTRACT']) && (
                    <div className="description-accordion">
                      <button 
                        className="description-toggle"
                        onClick={() => setShowDescription(!showDescription)}
                        aria-expanded={showDescription}
                      >
                        <span className="description-toggle-icon">{showDescription ? '▼' : '▶'}</span>
                        Description
                      </button>
                      {showDescription && (
                        <div className="description-content">
                          <div 
                            className="session-description"
                            dangerouslySetInnerHTML={renderHTML(
                              sessionDetails['SESSION DESCRIPTION'] || 
                              sessionDetails['SESSION ABSTRACT'] || ''
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h4>📍 Scheduling Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Session Code</span>
                    <span className="detail-value code-value">{selectedSession.sessionCode || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Day</span>
                    <span className="detail-value">{selectedSession.day}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Slot</span>
                    <span className="detail-value">{selectedSession.timeSlot}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value">{selectedSession.venue}</span>
                  </div>
                  {selectedSession.capacity && (
                    <div className="detail-item">
                      <span className="detail-label">Capacity</span>
                      <span className="detail-value">
                        <span className="capacity-icon">👥</span>
                        {selectedSession.capacity}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {sessionDetails ? (
                <>
                  <div className="detail-section">
                    <h4>ℹ️ Session Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Session Type</span>
                        <span className="detail-value">{sessionDetails['DERIVED_SESSION_TYPE'] || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <span className="detail-value status-badge">
                          {sessionDetails['SESSION STATUS'] || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Published</span>
                        <span className={`detail-value ${sessionDetails['PUBLISHED']?.toLowerCase() === 'yes' ? 'published-yes' : 'published-no'}`}>
                          {sessionDetails['PUBLISHED']?.toLowerCase() === 'yes' ? '✓ Yes' : '⏳ No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {sessionDetails['SPEAKER NAMES'] && (
                    <div className="detail-section">
                      <h4>🎤 Speakers</h4>
                      <div className="speakers-list">
                        {sessionDetails['SPEAKER NAMES'].split(',').map((speaker, idx) => (
                          <div key={idx} className="speaker-badge">
                            {speaker.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sessionDetails['CFP: PRODUCTS'] && (
                    <div className="detail-section">
                      <h4>🎯 Products</h4>
                      <div className="products-list">
                        {parseProducts(sessionDetails['CFP: PRODUCTS']).map((product, idx) => (
                          <div key={idx} className="product-badge">
                            {product}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sessionDetails['SESSION CATALOG URL'] && (
                    <div className="detail-section">
                      <a 
                        href={sessionDetails['SESSION CATALOG URL']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="catalog-link"
                      >
                        View in Catalog →
                      </a>
                    </div>
                  )}
                </>
              ) : (
                selectedSession.sessionCode && (
                  <div className="detail-section">
                    <div className="no-details">
                      <p>ℹ️ No additional session details available.</p>
                      <p className="no-details-hint">Upload the session details CSV to see full information.</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="scheduling-grid-header">
        <div className="scheduling-grid-title">
          <h2>📅 Scheduling Grid</h2>
          <button 
            className="upload-schedule-btn-small"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  onScheduleUpload(file);
                }
              };
              input.click();
            }}
            title="Upload new scheduling grid CSV"
          >
            📁 Upload New Grid
          </button>
        </div>
        
        <div className="scheduling-controls">
          <div className="control-group">
            <label>📆 Day View</label>
            <div className="button-group">
              <button 
                className={view === 'all' ? 'active' : ''} 
                onClick={() => setView('all')}
              >
                Everything, All at Once
              </button>
              <button 
                className={view === 'monday' ? 'active' : ''} 
                onClick={() => setView('monday')}
              >
                Monday
              </button>
              <button 
                className={view === 'tuesday' ? 'active' : ''} 
                onClick={() => setView('tuesday')}
              >
                Tuesday
              </button>
              <button 
                className={view === 'wednesday' ? 'active' : ''} 
                onClick={() => setView('wednesday')}
              >
                Wednesday
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label>🎯 Type Filter</label>
            <div className="button-group">
              <button 
                className={filterType === 'all' ? 'active' : ''} 
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button 
                className={filterType === 'Session' ? 'active' : ''} 
                onClick={() => setFilterType('Session')}
              >
                Sessions
              </button>
              <button 
                className={filterType === 'Lab' ? 'active' : ''} 
                onClick={() => setFilterType('Lab')}
              >
                Labs
              </button>
            </div>
          </div>

          <div className="control-group legend-control">
            <label>🎨 Track Color</label>
            <div className="button-group">
              <button 
                className="legend-toggle"
                onClick={() => setShowLegend(!showLegend)}
                aria-label={showLegend ? 'Hide legend' : 'Show legend'}
              >
                View Legend
                <span className={`legend-caret ${showLegend ? 'open' : ''}`}>▼</span>
              </button>
            </div>
          </div>
        </div>

        {/* Track Color Legend - Expanded View */}
        {showLegend && (
          <div className="track-legend-container">
            <div className="track-legend">
              {tracksInSchedule.map(track => {
                const color = getSessionTrackColor({ 'CFP: INTERNAL TRACK (SUMMIT)': track });
                return (
                  <div key={track} className="legend-item">
                    <div 
                      className="legend-color-box"
                      style={{
                        background: color?.background || '#667eea',
                        borderColor: color?.border || '#5568d3'
                      }}
                    ></div>
                    <span className="legend-track-name">{track}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="scheduling-grid-content">
        {filteredSchedule.timeSlots && filteredSchedule.timeSlots.length > 0 ? (
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="venue-header">
                    <div className="header-content">
                      <span className="header-icon">🏢</span>
                      <span>Venue</span>
                    </div>
                  </th>
                  {filteredSchedule.timeSlots.map((slot, idx) => (
                  <th key={idx} className="timeslot-header">
                    <div className="timeslot-name">{slot.name}</div>
                    <div className="timeslot-time">{slot.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.venues.map((venue, venueIdx) => (
                <tr key={venueIdx}>
                  <td className="venue-cell">
                    <div className="venue-name">{venue.name}</div>
                    {venue.capacity && (
                      <div className="venue-capacity">
                        <span className="capacity-icon">👥</span>
                        {venue.capacity}
                      </div>
                    )}
                  </td>
                  {filteredSchedule.timeSlots.map((slot, slotIdx) => {
                    const session = venue.sessions.find(
                      s => s.timeSlotIndex === slot.index
                    );
                    
                    const hasContent = session && (session.sessionCode || session.title || session.isOpen || session.isHold || session.isTBD);
                    
                    return (
                      <td 
                        key={slotIdx} 
                        className={session ? getCellClassName(session) : 'schedule-cell empty'}
                        style={session ? getCellStyle(session) : {}}
                        onClick={() => hasContent && handleCellClick(venue, session)}
                      >
                        {session && formatSessionDisplay(session)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="no-data-message">
            <p>No data to display for the selected filters.</p>
            <p>Try selecting different day or type filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchedulingGrid;
