import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Process data to create derived session types based on SESSION CODE
        const processedData = results.data.map(session => {
          const sessionCode = session['SESSION CODE'] || '';
          const cfpSessionType = session['CFP: SESSION TYPE'] || '';
          let derivedType = 'Other';
          
          // Parse session type from SESSION CODE prefix
          if (sessionCode.startsWith('OS')) {
            derivedType = 'Online Session';
          } else if (sessionCode.startsWith('S')) {
            derivedType = 'Session';
          } else if (sessionCode.startsWith('L')) {
            derivedType = 'Hands-on Lab';
          } else if (sessionCode.startsWith('CERT')) {
            derivedType = 'Certification Exam';
          } else if (sessionCode.startsWith('CP')) {
            derivedType = 'Community Theater';
          } else if (sessionCode === 'GS1' || sessionCode === 'GS2') {
            derivedType = 'Keynote';
          } else if (sessionCode === 'GS3') {
            derivedType = 'Sneaks';
          } else if (sessionCode.startsWith('SK')) {
            derivedType = 'Strategy Keynote';
          } else if (sessionCode.startsWith('TRN')) {
            derivedType = 'Pre-conference Training';
          }
          
          // Check if this is a Skill Exchange (can be S or OS with "Skill Exchange" in the type)
          if (cfpSessionType.includes('Skill Exchange')) {
            derivedType = 'Skill Exchange';
          }
          
          session['DERIVED_SESSION_TYPE'] = derivedType;
          
          return session;
        });
        
        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const getUniqueValues = (data, field) => {
  const values = data
    .map(row => row[field])
    .filter(value => value && value.trim() !== '');
  return [...new Set(values)].sort();
};

export const getStats = (data) => {
  const totalSessions = data.length;
  
  const statusCounts = data.reduce((acc, row) => {
    const status = row['SESSION STATUS'] || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const publishedCount = data.filter(row => 
    row['PUBLISHED'] && row['PUBLISHED'].toLowerCase() === 'yes'
  ).length;

  const unpublishedCount = totalSessions - publishedCount;

  return {
    totalSessions,
    publishedCount,
    unpublishedCount,
    statusCounts,
  };
};

