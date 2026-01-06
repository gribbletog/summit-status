// TA (Teaching Assistant) CSV Parser

import Papa from 'papaparse';

/**
 * Parse TA CSV file
 * @param {string} csvString - Raw CSV content
 * @returns {Array} Array of TA objects
 */
export const parseTACSV = (csvString) => {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    console.error('TA CSV Parse Errors:', result.errors);
    throw new Error('Failed to parse TA CSV file');
  }

  // Parse and clean TA data
  const tas = result.data
    .filter(row => {
      // Filter out empty rows and header rows (where track has numbers like "Analytics (4)")
      const hasName = row['First Name']?.trim() || row['Last Name']?.trim();
      const hasLabs = row['Labs #s (EX: L129)']?.trim();
      return hasName || hasLabs;
    })
    .map(row => {
      // Parse lab numbers from comma-separated string
      const labsString = row['Labs #s (EX: L129)'] || '';
      const labs = labsString
        .split(',')
        .map(lab => lab.trim())
        .filter(lab => lab.match(/^L\d+$/i)) // Only valid lab codes (L###)
        .map(lab => lab.toUpperCase());

      // Parse confirmed status (default to false if not present or not "yes")
      const confirmedValue = row['Confirmed']?.trim().toLowerCase();
      const isConfirmed = confirmedValue === 'yes' || confirmedValue === 'y' || confirmedValue === 'true';

      return {
        track: row['Track']?.trim() || '',
        firstName: row['First Name']?.trim() || '',
        lastName: row['Last Name']?.trim() || '',
        eteam: row['Eteam (Anil or other)']?.trim() || '',
        svp: row['SVP (below Anil)']?.trim() || '',
        labs: labs, // Array of lab codes
        nominatedBy: row['Nominated by: \n(EX: Instructor, TM)']?.trim() || '',
        notes: row['Notes']?.trim() || '',
        confirmed: isConfirmed,
        fullName: [row['First Name']?.trim(), row['Last Name']?.trim()]
          .filter(n => n)
          .join(' ') || 'Unknown'
      };
    })
    .filter(ta => ta.labs.length > 0); // Only include TAs with lab assignments

  return tas;
};

/**
 * Create mapping from Lab Code to array of TAs
 * @param {Array} taData - Array of TA objects from parseTACSV
 * @returns {Object} Object with lab codes as keys, arrays of TAs as values
 */
export const createLabToTAMapping = (taData) => {
  const mapping = {};

  taData.forEach(ta => {
    ta.labs.forEach(labCode => {
      if (!mapping[labCode]) {
        mapping[labCode] = [];
      }
      mapping[labCode].push(ta);
    });
  });

  return mapping;
};

/**
 * Get statistics about TA assignments
 * @param {Array} taData - Array of TA objects
 * @param {Object} labToTAs - Lab to TA mapping
 * @returns {Object} Statistics object
 */
export const getTAStats = (taData, labToTAs) => {
  const totalTAs = taData.length;
  const totalLabs = Object.keys(labToTAs).length;
  const totalAssignments = taData.reduce((sum, ta) => sum + ta.labs.length, 0);
  
  // Find TAs supporting multiple labs (MVPs)
  const mvpTAs = taData
    .filter(ta => ta.labs.length >= 3)
    .sort((a, b) => b.labs.length - a.labs.length);

  // Find understaffed labs (< 3 TAs)
  const understaffedLabs = Object.entries(labToTAs)
    .filter(([_, tas]) => tas.length < 3)
    .map(([labCode, tas]) => ({ labCode, taCount: tas.length }));

  // Find well-staffed labs (5+ TAs)
  const wellStaffedLabs = Object.entries(labToTAs)
    .filter(([_, tas]) => tas.length >= 5)
    .map(([labCode, tas]) => ({ labCode, taCount: tas.length }));

  return {
    totalTAs,
    totalLabs,
    totalAssignments,
    avgTAsPerLab: totalLabs > 0 ? (totalAssignments / totalLabs).toFixed(1) : 0,
    mvpTAs, // TAs supporting 3+ labs
    understaffedLabs, // < 3 TAs
    wellStaffedLabs, // 5+ TAs
  };
};

/**
 * Enrich lab session data with TA assignments
 * @param {Object} labSession - Lab session from main CSV
 * @param {Object} labToTAs - Lab to TA mapping
 * @returns {Object} Enriched lab object
 */
export const enrichLabWithTAs = (labSession, labToTAs) => {
  const labCode = labSession['SESSION CODE'];
  const tas = labToTAs[labCode] || [];
  
  // Calculate staffing metrics
  const taCount = tas.length;
  const minTarget = 3;
  const maxTarget = 5;
  const staffingPercent = Math.min((taCount / minTarget) * 100, 100);
  
  // Staffing status
  let staffingStatus = 'critical'; // 0-2 TAs
  if (taCount >= 5) staffingStatus = 'excellent';
  else if (taCount >= 3) staffingStatus = 'good';
  
  return {
    ...labSession,
    labCode,
    tas,
    taCount,
    minTarget,
    maxTarget,
    staffingPercent,
    staffingStatus,
    needsMore: taCount < maxTarget,
    isCritical: taCount < minTarget,
  };
};

