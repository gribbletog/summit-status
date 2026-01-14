import Papa from 'papaparse';

/**
 * Parse the scheduling grid CSV
 * This CSV has a complex structure with:
 * - Time slots in headers (Sessions #1, Labs #1, etc.)
 * - Venues/rooms as row identifiers
 * - Sessions in cells with codes like S324, L123, etc.
 */
export const parseScheduleCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false, // We'll handle headers manually due to complex structure
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const data = results.data;
          const schedule = parseScheduleData(data);
          resolve(schedule);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * Parse the raw CSV data into a structured schedule
 */
const parseScheduleData = (data) => {
  if (!data || data.length < 2) {
    throw new Error('Invalid schedule data');
  }

  // Find the time slots row (contains "Sessions #", "Labs #", etc.)
  const timeSlotRow = data[0];
  const timeDetailsRow = data[1];
  
  // Parse time slots
  const timeSlots = [];
  for (let i = 4; i < timeSlotRow.length; i++) {
    const slotName = timeSlotRow[i];
    const slotTime = timeDetailsRow[i];
    
    if (slotName && slotName.trim()) {
      // Determine slot type and day
      const { type, day, number, fullTime } = parseTimeSlotInfo(slotName, slotTime);
      
      timeSlots.push({
        index: i,
        name: slotName.trim(),
        time: slotTime ? slotTime.trim() : '',
        type,
        day,
        number,
        fullTime
      });
    }
  }

  // Parse venues and sessions
  const venues = [];
  let currentVenue = null;
  
  for (let rowIndex = 3; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    const venueCell = row[0] ? row[0].trim() : '';
    
    // Skip metadata rows (Speakers, Special Notes, Add Mics, AV)
    if (venueCell === 'Speakers' || venueCell === 'Special Notes' || 
        venueCell === 'Add Mics' || venueCell === 'AV') {
      continue;
    }
    
    // Skip LABS header
    if (venueCell === 'LABS') {
      continue;
    }
    
    // Check if this is a venue row (has capacity info or is a room name)
    if (venueCell && (venueCell.includes('CAP') || venueCell.includes('Level') || 
        venueCell.includes('Palazzo') || venueCell.includes('Delfino') ||
        venueCell.includes('Lido') || venueCell.includes('Murano') ||
        venueCell.includes('Marcello') || venueCell.includes('Lando') ||
        venueCell.includes('Zeno'))) {
      
      currentVenue = {
        name: venueCell,
        capacity: extractCapacity(venueCell),
        sessions: []
      };
      
      // Parse sessions for this venue
      for (const slot of timeSlots) {
        const cellContent = row[slot.index] ? row[slot.index].trim() : '';
        
        if (cellContent) {
          const sessionInfo = parseSessionCell(cellContent);
          
          // Determine type from session CODE, not time slot name
          let sessionType = slot.type; // Default from time slot
          if (sessionInfo.sessionCode) {
            if (sessionInfo.sessionCode.startsWith('L')) {
              sessionType = 'Lab';
            } else if (sessionInfo.sessionCode.startsWith('S')) {
              sessionType = 'Session';
            } else if (sessionInfo.sessionCode.startsWith('SK')) {
              sessionType = 'Strategy Keynote';
            }
          }
          
          currentVenue.sessions.push({
            timeSlot: slot.name,
            timeSlotIndex: slot.index,
            day: slot.day,
            type: sessionType, // Use session-code-based type
            ...sessionInfo
          });
        }
      }
      
      venues.push(currentVenue);
    }
  }

  return {
    timeSlots,
    venues,
    days: getDays(timeSlots)
  };
};

/**
 * Parse time slot information to extract type, day, and number
 */
const parseTimeSlotInfo = (slotName, slotTime) => {
  const match = slotName.match(/(Sessions?|Labs?)\s*#?(\d+)/i);
  
  let type = 'Session';
  let number = 0;
  
  if (match) {
    type = match[1].toLowerCase().includes('lab') ? 'Lab' : 'Session';
    number = parseInt(match[2], 10);
  }
  
  // Determine day based on session/lab number
  // Based on the typical Summit schedule:
  // Monday: Sessions #1, Labs #1
  // Tuesday: Sessions #2-4, Labs #2-3, Strategy Keynotes #1-2
  // Wednesday: Sessions #5-7, Labs #4-5, Strategy Keynotes #3-4
  // Thursday: Sessions #8-10, Labs #6-7
  
  let day = 'Unknown';
  if (type === 'Session') {
    if (number === 1) day = 'Monday';
    else if (number >= 2 && number <= 4) day = 'Tuesday';
    else if (number >= 5 && number <= 7) day = 'Wednesday';
    else if (number >= 8 && number <= 10) day = 'Thursday';
  } else if (type === 'Lab') {
    if (number === 1) day = 'Monday';
    else if (number >= 2 && number <= 3) day = 'Tuesday';
    else if (number >= 4 && number <= 5) day = 'Wednesday';
    else if (number >= 6 && number <= 7) day = 'Thursday';
  }
  
  // Check for Strategy Keynote in the slot name
  if (slotName.includes('Strategy Keynote')) {
    type = 'Strategy Keynote';
    const keynoteMatch = slotName.match(/#(\d+)/);
    if (keynoteMatch) {
      const keynoteNum = parseInt(keynoteMatch[1], 10);
      if (keynoteNum <= 2) day = 'Tuesday';
      else day = 'Wednesday';
    }
  }
  
  const fullTime = slotTime ? `${slotName}\n${slotTime}` : slotName;
  
  return { type, day, number, fullTime };
};

/**
 * Extract capacity from venue name
 */
const extractCapacity = (venueName) => {
  const match = venueName.match(/CAP[:\s]*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Parse session cell content to extract session code, title, and other info
 */
const parseSessionCell = (cellContent) => {
  // Match session code (S###, L###, SK##, etc.)
  const codeMatch = cellContent.match(/([A-Z]+\d+)/);
  const sessionCode = codeMatch ? codeMatch[1] : null;
  
  // Extract title (everything after the colon, if present)
  let title = '';
  const colonIndex = cellContent.indexOf(':');
  if (colonIndex > -1) {
    title = cellContent.substring(colonIndex + 1).trim();
  } else if (!sessionCode) {
    // If no code and no colon, the whole thing might be the title
    title = cellContent;
  }
  
  // Check for special markers
  const isOpen = cellContent.toLowerCase().includes('open');
  const isTBD = cellContent.toLowerCase().includes('tbd');
  const isDoNotSchedule = cellContent.toLowerCase().includes('do not schedule');
  const isHold = cellContent.toLowerCase().includes('hold');
  const isRepeat = cellContent.toLowerCase().includes('repeat');
  
  return {
    sessionCode,
    title,
    rawContent: cellContent,
    isOpen,
    isTBD,
    isDoNotSchedule,
    isHold,
    isRepeat
  };
};

/**
 * Get unique days from time slots
 */
const getDays = (timeSlots) => {
  const days = [...new Set(timeSlots.map(slot => slot.day))].filter(day => day !== 'Unknown');
  return days;
};

/**
 * Get sessions for a specific day
 */
export const getSessionsForDay = (schedule, day) => {
  if (!schedule) return { timeSlots: [], venues: [] };
  
  const dayTimeSlots = schedule.timeSlots.filter(slot => slot.day === day);
  const dayVenues = schedule.venues.map(venue => ({
    ...venue,
    sessions: venue.sessions.filter(session => session.day === day)
  })).filter(venue => venue.sessions.length > 0);
  
  return {
    timeSlots: dayTimeSlots,
    venues: dayVenues
  };
};

/**
 * Get sessions by type (Session, Lab, etc.)
 */
export const getSessionsByType = (schedule, type) => {
  if (!schedule) return { timeSlots: [], venues: [] };
  
  const typeTimeSlots = schedule.timeSlots.filter(slot => slot.type === type);
  const typeVenues = schedule.venues.map(venue => ({
    ...venue,
    sessions: venue.sessions.filter(session => session.type === type)
  })).filter(venue => venue.sessions.length > 0);
  
  return {
    timeSlots: typeTimeSlots,
    venues: typeVenues
  };
};

/**
 * Find a session by its session code
 */
export const findSessionByCode = (sessions, code) => {
  if (!code || !sessions) return null;
  return sessions.find(session => 
    session['SESSION CODE'] === code || 
    session['SESSION CODE'] === code.toUpperCase()
  );
};

/**
 * Get all sessions at a specific time slot
 */
export const getSessionsAtTimeSlot = (schedule, timeSlotName) => {
  if (!schedule) return [];
  
  const sessionsAtTime = [];
  schedule.venues.forEach(venue => {
    venue.sessions.forEach(session => {
      if (session.timeSlot === timeSlotName) {
        sessionsAtTime.push({
          ...session,
          venue: venue.name,
          capacity: venue.capacity
        });
      }
    });
  });
  
  return sessionsAtTime;
};

/**
 * Get conflicts (sessions with same code in different venues at same time)
 */
export const findConflicts = (schedule) => {
  const conflicts = [];
  
  schedule.timeSlots.forEach(slot => {
    const sessionsAtTime = getSessionsAtTimeSlot(schedule, slot.name);
    const sessionCodes = sessionsAtTime
      .filter(s => s.sessionCode)
      .map(s => s.sessionCode);
    
    // Find duplicates
    const duplicates = sessionCodes.filter((code, index) => 
      sessionCodes.indexOf(code) !== index
    );
    
    if (duplicates.length > 0) {
      conflicts.push({
        timeSlot: slot.name,
        duplicateCodes: [...new Set(duplicates)]
      });
    }
  });
  
  return conflicts;
};
