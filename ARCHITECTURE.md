# Summit Status Dashboard - Architecture Quick Reference

**🎯 Purpose:** Visual overview for AI assistants and developers to quickly understand the system architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER UPLOADS CSV FILE                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   csvParser.js (utils)                           │
│  • Parses CSV using PapaParse                                    │
│  • Derives DERIVED_SESSION_TYPE from SESSION CODE prefix         │
│  • Extracts unique values for filters                            │
│  • Calculates statistics                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      App.jsx (Main Hub)                          │
│  STATE:                                                          │
│    • rawSessions (original CSV data)                             │
│    • sessions (CSV + WIP merged)                                 │
│    • filters (current filter selections)                         │
│    • view (active view: overview/tracks/sessions/speakers)       │
│    • showWIPData (toggle CSV vs WIP data)                        │
│    • lastUpdated (file modification date)                        │
│                                                                  │
│  RESPONSIBILITIES:                                               │
│    • Merge CSV with WIP overrides from localStorage              │
│    • Apply filters to create filteredSessions                    │
│    • Route between views                                         │
│    • Manage filter overlay state (3 separate overlays)           │
│    • Handle WIP data updates and refresh                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┬────────────────┐
        │                   │                   │                │
        ▼                   ▼                   ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │ TracksView   │  │ SessionList  │  │ SpeakersView │
│  (Overview)  │  │              │  │              │  │              │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ • Stats      │  │ • Track list │  │ • Filter btn │  │ • Table      │
│ • Totals     │  │ • Mini cards │  │ • Session    │  │ • Expandable │
│ • % Complete │  │ • Expandable │  │   cards list │  │   rows       │
│   by Track   │  │ • Filter btn │  │              │  │ • Filter btn │
│              │  │ • WIP toggle │  │              │  │              │
└──────────────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                         │                 │                 │
                         └─────────────────┼─────────────────┘
                                           │
                                           ▼
                                 ┌──────────────────┐
                                 │  SessionCard     │
                                 │  (Shared)        │
                                 ├──────────────────┤
                                 │ • Full details   │
                                 │ • HTML rendering │
                                 │ • WIP indicators │
                                 │ • Badges         │
                                 │ • Speakers       │
                                 └──────────────────┘
```

---

## Data Flow Diagram

```
CSV File
   │
   ▼
parseCSV()
   │
   ├─→ rawSessions (stored)
   │
   ▼
WIP System Check
   │
   ├─→ isWIPSession() → detects placeholder sessions
   │
   ▼
applyWIPOverrides(rawSessions, showWIPData)
   │
   ├─→ Reads from localStorage['summit-wip-overrides']
   ├─→ Merges WIP data if showWIPData === true
   │
   ▼
sessions (final merged data)
   │
   ▼
Filter Application (useEffect in App.jsx)
   │
   ├─→ Apply sessionType filter
   ├─→ Apply published filter
   ├─→ Apply sessionStatus filter
   ├─→ Apply internalTrack filter
   ├─→ Apply product filter
   │
   ▼
filteredSessions
   │
   ├─→ Dashboard (aggregates stats)
   ├─→ TracksView (groups by track)
   ├─→ SessionList (renders cards)
   └─→ SpeakersView (creates speaker rows)
```

---

## Component Hierarchy

```
App
├── Header
│   ├── Title: "Summit 2026 Session Status Dashboard"
│   ├── Updated Badge (clickable → opens SplashScreen)
│   ├── Nav Tabs [Overview | Tracks | Sessions | Speakers]
│   └── Filter Button (conditional: only on Sessions/Speakers/Tracks)
│
├── Filter Overlays (3 separate, slide from right)
│   ├── Sessions Filter Overlay
│   │   └── SessionListFilters component
│   ├── Speakers Filter Overlay
│   │   └── Speakers filter controls
│   └── Tracks Filter Overlay
│       └── Tracks toggles + controls
│
├── View Router (conditional rendering based on `view` state)
│   ├── Dashboard (Overview)
│   │   ├── Totals section (bar chart)
│   │   ├── Session Status (bar chart)
│   │   └── % Complete by Track (expandable accordion)
│   │       └── Clickable session type cards → navigate to filtered Sessions
│   │
│   ├── TracksView
│   │   ├── Filter overlay (separate state)
│   │   └── Track list (expandable)
│   │       └── Session type sections
│   │           └── Mini session cards (4 across)
│   │               └── SessionCard (simplified)
│   │
│   ├── SessionList
│   │   ├── Filter overlay (separate state)
│   │   └── Session cards list
│   │       └── SessionCard (full detail)
│   │
│   └── SpeakersView
│       ├── Filter overlay (separate state)
│       └── Speaker table
│           └── Expandable rows
│               └── SessionCard (full detail, expanded)
│
├── SplashScreen (modal, conditional)
│   └── FileUpload component
│
└── WIPModal (modal, conditional)
    └── Form for editing WIP data
```

---

## State Management Strategy

### Global State (App.jsx)
- **Source of truth** for all session data
- **No Redux/Context** - props passed down directly
- **Filter state** managed at App level
- **View routing** controlled by simple string state

### Component State
- **Local UI state only** (expanded rows, cards)
- **Filter state per view** (SpeakersView, TracksView have their own)
- **No duplication** of session data

### Persistent State (localStorage)
- **WIP overrides only** (`summit-wip-overrides` key)
- **No CSV storage** (uploaded each session)
- **Simple JSON structure** (session code → override data)

---

## Session Type Derivation Logic

**Priority:** SESSION CODE prefix → then CFP: SESSION TYPE override

```javascript
// Code-based detection:
/^S\d+/      → "Session"
/^OS\d+/     → "Online Session"
/^L\d+/      → "Hands-on Lab"
/^CERT\d+/   → "Certification Exam"
/^CP\d+/     → "Community Theater"
/^GS1|GS2$/  → "Keynote"
/^GS3$/      → "Sneaks"
/^SK\d+/     → "Strategy Keynote"
/^TRN\d+/    → "Pre-conference Training"

// Override:
if (session['CFP: SESSION TYPE'].includes('Skill Exchange'))
    → "Skill Exchange"
```

**Categories:**
- **Track Sessions**: Community Theater, Hands-on Labs, Sessions, Online Sessions
- **Summit Sessions**: Skill Exchange, Pre-conference Training, Keynote, Strategy Keynote, Sneaks, Certification Exam, Other

---

## Filter System Architecture

### Filter Button Placement
```
Header (fixed at top)
├── Top Row: Title + Updated Badge
└── Bottom Row: Nav Tabs + [🔻 Filters] button
                            ↑
                    (only on Sessions/Speakers/Tracks views)
```

### Overlay Behavior
1. User clicks **Filters** button in header
2. Appropriate overlay state set to `true`
3. Overlay slides in from right (300ms animation)
4. Backdrop appears with semi-transparent black
5. User interacts with filters → state updates → data re-filters
6. Click backdrop or × → overlay closes

### Filter State Management
```javascript
// App.jsx
const [showFilterOverlay, setShowFilterOverlay] = useState(false)           // Sessions
const [showSpeakersFilterOverlay, setShowSpeakersFilterOverlay] = useState(false)  // Speakers
const [showTracksFilterOverlay, setShowTracksFilterOverlay] = useState(false)      // Tracks

// Each view gets its own overlay state to prevent conflicts
```

---

## WIP System Architecture

### Detection
```javascript
isWIPSession(session) {
    // Check 1: Generic title patterns
    const genericTitles = [/^Developer Lab \d+$/i, /^Session \d+$/i, /^Lab \d+$/i, /^TBD$/i]
    
    // Check 2: "Placeholder" in description
    const hasPlaceholder = session['SESSION ABSTRACT']?.includes('Placeholder')
    
    return match || hasPlaceholder
}
```

### Storage Structure
```json
{
  "L001": {
    "title": "New Lab Title",
    "description": "<p>Real description...</p>",
    "speaker1": "John Doe",
    "speaker1Company": "Adobe",
    "speaker2": "Jane Smith",
    "speaker2Company": "Microsoft"
  }
}
```

### Merge Logic
```javascript
applyWIPOverrides(rawSessions, showWIPData) {
    if (!showWIPData) return rawSessions  // Show CSV only
    
    const overrides = getWIPOverrides()
    
    return rawSessions.map(session => {
        const override = overrides[session['SESSION CODE']]
        if (!override || !isWIPSession(session)) return session
        
        // Merge: WIP data overwrites CSV fields
        return { ...session, ...mappedOverride }
    })
}
```

### UI Indicators
- **Yellow background** on WIP session cards
- **"Add WIP Data"** button (no override exists)
- **"📝 Edit WIP"** button (override exists)
- **Toggle** to switch between CSV and WIP views

---

## Key CSV Columns

### Required for Core Functionality
- `SESSION CODE` - Unique ID (also determines type)
- `SESSION TITLE` - Title
- `SESSION ABSTRACT` - HTML description
- `CFP: INTERNAL TRACK (SUMMIT)` - Track name
- `PUBLISHED` - Yes/No
- `SESSION STATUS` - Accepted/New

### Used for Derivation
- `CFP: SESSION TYPE` - Override for session type
- `CFP: SESSION FORMAT` - Online/In person

### Speaker Information
- `SPEAKER (ASSIGNED TO SESSION TASKS) NAME` - Primary speaker
- `SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY` - Primary company
- `SPEAKER NAME` - Co-presenter
- `SPEAKER COMPANY` - Co-presenter company

### Display Details
- `DATE (FIRST TIME SLOT)` - Session date
- `CAPACITY` - Room capacity
- `TECHNICAL LEVEL` - Difficulty
- `AUDIENCE TYPE` - Comma-separated (becomes bullets)
- `CFP: PRODUCTS` - Associated products
- `TRACK MANAGER NAME` - Manager (format: "Last, First")

---

## Styling Architecture

### CSS Variables (index.css)
```css
:root {
    --primary-color: #5258E4;
    --secondary-color: #7B61FF;
    --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --card-bg: #ffffff;
    --text-color: #000000;
    --text-secondary: #666666;
}
```

### Key Principles
1. ❌ No `!important` declarations (user preference)
2. ✅ No italics anywhere (`font-style: normal` everywhere)
3. ✅ Extra bold labels (`font-weight: 900`)
4. ✅ Black text for readability
5. ✅ Purple gradient background (original theme preserved)

### Shared Styles
- Filter overlays: Defined in `SessionList.css`, used by all views
- Session cards: `SessionCard.css`, rendered in multiple views
- Global resets: `index.css`

---

## Development Workflow

### Adding a New Feature
1. **Identify scope**: Which view(s) affected?
2. **Update state**: Add to App.jsx if needed
3. **Update component**: Modify relevant component
4. **Update CSS**: Add styles (no !important)
5. **Test WIP integration**: Does it work with WIP data?
6. **Test filters**: Does filtering still work?

### Modifying CSV Parsing
1. Edit `src/utils/csvParser.js`
2. Column names are **case-sensitive**
3. Test with real CSV data
4. Check derived fields (especially `DERIVED_SESSION_TYPE`)

### Adding a Filter
1. Add to `filters` state in `App.jsx`
2. Add to `filterOptions` extraction
3. Add UI control to appropriate overlay component
4. Add filter logic in `useEffect` that computes `filteredSessions`
5. Test with various combinations

---

## Common Gotchas & Solutions

### Issue: Filter overlay doesn't show
- **Check**: Is view one of: sessions, speakers, tracks?
- **Check**: Is filter button visible in header?
- **Check**: Is overlay state variable defined in App.jsx?
- **Check**: Are props passed to view component?

### Issue: Session type incorrect
- **Check**: Is SESSION CODE prefix correct?
- **Check**: Is override logic in csvParser.js correct?
- **Check**: Does CSV have "CFP: SESSION TYPE" column?

### Issue: WIP data not showing
- **Check**: Is `showWIPData` true?
- **Check**: Is `isWIPSession()` detecting correctly?
- **Check**: Are overrides in localStorage?
- **Check**: Console: `localStorage.getItem('summit-wip-overrides')`

### Issue: Track names not matching
- **Check**: Trailing spaces! Always `.trim()` track names
- **Fix**: `trackName?.trim()` before comparison

### Issue: Company names duplicated
- **Check**: Using `cleanCompanyName()` helper?
- **Fix**: Split by comma, dedupe with Set, rejoin

### Issue: CSV not loading
- **Check**: Is file in `data/` folder?
- **Check**: Is it gitignored? (It should be)
- **Check**: Console for fetch errors
- **Check**: Splash screen should show if no CSV

---

## File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| App.jsx | ~350 | Main orchestrator |
| csvParser.js | ~200 | CSV parsing + derivation |
| SessionCard.jsx | ~250 | Session display |
| Dashboard.jsx | ~350 | Overview with stats |
| SessionList.jsx | ~200 | Sessions view |
| SpeakersView.jsx | ~270 | Speakers table |
| TracksView.jsx | ~350 | Tracks with mini cards |
| wipStorage.js | ~150 | WIP localStorage utils |

**Total:** ~2,100 lines of JavaScript/JSX (plus CSS)

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# View WIP data in console
localStorage.getItem('summit-wip-overrides')

# Clear WIP data
localStorage.removeItem('summit-wip-overrides')

# Git workflow
git add .
git commit -m "message"
git push origin main
```

---

**Last Updated:** December 2024  
**Repository:** https://github.com/gribbletog/summit-status (private)

