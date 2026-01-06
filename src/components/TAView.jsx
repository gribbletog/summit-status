import React, { useState, useMemo } from 'react';
import FileUpload from './FileUpload';
import './TAView.css';

const TAView = ({ sessions, taData, labToTAs, onTAUpload }) => {
  const [expandedTracks, setExpandedTracks] = useState({});
  const [selectedLab, setSelectedLab] = useState(null);

  // Get all Hands-on Lab sessions enriched with TA data
  const labs = useMemo(() => {
    return sessions
      .filter(session => session['DERIVED_SESSION_TYPE'] === 'Hands-on Lab')
      .map(lab => {
        const labCode = lab['SESSION CODE'];
        const tas = labToTAs[labCode] || [];
        const taCount = tas.length;
        
        // Staffing logic: 3-5 is good, 0-2 is critical, 6+ is too many
        let staffingStatus = 'good'; // 3-5 TAs
        if (taCount < 3) staffingStatus = 'critical';
        if (taCount > 5) staffingStatus = 'toomany';
        
        return {
          ...lab,
          labCode,
          tas,
          taCount,
          staffingPercent: Math.min((taCount / 3) * 100, 100),
          staffingStatus,
          needsMore: taCount < 3,
          isCritical: taCount < 3,
          tooMany: taCount > 5,
        };
      })
      .sort((a, b) => a.labCode.localeCompare(b.labCode));
  }, [sessions, labToTAs]);

  // Group labs by track
  const labsByTrack = useMemo(() => {
    const grouped = {};
    labs.forEach(lab => {
      const track = lab['CFP: INTERNAL TRACK (SUMMIT)'] || 'Other';
      if (!grouped[track]) {
        grouped[track] = [];
      }
      grouped[track].push(lab);
    });
    
    // Sort tracks alphabetically
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [track, labs]) => {
        acc[track] = labs;
        return acc;
      }, {});
  }, [labs]);

  const toggleTrack = (trackName) => {
    setExpandedTracks(prev => ({
      ...prev,
      [trackName]: !prev[trackName]
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = Object.keys(labsByTrack).every(track => expandedTracks[track]);
    const newState = {};
    Object.keys(labsByTrack).forEach(track => {
      newState[track] = !allExpanded;
    });
    setExpandedTracks(newState);
  };

  const openLabDetail = (lab) => {
    setSelectedLab(lab);
  };

  const closeLabDetail = () => {
    setSelectedLab(null);
  };

  // Get instructors from lab session
  const getInstructors = (lab) => {
    const instructors = [];
    if (lab['SPEAKER (ASSIGNED TO SESSION TASKS) NAME']) {
      instructors.push({
        name: lab['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'],
        company: lab['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY']
      });
    }
    if (lab['SPEAKER NAME']) {
      instructors.push({
        name: lab['SPEAKER NAME'],
        company: lab['SPEAKER COMPANY']
      });
    }
    return instructors;
  };

  // Stats
  const stats = useMemo(() => {
    const totalLabs = labs.length;
    const totalTAs = taData.length;
    const totalAssignments = taData.reduce((sum, ta) => sum + ta.labs.length, 0);
    const criticalLabs = labs.filter(l => l.isCritical).length;
    const wellStaffedLabs = labs.filter(l => l.taCount >= 3 && l.taCount <= 5).length;
    const overStaffedLabs = labs.filter(l => l.taCount > 5).length;
    
    return {
      totalLabs,
      totalTAs,
      totalAssignments,
      avgTAsPerLab: totalLabs > 0 ? (totalAssignments / totalLabs).toFixed(1) : 0,
      criticalLabs,
      wellStaffedLabs,
      overStaffedLabs
    };
  }, [labs, taData]);

  // If no TA data, show upload prompt
  if (!taData || taData.length === 0) {
    return (
      <div className="ta-view">
        <div className="ta-upload-prompt">
          <h2>TA Assignments</h2>
          <p>Upload the Teaching Assistant assignments CSV to view lab staffing.</p>
          <FileUpload onFileUpload={onTAUpload} accept=".csv" />
        </div>
      </div>
    );
  }

  return (
    <div className="ta-view">
      <div className="ta-header">
        <div className="ta-title-section">
          <h2>TA Assignments - Hands-on Labs</h2>
          <button className="ta-expand-all" onClick={handleExpandAll}>
            {Object.keys(labsByTrack).every(track => expandedTracks[track]) ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        
        <div className="ta-stats">
          <div className="ta-stat">
            <span className="stat-value">{stats.totalLabs}</span>
            <span className="stat-label">Total Labs</span>
          </div>
          <div className="ta-stat">
            <span className="stat-value">{stats.totalTAs}</span>
            <span className="stat-label">Total TAs</span>
          </div>
          <div className="ta-stat">
            <span className="stat-value">{stats.avgTAsPerLab}</span>
            <span className="stat-label">Avg TAs/Lab</span>
          </div>
          <div className="ta-stat critical">
            <span className="stat-value">{stats.criticalLabs}</span>
            <span className="stat-label">Need TAs</span>
          </div>
          <div className="ta-stat excellent">
            <span className="stat-value">{stats.wellStaffedLabs}</span>
            <span className="stat-label">Well Staffed</span>
          </div>
          <div className="ta-stat warning">
            <span className="stat-value">{stats.overStaffedLabs}</span>
            <span className="stat-label">Too Many</span>
          </div>
        </div>
      </div>

      <div className="ta-tracks-list">
        {Object.entries(labsByTrack).map(([trackName, trackLabs]) => {
          const isExpanded = expandedTracks[trackName];
          
          return (
            <div key={trackName} className="ta-track-item">
              <div className="ta-track-header" onClick={() => toggleTrack(trackName)}>
                <span className="ta-track-caret">{isExpanded ? '▼' : '▶'}</span>
                <span className="ta-track-name">{trackName}</span>
                <span className="ta-track-count">({trackLabs.length} labs)</span>
              </div>
              
              {isExpanded && (
                <div className="ta-labs-grid">
                  {trackLabs.map(lab => (
                    <div
                      key={lab.labCode}
                      className={`ta-lab-card ${lab.staffingStatus}`}
                      onClick={() => openLabDetail(lab)}
                    >
                      <div className="ta-lab-header">
                        <span className="ta-lab-code">{lab.labCode}</span>
                        <span className={`ta-lab-staffing ${lab.staffingStatus}`}>
                          {lab.taCount} TA{lab.taCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h4 className="ta-lab-title">{lab['SESSION TITLE']}</h4>
                      <div className="ta-lab-people">
                        <div className="ta-lab-instructors">
                          {getInstructors(lab).map((instructor, idx) => (
                            <div key={idx} className="ta-instructor-name">
                              👨‍🏫 {instructor.name}
                            </div>
                          ))}
                        </div>
                        {lab.tas.length > 0 && (
                          <div className="ta-lab-tas">
                            {lab.tas.map((ta, idx) => (
                              <div key={idx} className="ta-assistant-name">
                                {ta.labs.length >= 3 ? '⭐' : '🎓'} {ta.fullName}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {(lab.isCritical || lab.tooMany) && (
                        <div className={`ta-lab-warning ${lab.tooMany ? 'toomany' : ''}`}>
                          {lab.isCritical && '🔴 Critical: Needs more TAs'}
                          {lab.tooMany && '🟡 Too many TAs - reduce to 5'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedLab && (
        <div className="ta-detail-overlay" onClick={closeLabDetail}>
          <div className="ta-detail-panel" onClick={(e) => e.stopPropagation()}>
            <button className="ta-detail-close" onClick={closeLabDetail}>×</button>
            
            <div className="ta-detail-header">
              <span className="ta-detail-code">{selectedLab.labCode}</span>
              <span className={`ta-detail-staffing ${selectedLab.staffingStatus}`}>
                {selectedLab.taCount} / 3-5 TAs
              </span>
            </div>
            
            <h3 className="ta-detail-title">{selectedLab['SESSION TITLE']}</h3>
            
            <div className="ta-detail-info">
              <div className="ta-info-item">
                <strong>Track:</strong> {selectedLab['CFP: INTERNAL TRACK (SUMMIT)']}
              </div>
              {selectedLab['SESSION DATE'] && (
                <div className="ta-info-item">
                  <strong>Date:</strong> {selectedLab['SESSION DATE']}
                </div>
              )}
              {selectedLab['SESSION START TIME'] && (
                <div className="ta-info-item">
                  <strong>Time:</strong> {selectedLab['SESSION START TIME']} - {selectedLab['SESSION END TIME']}
                </div>
              )}
              {selectedLab['SESSION ROOM'] && (
                <div className="ta-info-item">
                  <strong>Room:</strong> {selectedLab['SESSION ROOM']}
                </div>
              )}
              {selectedLab['SESSION CAPACITY'] && (
                <div className="ta-info-item">
                  <strong>Capacity:</strong> {selectedLab['SESSION CAPACITY']}
                </div>
              )}
            </div>

            <div className="ta-detail-section">
              <h4>Instructors ({getInstructors(selectedLab).length})</h4>
              <div className="ta-detail-list">
                {getInstructors(selectedLab).map((instructor, idx) => (
                  <div key={idx} className="ta-detail-person instructor">
                    <div className="ta-person-icon">👨‍🏫</div>
                    <div className="ta-person-info">
                      <div className="ta-person-name">{instructor.name}</div>
                      {instructor.company && (
                        <div className="ta-person-company">{instructor.company}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ta-detail-section">
              <h4>Teaching Assistants ({selectedLab.taCount})</h4>
              {selectedLab.tas.length > 0 ? (
                <div className="ta-detail-list">
                  {selectedLab.tas.map((ta, idx) => (
                    <div key={idx} className="ta-detail-person ta">
                      <div className="ta-person-icon">
                        {ta.labs.length >= 3 ? '⭐' : '✓'}
                      </div>
                      <div className="ta-person-info">
                        <div className="ta-person-name">
                          {ta.fullName}
                          {ta.labs.length >= 3 && (
                            <span className="ta-mvp-badge">MVP ({ta.labs.length} labs)</span>
                          )}
                        </div>
                        {ta.svp && (
                          <div className="ta-person-detail">SVP: {ta.svp}</div>
                        )}
                        {ta.nominatedBy && (
                          <div className="ta-person-detail">Nominated by: {ta.nominatedBy}</div>
                        )}
                        {ta.notes && (
                          <div className="ta-person-notes">{ta.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ta-no-assignments">No TAs assigned yet</div>
              )}
              
              {selectedLab.needsMore && (
                <div className={`ta-staffing-alert ${selectedLab.isCritical ? 'critical' : 'warning'}`}>
                  {selectedLab.isCritical 
                    ? `⚠️ Critical: Needs ${3 - selectedLab.taCount} more TAs (minimum 3)`
                    : `Recommended: Add ${5 - selectedLab.taCount} more TAs (target 5)`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TAView;

