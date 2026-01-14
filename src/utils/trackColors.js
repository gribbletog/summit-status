// Track color mapping with MAXIMUM visual distinction
// Strict limit: Only 2 blues, 1 purple - rest spread across entire spectrum

export const TRACK_COLORS = {
  // REDS
  'Analytics': {
    background: '#DC143C', // Crimson Red
    text: '#ffffff',
    light: '#FFB3C1',
    border: '#A0001C'
  },
  'Workflow and Planning': {
    background: '#C41E3A', // Ruby Red
    text: '#ffffff',
    light: '#F4A1B0',
    border: '#8B1429'
  },
  
  // ORANGES
  'B2B Customer Journeys': {
    background: '#FF6600', // Bright Orange
    text: '#ffffff',
    light: '#FFCC99',
    border: '#CC5200'
  },
  'Strategy Keynote': {
    background: '#FF8C00', // Dark Orange
    text: '#000000',
    light: '#FFD699',
    border: '#CC7000'
  },
  
  // YELLOWS
  'Commerce': {
    background: '#FFD700', // Gold
    text: '#000000',
    light: '#FFF4C4',
    border: '#CCB000'
  },
  
  // LIME/YELLOW-GREEN
  'BV & Content Management in Agentic Web': {
    background: '#9ACD32', // Yellow Green
    text: '#000000',
    light: '#D9F099',
    border: '#739C25'
  },
  'Brand Visibility and Content Management in the Agentic Web': {
    background: '#9ACD32', // Yellow Green (alias)
    text: '#000000',
    light: '#D9F099',
    border: '#739C25'
  },
  
  // GREENS
  'Industry Led': {
    background: '#228B22', // Forest Green
    text: '#ffffff',
    light: '#9FD89F',
    border: '#165016'
  },
  'Industry Session': {
    background: '#228B22', // Forest Green (alias)
    text: '#ffffff',
    light: '#9FD89F',
    border: '#165016'
  },
  'Orchestrating Experiences': {
    background: '#556B2F', // Dark Olive
    text: '#ffffff',
    light: '#B8C99A',
    border: '#3A4A20'
  },
  'Orchestrating Experiences with AI Agents': {
    background: '#556B2F', // Dark Olive (alias)
    text: '#ffffff',
    light: '#B8C99A',
    border: '#3A4A20'
  },
  
  // TEALS/CYAN
  'Customer Data Management & Collaboration': {
    background: '#008B8B', // Dark Cyan
    text: '#ffffff',
    light: '#99CCCC',
    border: '#005F5F'
  },
  'Customer Data Management and Collaboration': {
    background: '#008B8B', // Dark Cyan (alias)
    text: '#ffffff',
    light: '#99CCCC',
    border: '#005F5F'
  },
  'ACS': {
    background: '#20B2AA', // Light Sea Green
    text: '#000000',
    light: '#A3E8E5',
    border: '#178680'
  },
  
  // BLUES (ONLY 2!)
  'Content Supply Chain': {
    background: '#1E90FF', // Dodger Blue
    text: '#ffffff',
    light: '#A8D5FF',
    border: '#0066CC'
  },
  'Content Supply Chain for the AI World': {
    background: '#1E90FF', // Dodger Blue (alias)
    text: '#ffffff',
    light: '#A8D5FF',
    border: '#0066CC'
  },
  'Developers': {
    background: '#0047AB', // Cobalt Blue (very different from Dodger)
    text: '#ffffff',
    light: '#99B8E0',
    border: '#003380'
  },
  
  // PURPLES (ONLY 1!)
  'Customer Engagement': {
    background: '#8B008B', // Dark Magenta
    text: '#ffffff',
    light: '#D99FD9',
    border: '#5C005C'
  },
  
  // INDIGO (between blue and purple)
  'ADLS': {
    background: '#4B0082', // Indigo
    text: '#ffffff',
    light: '#B8A3D4',
    border: '#2E004F'
  },
  'FFE': {
    background: '#663399', // Rebecca Purple (distinct from indigo)
    text: '#ffffff',
    light: '#C4B3D9',
    border: '#4A2673'
  },
  
  // PINKS
  'Sponsors': {
    background: '#FF1493', // Deep Pink
    text: '#ffffff',
    light: '#FFB3E0',
    border: '#CC0070'
  },
  
  // BROWNS
  'AI, Innovation & Leadership': {
    background: '#8B4513', // Saddle Brown
    text: '#ffffff',
    light: '#D4A574',
    border: '#5C2E0A'
  },
  'AI, Innovation, and Leadership Trends': {
    background: '#8B4513', // Saddle Brown (alias)
    text: '#ffffff',
    light: '#D4A574',
    border: '#5C2E0A'
  },
  'UCX': {
    background: '#CD853F', // Peru
    text: '#000000',
    light: '#E8C9A3',
    border: '#A06A2F'
  },
  'Unified Customer Experience': {
    background: '#CD853F', // Peru (alias)
    text: '#000000',
    light: '#E8C9A3',
    border: '#A06A2F'
  },
  
  // GRAYS (ONLY 2!)
  'Enterprise Productivity': {
    background: '#696969', // Dim Gray
    text: '#ffffff',
    light: '#C8C8C8',
    border: '#4A4A4A'
  },
  'Enterprise Productivity for High-Performing Teams': {
    background: '#696969', // Dim Gray (alias)
    text: '#ffffff',
    light: '#C8C8C8',
    border: '#4A4A4A'
  },
  'Skill Exchange': {
    background: '#A9A9A9', // Dark Gray (lighter than Dim Gray)
    text: '#000000',
    light: '#E5E5E5',
    border: '#7A7A7A'
  },
  
  // CORAL/SALMON
  'Community Theater': {
    background: '#FF7F50', // Coral
    text: '#000000',
    light: '#FFD4C4',
    border: '#E65C2F'
  },
  'CP Theater': {
    background: '#FF7F50', // Coral (alias)
    text: '#000000',
    light: '#FFD4C4',
    border: '#E65C2F'
  },
  
  // SPECIAL
  'Keynote': {
    background: '#4B0082', // Indigo (sharing with ADLS as they're related)
    text: '#ffffff',
    light: '#B8A3D4',
    border: '#2E004F'
  },
  'Keynote and Sneaks': {
    background: '#4B0082', // Indigo (alias)
    text: '#ffffff',
    light: '#B8A3D4',
    border: '#2E004F'
  },
  'Sneaks': {
    background: '#FF4500', // Orange Red
    text: '#ffffff',
    light: '#FFB399',
    border: '#CC3600'
  },
  'Pre-conference Training': {
    background: '#D2691E', // Chocolate
    text: '#ffffff',
    light: '#EBC29E',
    border: '#A0511A'
  },
  'B2B Portfolio': {
    background: '#B8860B', // Dark Goldenrod
    text: '#ffffff',
    light: '#EDD88F',
    border: '#8B6508'
  },
  'Summit - other': {
    background: '#BC8F8F', // Rosy Brown
    text: '#000000',
    light: '#E8D6D6',
    border: '#966F6F'
  }
};

/**
 * Get track color for a given track name
 */
export const getTrackColor = (trackName) => {
  if (!trackName) return null;
  
  // Try exact match first
  if (TRACK_COLORS[trackName]) {
    return TRACK_COLORS[trackName];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(TRACK_COLORS)) {
    if (trackName.includes(key) || key.includes(trackName)) {
      return value;
    }
  }
  
  // Default color if no match
  return {
    background: '#667eea',
    text: '#ffffff',
    light: '#e8ecf9',
    border: '#5568d3'
  };
};

/**
 * Get track color for a session based on its data
 */
export const getSessionTrackColor = (session) => {
  if (!session) return null;
  
  const track = session['CFP: INTERNAL TRACK (SUMMIT)'];
  return getTrackColor(track);
};
