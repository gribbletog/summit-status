import { useState, useEffect } from 'react';
import { parseCSV, getUniqueValues, getStats } from './utils/csvParser';
import { applyWIPOverrides, countWIPOverrides } from './utils/wipStorage';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import SpeakersView from './components/SpeakersView';
import TracksView from './components/TracksView';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [rawSessions, setRawSessions] = useState([]); // CSV data without WIP overrides
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('overview'); // 'overview', 'sessions', 'speakers', or 'tracks'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showWIPData, setShowWIPData] = useState(true);
  const [wipCount, setWipCount] = useState(0);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [filters, setFilters] = useState({
    sessionType: '',
    internalTrack: '',
    published: '',
    sessionStatus: '',
    products: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    sessionTypes: [],
    internalTracks: [],
    sessionStatuses: [],
    products: [],
  });

  const handleFileUpload = async (file) => {
    try {
      const data = await parseCSV(file);
      setRawSessions(data); // Store raw CSV data
      
      // Apply WIP overrides
      const sessionsWithWIP = applyWIPOverrides(data, showWIPData);
      setSessions(sessionsWithWIP);
      setFilteredSessions(sessionsWithWIP);
      setStats(getStats(sessionsWithWIP));
      
      // Update WIP count
      setWipCount(countWIPOverrides());
      
      // Use the file's last modified date
      if (file.lastModified) {
        setLastUpdated(new Date(file.lastModified));
      } else {
        setLastUpdated(new Date());
      }
      
      // Extract unique values for filters
      setFilterOptions({
        sessionTypes: getUniqueValues(sessionsWithWIP, 'DERIVED_SESSION_TYPE'),
        internalTracks: getUniqueValues(sessionsWithWIP, 'CFP: INTERNAL TRACK (SUMMIT)'),
        sessionStatuses: getUniqueValues(sessionsWithWIP, 'SESSION STATUS'),
        products: getUniqueValues(sessionsWithWIP, 'CFP: PRODUCTS'),
      });
      
      // Close splash screen after successful upload
      setShowSplashScreen(false);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the file format.');
    }
  };

  const formatUpdateDate = (date) => {
    if (!date) return '';
    
    // Format as "Sunday, Dec 14"
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...sessions];

    if (filters.sessionType) {
      filtered = filtered.filter(
        session => session['DERIVED_SESSION_TYPE'] === filters.sessionType
      );
    }

    if (filters.internalTrack) {
      filtered = filtered.filter(
        session => session['CFP: INTERNAL TRACK (SUMMIT)'] === filters.internalTrack
      );
    }

    if (filters.published) {
      filtered = filtered.filter(
        session => session['PUBLISHED']?.toLowerCase() === filters.published.toLowerCase()
      );
    }

    if (filters.sessionStatus) {
      filtered = filtered.filter(
        session => session['SESSION STATUS'] === filters.sessionStatus
      );
    }

    if (filters.products) {
      filtered = filtered.filter(
        session => session['CFP: PRODUCTS'] === filters.products
      );
    }

    setFilteredSessions(filtered);
  }, [filters, sessions]);

  const handleFilterChange = (filterName, value) => {
    // Auto-set Internal Track based on Session Type
    if (filterName === 'sessionType') {
      if (value === 'Skill Exchange') {
        setFilters(prev => ({
          ...prev,
          sessionType: value,
          internalTrack: 'Skill Exchange',
        }));
        return;
      } else if (value === 'Pre-conference Training') {
        setFilters(prev => ({
          ...prev,
          sessionType: value,
          internalTrack: 'ADLS',
        }));
        return;
      }
    }
    
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      sessionType: '',
      internalTrack: '',
      published: '',
      sessionStatus: '',
      products: '',
    });
  };

  const handleWIPDataToggle = () => {
    setShowWIPData(!showWIPData);
  };

  const refreshWIPData = () => {
    // Re-apply WIP overrides to raw sessions
    const sessionsWithWIP = applyWIPOverrides(rawSessions, showWIPData);
    setSessions(sessionsWithWIP);
    setFilteredSessions(sessionsWithWIP);
    setStats(getStats(sessionsWithWIP));
    setWipCount(countWIPOverrides());
  };

  // Re-apply WIP overrides when toggle changes
  useEffect(() => {
    if (rawSessions.length > 0) {
      refreshWIPData();
    }
  }, [showWIPData]);

  // Load CSV from data folder on mount
  useEffect(() => {
    console.log('🔍 Attempting to fetch CSV...');
    fetch('/data/Summit 2025 Session Details Report.csv', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(response => {
        console.log('📡 Fetch response:', response.status, response.ok);
        const contentType = response.headers.get('content-type');
        console.log('📋 Content-Type:', contentType);
        
        // Check if we got HTML instead of CSV (means file doesn't exist)
        if (!response.ok || contentType?.includes('text/html')) {
          throw new Error('CSV not found');
        }
        
        // Get the Last-Modified header if available
        const lastModified = response.headers.get('Last-Modified');
        const fileDate = lastModified ? new Date(lastModified).getTime() : Date.now();
        
        return response.text().then(csvText => ({ csvText, fileDate }));
      })
      .then(({ csvText, fileDate }) => {
        console.log('✅ CSV loaded successfully');
        const file = new File([csvText], 'Summit 2025 Session Details Report.csv', { 
          type: 'text/csv',
          lastModified: fileDate
        });
        handleFileUpload(file);
      })
      .catch(error => {
        console.log('❌ CSV fetch failed:', error.message);
        // Keep splash screen open if no CSV found
        setShowSplashScreen(true);
      });
  }, []);

  return (
    <div className="app">
      {showSplashScreen && (
        <SplashScreen 
          onFileUpload={handleFileUpload}
          onClose={() => setShowSplashScreen(false)}
          showCloseButton={sessions.length > 0}
        />
      )}

      <header className="app-header">
        <div className="header-content">
          <h1>Summit 2026 Session Status Dashboard</h1>
          {lastUpdated && (
            <div className="header-updated">
              <span className="updated-label">Updated:</span>
              <button 
                className="updated-badge"
                onClick={() => setShowSplashScreen(true)}
                title="Click to upload new CSV"
              >
                {formatUpdateDate(lastUpdated)}
              </button>
            </div>
          )}
        </div>
        <div className="header-bottom">
          <nav className="nav-tabs">
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button
            className={view === 'tracks' ? 'active' : ''}
            onClick={() => setView('tracks')}
          >
            Tracks
          </button>
          <button
            className={view === 'sessions' ? 'active' : ''}
            onClick={() => setView('sessions')}
          >
            Sessions
          </button>
          <button
            className={view === 'speakers' ? 'active' : ''}
            onClick={() => setView('speakers')}
          >
            Speakers
          </button>
        </nav>
        {view === 'sessions' && (
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilterOverlay(!showFilterOverlay)}
            title="Toggle filters"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4h14M6 8h8M8 12h4M9 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Filters
          </button>
        )}
        </div>
      </header>

      <main className="app-main">
        {view === 'overview' && stats && (
          <Dashboard 
            stats={stats} 
            totalSessions={sessions.length} 
            allSessions={sessions}
            onNavigateToSessions={(track, sessionType) => {
              setView('sessions');
              handleFilterChange('internalTrack', track);
              handleFilterChange('sessionType', sessionType);
            }}
          />
        )}

        {view === 'sessions' && (
          <SessionList
            sessions={filteredSessions}
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            showWIPData={showWIPData}
            wipCount={wipCount}
            onToggleWIP={handleWIPDataToggle}
            onWIPUpdate={refreshWIPData}
            showFilterOverlay={showFilterOverlay}
            onCloseFilterOverlay={() => setShowFilterOverlay(false)}
          />
        )}

        {view === 'speakers' && (
          <SpeakersView sessions={sessions} />
        )}

        {view === 'tracks' && (
          <TracksView 
            sessions={sessions}
            showWIPData={showWIPData}
            wipCount={wipCount}
            onToggleWIP={handleWIPDataToggle}
            onWIPUpdate={refreshWIPData}
          />
        )}
      </main>
    </div>
  );
}

export default App;

