import { useState, useEffect } from 'react';
import { parseCSV, getUniqueValues, getStats } from './utils/csvParser';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import SpeakersView from './components/SpeakersView';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('overview'); // 'overview', 'sessions', or 'speakers'
  const [lastUpdated, setLastUpdated] = useState(null);
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
      setSessions(data);
      setFilteredSessions(data);
      setStats(getStats(data));
      
      // Use the file's last modified date
      if (file.lastModified) {
        setLastUpdated(new Date(file.lastModified));
      } else {
        setLastUpdated(new Date());
      }
      
      // Extract unique values for filters
      setFilterOptions({
        sessionTypes: getUniqueValues(data, 'DERIVED_SESSION_TYPE'),
        internalTracks: getUniqueValues(data, 'CFP: INTERNAL TRACK (SUMMIT)'),
        sessionStatuses: getUniqueValues(data, 'SESSION STATUS'),
        products: getUniqueValues(data, 'CFP: PRODUCTS'),
      });
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

  // Load CSV from data folder on mount
  useEffect(() => {
    fetch('/data/Summit 2025 Session Details Report.csv')
      .then(response => {
        // Get the Last-Modified header if available
        const lastModified = response.headers.get('Last-Modified');
        const fileDate = lastModified ? new Date(lastModified).getTime() : Date.now();
        
        return response.text().then(csvText => ({ csvText, fileDate }));
      })
      .then(({ csvText, fileDate }) => {
        const file = new File([csvText], 'Summit 2025 Session Details Report.csv', { 
          type: 'text/csv',
          lastModified: fileDate
        });
        handleFileUpload(file);
      })
      .catch(error => {
        console.log('No default CSV found, waiting for file upload');
      });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Summit 2026 Session Status Dashboard</h1>
          {lastUpdated && (
            <div className="header-updated">
              <span className="updated-label">Updated:</span>
              <span className="updated-badge">{formatUpdateDate(lastUpdated)}</span>
            </div>
          )}
        </div>
        <nav className="nav-tabs">
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => setView('overview')}
          >
            Overview
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
      </header>

      <main className="app-main">
        {sessions.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <>
            <div className="file-reload">
              <FileUpload onFileUpload={handleFileUpload} compact />
            </div>

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
              />
            )}

            {view === 'speakers' && (
              <SpeakersView sessions={sessions} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;

