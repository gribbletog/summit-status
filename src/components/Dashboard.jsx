import { useState } from 'react';
import './Dashboard.css';

function Dashboard({ stats, allSessions, onNavigateToSessions }) {
  const { totalSessions, publishedCount, unpublishedCount, statusCounts } = stats;
  const [expandedTracks, setExpandedTracks] = useState(new Set());

  // Calculate completion by track and session type
  const trackData = {};
  const trackManagerCounts = {};
  
  // Helper function to format names with proper spacing after commas
  const formatManagerName = (name) => {
    if (!name) return '';
    // Add space after commas if not present
    return name.replace(/,(\S)/g, ', $1');
  };
  
  allSessions.forEach(session => {
    const track = session['CFP: INTERNAL TRACK (SUMMIT)'] || 'No Track';
    const sessionType = session['DERIVED_SESSION_TYPE'] || 'No Type';
    const published = session['PUBLISHED']?.toLowerCase() === 'yes';
    const trackManager = session['TRACK MANAGER NAME'];

    // Count track manager occurrences for each track
    if (trackManager && trackManager.trim()) {
      if (!trackManagerCounts[track]) {
        trackManagerCounts[track] = {};
      }
      trackManagerCounts[track][trackManager] = (trackManagerCounts[track][trackManager] || 0) + 1;
    }

    if (!trackData[track]) {
      trackData[track] = {};
    }

    if (!trackData[track][sessionType]) {
      trackData[track][sessionType] = {
        total: 0,
        published: 0,
        unpublished: 0
      };
    }

    trackData[track][sessionType].total++;
    if (published) {
      trackData[track][sessionType].published++;
    } else {
      trackData[track][sessionType].unpublished++;
    }
  });

  // Determine the most common track manager for each track
  const trackManagers = {};
  Object.keys(trackManagerCounts).forEach(track => {
    const managers = trackManagerCounts[track];
    const mostCommonManager = Object.keys(managers).reduce((a, b) => 
      managers[a] > managers[b] ? a : b
    );
    trackManagers[track] = formatManagerName(mostCommonManager);
  });

  const toggleTrack = (track) => {
    const newExpanded = new Set(expandedTracks);
    if (newExpanded.has(track)) {
      newExpanded.delete(track);
    } else {
      newExpanded.add(track);
    }
    setExpandedTracks(newExpanded);
  };

  return (
    <div className="dashboard">
      <div className="session-overview">
        <div className="overview-header">
          <h2>Totals</h2>
          <span className="overview-total">{totalSessions}</span>
        </div>
        <div className="overview-stats">
          <div className="overview-item">
            <div className="overview-bar-container">
              <div className="overview-label">
                <span className="overview-name">Published</span>
                <span className="overview-count">
                  {publishedCount} ({totalSessions > 0 ? Math.round((publishedCount / totalSessions) * 100) : 0}%)
                </span>
              </div>
              <div className="overview-bar-bg">
                <div
                  className="overview-bar-fill published-bar"
                  style={{
                    width: `${totalSessions > 0 ? (publishedCount / totalSessions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="overview-item">
            <div className="overview-bar-container">
              <div className="overview-label">
                <span className="overview-name">Unpublished</span>
                <span className="overview-count">
                  {unpublishedCount} ({totalSessions > 0 ? Math.round((unpublishedCount / totalSessions) * 100) : 0}%)
                </span>
              </div>
              <div className="overview-bar-bg">
                <div
                  className="overview-bar-fill unpublished-bar"
                  style={{
                    width: `${totalSessions > 0 ? (unpublishedCount / totalSessions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="status-breakdown">
        <h2>Session Status</h2>
        <div className="status-grid">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="status-item">
              <div className="status-bar-container">
                <div className="status-label">
                  <span className="status-name">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="status-bar-bg">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / totalSessions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="track-completion">
        <h2>% Complete</h2>
        <div className="tracks-container">
          {Object.entries(trackData).sort().map(([track, types]) => {
            const trackTotal = Object.values(types).reduce((sum, t) => sum + t.total, 0);
            const trackPublished = Object.values(types).reduce((sum, t) => sum + t.published, 0);
            const completionPercent = trackTotal > 0 ? Math.round((trackPublished / trackTotal) * 100) : 0;
            const isExpanded = expandedTracks.has(track);

            return (
              <div key={track} className="track-section">
                <div className="track-header-wrapper">
                  <div className="track-header-row" onClick={() => toggleTrack(track)}>
                    <button
                      className={`track-expand-button ${isExpanded ? 'expanded' : ''}`}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      ▶
                    </button>
                    <div className="track-title-group">
                      <h3>{track}</h3>
                      {trackManagers[track] && (
                        <span className="track-manager">{trackManagers[track]}</span>
                      )}
                    </div>
                  </div>
                  <div className="track-progress-container">
                    <div className="track-progress-bar-bg">
                      <div
                        className="track-progress-bar-fill"
                        style={{
                          width: `${completionPercent}%`,
                          background: completionPercent < 33 
                            ? '#e74c3c' 
                            : completionPercent < 66 
                            ? '#f39c12' 
                            : '#27ae60'
                        }}
                      />
                    </div>
                    <span className="track-progress-percent">{completionPercent}%</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="session-types-grid">
                    {Object.entries(types).sort().map(([type, counts]) => (
                      <div 
                        key={type} 
                        className="session-type-card clickable"
                        onClick={() => onNavigateToSessions(track, type)}
                        title={`View ${track} - ${type} sessions`}
                      >
                        <h4>{type}</h4>
                        <div className="type-stats-list">
                          <div className="type-stat-item">
                            <span>Published</span>
                            <strong className="published-value">{counts.published}</strong>
                          </div>
                          <div className="type-stat-item">
                            <span>Unpublished</span>
                            <strong className="unpublished-value">{counts.unpublished}</strong>
                          </div>
                          <div className="type-stat-item total-row">
                            <span>Total</span>
                            <strong className="total-value">{counts.total}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

