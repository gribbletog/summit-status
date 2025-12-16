import { useState } from 'react';
import SessionCard from './SessionCard';
import WIPModal from './WIPModal';
import { isWIPSession, saveWIPOverride, hasWIPOverride } from '../utils/wipStorage';
import './SessionList.css';

function SessionList({ sessions, filters, filterOptions, onFilterChange, onClearFilters, showWIPData, wipCount, onToggleWIP, onWIPUpdate, showFilterOverlay, onCloseFilterOverlay }) {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const [editingSession, setEditingSession] = useState(null);

  const handleEditWIP = (session) => {
    setEditingSession(session);
  };

  const handleSaveWIP = (wipData) => {
    if (editingSession) {
      saveWIPOverride(editingSession['SESSION CODE'], wipData);
      setEditingSession(null);
      // Trigger refresh to update sessions with WIP data
      onWIPUpdate();
    }
  };

  const handleCloseModal = () => {
    setEditingSession(null);
  };

  // Define session type groups
  const trackSessions = ['Community Theater', 'Hands-on Lab', 'Session', 'Online Session'];
  const summitSessions = ['Certification Exam', 'Keynote', 'Strategy Keynote', 'Sneaks', 'Skill Exchange', 'Pre-conference Training', 'Other'];

  return (
    <div className="session-list-container">
      {showFilterOverlay && (
        <>
          <div className="filter-overlay-backdrop" onClick={onCloseFilterOverlay} />
          <div className="filter-overlay-panel">
            <button className="filter-overlay-close" onClick={onCloseFilterOverlay}>×</button>
            <div className="filters-panel">
        <div className="filters-header">
          <h2>Filters</h2>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={onClearFilters}>
              Clear All
            </button>
          )}
        </div>
        
        {/* Session Type Radio Buttons */}
        <div className="filter-section">
          <label className="filter-section-label">Session Type</label>
          <div className="radio-group-horizontal">
            <label className="radio-label">
              <input
                type="radio"
                name="sessionType"
                value=""
                checked={filters.sessionType === ''}
                onChange={(e) => onFilterChange('sessionType', e.target.value)}
              />
              <span>All</span>
            </label>
          </div>
          
          <div className="session-type-groups">
            <div className="session-type-group">
              <div className="session-type-group-header">Track</div>
              <div className="radio-group-horizontal">
                {trackSessions.map((type) => (
                  filterOptions.sessionTypes.includes(type) && (
                    <label key={type} className="radio-label">
                      <input
                        type="radio"
                        name="sessionType"
                        value={type}
                        checked={filters.sessionType === type}
                        onChange={(e) => onFilterChange('sessionType', e.target.value)}
                      />
                      <span>{type}</span>
                    </label>
                  )
                ))}
              </div>
            </div>
            
            <div className="session-type-group">
              <div className="session-type-group-header">Summit</div>
              <div className="radio-group-horizontal">
                {summitSessions.map((type) => (
                  filterOptions.sessionTypes.includes(type) && (
                    <label key={type} className="radio-label">
                      <input
                        type="radio"
                        name="sessionType"
                        value={type}
                        checked={filters.sessionType === type}
                        onChange={(e) => onFilterChange('sessionType', e.target.value)}
                      />
                      <span>{type}</span>
                    </label>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Published and Session Status Radio Buttons */}
        <div className="filters-row">
          <div className="filter-section">
            <label className="filter-section-label">Published</label>
            <div className="radio-group-vertical">
              <label className="radio-label">
                <input
                  type="radio"
                  name="published"
                  value=""
                  checked={filters.published === ''}
                  onChange={(e) => onFilterChange('published', e.target.value)}
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="published"
                  value="yes"
                  checked={filters.published === 'yes'}
                  onChange={(e) => onFilterChange('published', e.target.value)}
                />
                <span>Yes</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="published"
                  value="no"
                  checked={filters.published === 'no'}
                  onChange={(e) => onFilterChange('published', e.target.value)}
                />
                <span>No</span>
              </label>
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-section-label">Session Status</label>
            <div className="radio-group-vertical">
              <label className="radio-label">
                <input
                  type="radio"
                  name="sessionStatus"
                  value=""
                  checked={filters.sessionStatus === ''}
                  onChange={(e) => onFilterChange('sessionStatus', e.target.value)}
                />
                <span>All</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="sessionStatus"
                  value="Accepted"
                  checked={filters.sessionStatus === 'Accepted'}
                  onChange={(e) => onFilterChange('sessionStatus', e.target.value)}
                />
                <span>Accepted</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="sessionStatus"
                  value="New"
                  checked={filters.sessionStatus === 'New'}
                  onChange={(e) => onFilterChange('sessionStatus', e.target.value)}
                />
                <span>New</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="internalTrack">Internal Track</label>
            <select
              id="internalTrack"
              value={filters.internalTrack}
              onChange={(e) => onFilterChange('internalTrack', e.target.value)}
            >
              <option value="">All Tracks</option>
              {filterOptions.internalTracks.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="products">Products</label>
            <select
              id="products"
              value={filters.products}
              onChange={(e) => onFilterChange('products', e.target.value)}
            >
              <option value="">All Products</option>
              {filterOptions.products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
          </div>
        </>
      )}

      <div className="sessions-results">
        <div className="results-header">
          <div className="results-header-left">
            <h2>Sessions</h2>
            <span className="results-count">
              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          {wipCount > 0 && (
            <div className="wip-toggle-container">
              <label className="wip-toggle">
                <input
                  type="checkbox"
                  checked={showWIPData}
                  onChange={onToggleWIP}
                />
                <span>Show WIP Data ({wipCount})</span>
              </label>
            </div>
          )}
        </div>

        <div className="sessions-grid">
          {sessions.length === 0 ? (
            <div className="no-results">
              <p>No sessions match the current filters.</p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <SessionCard 
                key={index} 
                session={session}
                isWIP={isWIPSession(session)}
                hasWIPOverride={hasWIPOverride(session['SESSION CODE'])}
                onEditWIP={() => handleEditWIP(session)}
              />
            ))
          )}
        </div>
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
}

export default SessionList;

