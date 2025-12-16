import React, { useState, useMemo } from 'react';
import WIPModal from './WIPModal';
import { isWIPSession, saveWIPOverride, hasWIPOverride } from '../utils/wipStorage';
import './TracksView.css';

const TracksView = ({ sessions, showWIPData, wipCount, onToggleWIP, onWIPUpdate, showFilterOverlay, onCloseFilterOverlay }) => {
  const [showMainTracksOnly, setShowMainTracksOnly] = useState(true);
  const [expandAll, setExpandAll] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [editingSession, setEditingSession] = useState(null);

  // Get most common track manager for a track
  const getMostCommonTrackManager = (trackSessions) => {
    const managers = trackSessions
      .map(s => s['TRACK MANAGER NAME'])
      .filter(m => m && m.trim() !== '');
    
    if (managers.length === 0) return null;
    
    const counts = {};
    managers.forEach(m => {
      counts[m] = (counts[m] || 0) + 1;
    });
    
    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    
    // Format name with space after comma
    return mostCommon.replace(/,(\S)/g, ', $1');
  };

  // Calculate track data
  const trackData = useMemo(() => {
    const tracks = {};
    
    sessions.forEach(session => {
      const track = session['CFP: INTERNAL TRACK (SUMMIT)'];
      const sessionType = session['DERIVED_SESSION_TYPE'];
      const published = session['PUBLISHED']?.toLowerCase() === 'yes';
      
      if (!track) return;
      
      if (!tracks[track]) {
        tracks[track] = {
          name: track,
          sessions: [],
          CP: { published: 0, total: 0 },
          S: { published: 0, total: 0 },
          OS: { published: 0, total: 0 },
          L: { published: 0, total: 0 },
          totalPublished: 0,
          totalSessions: 0
        };
      }
      
      tracks[track].sessions.push(session);
      tracks[track].totalSessions++;
      if (published) tracks[track].totalPublished++;
      
      // Count by session type
      if (sessionType === 'Community Theater') {
        tracks[track].CP.total++;
        if (published) tracks[track].CP.published++;
      } else if (sessionType === 'Session') {
        tracks[track].S.total++;
        if (published) tracks[track].S.published++;
      } else if (sessionType === 'Online Session') {
        tracks[track].OS.total++;
        if (published) tracks[track].OS.published++;
      } else if (sessionType === 'Hands-on Lab') {
        tracks[track].L.total++;
        if (published) tracks[track].L.published++;
      }
    });
    
    return Object.values(tracks);
  }, [sessions]);

  // Filter tracks
  const filteredTracks = useMemo(() => {
    let filtered = [...trackData];
    
    if (showMainTracksOnly) {
      // Exclude these tracks when showing only main in-person tracks
      const excludedTracks = [
        'Keynote and Sneaks',
        'Keynote',
        'Sneaks',
        'Strategy Keynote',
        'Community Theater',
        'CP Theater',
        'Sponsors',
        'Summit - other',
        'Summit-other',
        'Industry Session',
        'ACS',
        'Skill Exchange',
        'ADLS'
      ];
      
      // Filter out excluded tracks (trim names to handle trailing spaces)
      filtered = filtered.filter(track => {
        const trimmedName = track.name?.trim();
        return !excludedTracks.includes(trimmedName);
      });
    }
    
    // Sort alphabetically by track name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [trackData, showMainTracksOnly]);

  const toggleTrack = (trackName) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackName]: !prev[trackName]
    }));
  };

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleEditWIP = (session) => {
    setEditingSession(session);
  };

  const handleSaveWIP = (wipData) => {
    if (editingSession) {
      saveWIPOverride(editingSession['SESSION CODE'], wipData);
      setEditingSession(null);
      onWIPUpdate(); // Refresh data
    }
  };

  const handleCloseModal = () => {
    setEditingSession(null);
  };

  const handleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    const newExpanded = {};
    filteredTracks.forEach(track => {
      newExpanded[track.name] = newExpandAll;
    });
    setExpandedTracks(newExpanded);
  };

  const getSessionsByType = (trackSessions, type) => {
    return trackSessions.filter(s => s['DERIVED_SESSION_TYPE'] === type);
  };

  // Helper to clean duplicate company names
  const cleanCompanyName = (companyName) => {
    if (!companyName) return null;
    const parts = companyName.split(',').map(part => part.trim()).filter(part => part !== '');
    const uniqueParts = [...new Set(parts)];
    return uniqueParts.join(', ');
  };

  const renderSessionCard = (session, trackName) => {
    const cardId = `${trackName}-${session['SESSION CODE']}`;
    const isExpanded = expandedCards[cardId];
    
    const title = session['SESSION TITLE'] || 'Untitled';
    const description = session['SESSION ABSTRACT'] || '';
    const speakers = [];
    
    // Get speakers
    if (session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME']) {
      const name = session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'];
      const company = cleanCompanyName(session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']);
      speakers.push({ name, company, type: 'Speaker' });
    }
    if (session['SPEAKER NAME']) {
      const name = session['SPEAKER NAME'];
      const company = cleanCompanyName(session['SPEAKER COMPANY']);
      speakers.push({ name, company, type: 'Co-presenter' });
    }
    
    // Strip HTML for length check
    const plainDescription = description.replace(/<[^>]*>/g, '');
    const isLongContent = title.length > 80 || plainDescription.length > 200;
    
    const sessionIsWIP = isWIPSession(session);
    // Always check localStorage for latest WIP override status
    const sessionHasWIPOverride = hasWIPOverride(session['SESSION CODE']);

    return (
      <div key={cardId} className={`track-session-card ${isExpanded ? 'expanded' : ''} ${(sessionIsWIP || sessionHasWIPOverride) ? 'wip-card' : ''} ${sessionHasWIPOverride ? 'has-wip-override' : ''}`}>
        <div className="track-card-header">
          <h4 className="track-card-title">{title}</h4>
          {(sessionIsWIP || sessionHasWIPOverride) && (
            <span className="track-wip-badge">
              {sessionHasWIPOverride ? '📝' : '⚠️'}
            </span>
          )}
        </div>
        
        <div 
          className="track-card-description"
          dangerouslySetInnerHTML={{ 
            __html: isExpanded ? description : plainDescription.substring(0, 200) + (plainDescription.length > 200 ? '...' : '')
          }}
        />
        
        {speakers.length > 0 && (
          <div className="track-card-speakers">
            {speakers.map((speaker, idx) => (
              <div key={idx} className="track-card-speaker">
                <span className="speaker-name">{speaker.name}</span>
                {speaker.company && <span className="speaker-company">{speaker.company}</span>}
              </div>
            ))}
          </div>
        )}
        
        <div className="track-card-actions">
          {isLongContent && (
            <button 
              className="track-card-more"
              onClick={() => toggleCard(cardId)}
            >
              {isExpanded ? 'Show less' : 'More...'}
            </button>
          )}
          {(sessionIsWIP || sessionHasWIPOverride) && (
            <button 
              className="track-card-edit-wip"
              onClick={() => handleEditWIP(session)}
            >
              {sessionHasWIPOverride ? 'Edit WIP' : 'Add WIP'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderTrackSection = (track, sessionType, label) => {
    const sessionsByType = getSessionsByType(track.sessions, sessionType);
    
    if (sessionsByType.length === 0) return null;
    
    return (
      <div className="track-section" key={sessionType}>
        <h4 className="track-section-title">{label}</h4>
        <div className="track-cards-grid">
          {sessionsByType.map(session => renderSessionCard(session, track.name))}
        </div>
      </div>
    );
  };

  return (
    <div className="tracks-view">
      {showFilterOverlay && (
        <div className="filter-overlay-backdrop" onClick={onCloseFilterOverlay}>
          <div className="filter-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <button className="filter-overlay-close" onClick={onCloseFilterOverlay}>&times;</button>
            
            <div className="tracks-header">
              <div className="tracks-toggles">
                <label className="track-toggle">
                  <input
                    type="checkbox"
                    checked={showMainTracksOnly}
                    onChange={(e) => setShowMainTracksOnly(e.target.checked)}
                  />
                  <span>Show main in-person tracks only</span>
                </label>
                
                {wipCount > 0 && (
                  <label className="track-toggle wip-toggle">
                    <input
                      type="checkbox"
                      checked={showWIPData}
                      onChange={onToggleWIP}
                    />
                    <span>Show WIP Data ({wipCount})</span>
                  </label>
                )}
                
                <button 
                  className="expand-all-button"
                  onClick={handleExpandAll}
                >
                  {expandAll ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="tracks-list">
        {filteredTracks.map(track => {
          const isExpanded = expandedTracks[track.name];
          const trackManager = getMostCommonTrackManager(track.sessions);
          const percentComplete = track.totalSessions > 0 
            ? Math.round((track.totalPublished / track.totalSessions) * 100) 
            : 0;
          
          return (
            <div key={track.name} className="track-item">
              <div className="track-summary" onClick={() => toggleTrack(track.name)}>
                <span className="track-caret">{isExpanded ? '▼' : '▶'}</span>
                <span className="track-name">{track.name}</span>
                {trackManager && (
                  <span className="track-manager">{trackManager}</span>
                )}
                <div className="track-counts">
                  {track.CP.total > 0 && (
                    <span className="count-badge">CP {track.CP.published}/{track.CP.total}</span>
                  )}
                  {track.S.total > 0 && (
                    <span className="count-badge">S {track.S.published}/{track.S.total}</span>
                  )}
                  {track.OS.total > 0 && (
                    <span className="count-badge">OS {track.OS.published}/{track.OS.total}</span>
                  )}
                  {track.L.total > 0 && (
                    <span className="count-badge">L {track.L.published}/{track.L.total}</span>
                  )}
                  <span className="track-percent">{percentComplete}%</span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="track-details">
                  {renderTrackSection(track, 'Community Theater', 'Community Theater')}
                  {renderTrackSection(track, 'Session', 'Sessions')}
                  {renderTrackSection(track, 'Online Session', 'Online Sessions')}
                  {renderTrackSection(track, 'Hands-on Lab', 'Hands-on Labs')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingSession && (
        <WIPModal
          session={editingSession}
          onSave={handleSaveWIP}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TracksView;

