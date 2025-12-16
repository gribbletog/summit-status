// WIP Session Storage Utilities

const WIP_STORAGE_KEY = 'summit-wip-sessions';

// Check if a session is a WIP placeholder
export const isWIPSession = (session) => {
  const title = session['SESSION TITLE'] || '';
  const description = session['SESSION ABSTRACT'] || '';
  const descLower = description.toLowerCase();
  
  // Generic titles pattern: "Track Lab 1", "Developer Session 2", etc.
  const genericTitlePattern = /^[A-Za-z\s]+(Lab|Session|Theater)\s+\d+$/i;
  
  // WIP indicators
  const wipIndicators = [
    'placeholder',
    'tbd',
    'to be determined',
    'speakers tbd',
    'speaker tbd',
    'need speaker',
    'needs speaker',
    'need content',
    'needs content',
    'coming soon',
    'draft',
    'in progress',
    'wip'
  ];
  
  // Check for generic title
  if (genericTitlePattern.test(title.trim())) {
    return true;
  }
  
  // Check for WIP indicators in description
  if (wipIndicators.some(indicator => descLower.includes(indicator))) {
    return true;
  }
  
  // Check for very short descriptions (likely placeholder)
  const plainDescription = description.replace(/<[^>]*>/g, '').trim();
  if (plainDescription.length > 0 && plainDescription.length < 50) {
    return true;
  }
  
  return false;
};

// Get all WIP overrides from localStorage
export const getWIPOverrides = () => {
  try {
    const stored = localStorage.getItem(WIP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading WIP data:', error);
    return {};
  }
};

// Save WIP override for a session
export const saveWIPOverride = (sessionCode, wipData) => {
  try {
    const overrides = getWIPOverrides();
    overrides[sessionCode] = {
      ...wipData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch (error) {
    console.error('Error saving WIP data:', error);
    return false;
  }
};

// Delete WIP override for a session
export const deleteWIPOverride = (sessionCode) => {
  try {
    const overrides = getWIPOverrides();
    delete overrides[sessionCode];
    localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(overrides));
    return true;
  } catch (error) {
    console.error('Error deleting WIP data:', error);
    return false;
  }
};

// Check if a session has WIP override
export const hasWIPOverride = (sessionCode) => {
  const overrides = getWIPOverrides();
  return !!overrides[sessionCode];
};

// Get WIP override for a session
export const getWIPOverride = (sessionCode) => {
  const overrides = getWIPOverrides();
  return overrides[sessionCode] || null;
};

// Apply WIP overrides to sessions
export const applyWIPOverrides = (sessions, showWIP = true) => {
  if (!showWIP) return sessions;
  
  const overrides = getWIPOverrides();
  
  return sessions.map(session => {
    const sessionCode = session['SESSION CODE'];
    const override = overrides[sessionCode];
    
    if (!override) return session;
    
    // Apply overrides to session
    return {
      ...session,
      'SESSION TITLE': override.title || session['SESSION TITLE'],
      'SESSION ABSTRACT': override.description || session['SESSION ABSTRACT'],
      'SPEAKER (ASSIGNED TO SESSION TASKS) NAME': override.speaker1 || session['SPEAKER (ASSIGNED TO SESSION TASKS) NAME'],
      'SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY': override.speaker1Company || session['SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY'],
      'SPEAKER NAME': override.speaker2 || session['SPEAKER NAME'],
      'SPEAKER COMPANY': override.speaker2Company || session['SPEAKER COMPANY'],
      '_HAS_WIP_OVERRIDE': true
    };
  });
};

// Count how many sessions have WIP overrides
export const countWIPOverrides = () => {
  const overrides = getWIPOverrides();
  return Object.keys(overrides).length;
};

