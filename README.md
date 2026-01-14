# Summit 2026 Session Status Dashboard

A React-based web application for visualizing and managing Adobe Summit 2026 session data. This tool provides multiple views for analyzing session status, speaker information, track completion, and includes Work-in-Progress (WIP) data management capabilities.

## 📚 Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical architecture and design patterns
- **[Scheduling Grid Guide](docs/SCHEDULING_GRID_GUIDE.md)** - User guide for the Scheduling Grid feature
- **[TA View Plan](docs/TA_VIEW_PLAN.md)** - Teaching Assistant view documentation

---

## Table of Contents

1. [Quick Reference for AI Assistants](#quick-reference-for-ai-assistants)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Key Features](#key-features)
5. [Application Structure](#application-structure)
6. [Data Model](#data-model)
7. [Component Details](#component-details)
8. [State Management](#state-management)
9. [Styling Architecture](#styling-architecture)
10. [WIP (Work-in-Progress) System](#wip-work-in-progress-system)
11. [Filter System](#filter-system)
12. [Scheduling Grid Feature](#scheduling-grid-feature)
13. [Development Guide](#development-guide)

---

## Quick Reference for AI Assistants

**👋 New Cursor chat? Read this first!**

### What This App Does
Visualizes Adobe Summit session data from CSV exports. Six views: Overview (stats), Tracks (by track manager), Sessions (detailed cards), Speakers (table), Products (labs by product), and **Scheduling Grid** (visual schedule with time slots and venues). Includes Work-in-Progress (WIP) system for enriching placeholder sessions.

### Tech Stack
React 18 + Vite + localStorage + PapaParse. No backend, no state library. Single-user browser app.

### Key Architecture Points

1. **Data Flow**: CSV → `csvParser.js` → `App.jsx` (state) → View components
2. **Session Types**: Derived from SESSION CODE prefix (S###→Session, L###→Lab, etc.)
3. **WIP System**: Three-state system (Add/Edit/Toggle), stores enabled state in localStorage
4. **Filters**: Header-triggered overlays (slide from right), separate state per view
5. **Tracks View**: Section filters (show/hide session types), products display in cards
6. **Styling**: CSS variables in `index.css`, no preprocessor, purple gradient theme

### File Organization
- `App.jsx`: Main orchestrator (state, routing, data)
- `src/components/`: View components (Dashboard, SessionList, SessionCard, SpeakersView, TracksView, ProductsView, SchedulingGrid, TAView)
- `src/utils/csvParser.js`: CSV parsing + session type derivation
- `src/utils/scheduleParser.js`: Scheduling grid CSV parsing
- `src/utils/trackColors.js`: Track color mapping (24 distinct colors)
- `src/utils/wipStorage.js`: localStorage WIP management
- `src/utils/productsList.js`: Master product list for coverage tracking
- `src/utils/taParser.js`: TA (Teaching Assistant) data parsing

### Common Gotchas
- CSV column names are **case-sensitive** and **include spaces**
- `DERIVED_SESSION_TYPE` is computed, not in CSV
- Track names may have trailing spaces (must `.trim()`)
- Company names can be duplicated (e.g., "Adobe, Adobe") - must deduplicate
- Filter overlays share CSS from `SessionList.css`
- Date in header comes from file modification time, not current date

### Making Changes
- **Add filter**: Update `App.jsx` filters state + filter options + useEffect logic
- **Add view**: Create component + add to `App.jsx` nav tabs + routing
- **Modify session display**: Edit `SessionCard.jsx` (used in all views)
- **Change CSV parsing**: Update `src/utils/csvParser.js`

### Current State
- 6 views working with filter overlays
- WIP system fully functional (three-state: add/edit/toggle per session, localStorage persistence)
- Tracks view with section filters (show/hide session types)
- Products view showing labs grouped by product with coverage gap analysis
- **Scheduling Grid view** with visual schedule, track colors, day/type filters, and slide-in detail panel
- TA view for managing Teaching Assistant assignments
- Products display in session cards, track cards, and products view
- Individual WIP toggle per session (view WIP or CSV data)
- Filter button in header (bottom-right, only on Sessions/Speakers/Tracks/Products views)
- Tab order: Overview → Tracks → Sessions → Speakers → Products → TA → **Scheduling Grid**

---

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Loading Data

On first launch, you'll see a splash screen. Upload your CSV file exported from the track manager portal (View Session Details > Actions > Download as CSV). The CSV file is gitignored for privacy.

To reload data later, click the **Updated: [Date]** badge in the header.

---

## Architecture Overview

### Technology Stack

- **Framework**: React 18+ (Functional components with Hooks)
- **Build Tool**: Vite (fast dev server, hot module replacement)
- **CSV Parsing**: PapaParse library
- **State Management**: React useState/useMemo/useEffect (no external state library)
- **Storage**: Browser localStorage (for WIP data persistence)
- **Styling**: Plain CSS with CSS variables (no preprocessor)
- **Version Control**: Git/GitHub (private repository)

### Design Principles

1. **Component-based architecture**: Each view is a self-contained component
2. **Single source of truth**: CSV data is parsed once, transformed, and passed down
3. **Derived data**: Session types and statistics are computed from raw CSV data
4. **Progressive enhancement**: WIP system layers on top of CSV data without modifying it
5. **Filter isolation**: Each view has its own filter overlay with relevant options
6. **Responsive**: Works on desktop (primary target) and adapts to smaller screens

---

## Key Features

### 1. Overview Dashboard
- **Totals Section**: Total sessions with session status breakdown (bar chart style)
- **Session Status**: Published vs Unpublished with percentages
- **% Complete by Track**: 
  - Expandable accordion showing all internal tracks
  - Progress bars (red 0-33%, yellow 33-66%, green 66-100%)
  - Track manager names displayed
  - Breakdown by session type (CP, Session, Online Session, Hands-on Lab)
  - Clickable session types → navigate to filtered Sessions view

### 2. Tracks View
- List of all internal tracks (alphabetically sorted) with:
  - Track manager name (in grey text)
  - Session counts by type (e.g., "S 2/4" = 2 published out of 4 total)
  - Completion percentage with color-coded progress bar
- **Expandable tracks**: Click track to expand and show session cards by type
- **Session Cards**: Mini cards (4 across) with title, description, products, speakers
  - Two-column layout: Products (left) and Speakers (right)
  - "More..." button for long content
  - Yellow background for WIP sessions (gray when WIP disabled)
  - "Add WIP Data" / "Edit WIP" / "Toggle WIP" buttons inline
- **Filter Overlay** (triggered from header button):
  - Show main in-person tracks only (checkbox - excludes Keynotes, Sneaks, CP Theater, Sponsors, Summit-other, Industry Session, ACS, Skill Exchange, ADLS)
  - Show WIP Data (checkbox, only if WIP overrides exist)
  - **Section Filters**: Show/hide specific session types:
    - Community Theater
    - Sessions
    - Online Sessions
    - Hands-on Labs
  - Expand All / Collapse All (button)

### 3. Sessions View
- Full session cards with detailed information
- Session type badges (Published, New/Accepted, Online)
- Track tabs (black) and Session Code tabs (blue) above cards
- Formatted dates: "Sunday, April 19"
- HTML rendering in descriptions (with bullet list formatting)
- Speaker and Co-presenter with company names
- WIP indicators: Yellow borders, "Add WIP Data" / "Edit WIP" buttons
- **Filter Overlay** (triggered from header button):
  - Session Type (radio buttons in 2 groups: Track/Summit)
  - Published status (radio: All/Published/Unpublished)
  - Session Status (radio: All/Accepted/New)
  - Internal Track (dropdown)
  - Products (dropdown)
  - WIP Data toggle (checkbox, only if WIP overrides exist)

### 4. Speakers View
- Spreadsheet-style table with columns:
  - Speaker, Co-speaker, ID (Session Code), Track (Internal Track), Type, Published
- **Expandable rows**: Click caret to show full session card
- One row per session (assigned speaker + co-presenter)
- **Filter Overlay** (triggered from header button):
  - Session Type (radio: All + dynamic list)
  - Speaker Company (dropdown: All Companies + deduplicated list)
  - Track (dropdown: All Tracks + Internal Track list)

### 5. Products View
- List of all products (alphabetically sorted) showing associated Hands-on Labs
- **Expandable products**: Click product to expand and show lab cards
- **Lab Cards**: Mini cards (4 across) with:
  - Session title, code, and track
  - Description with "More..." button for long content
  - All products used in the lab (if multiple)
  - Speakers and their companies
  - Yellow background for WIP sessions (gray when WIP disabled)
  - "Add WIP Data" / "Edit WIP" / "Toggle WIP" buttons inline
- **Products Without Labs Section**: 
  - Shows all products from master list that don't have associated labs
  - Helps identify coverage gaps in lab offerings
  - Excludes umbrella products (Experience Cloud, Creative Cloud, Experience Manager, GenAI, etc.)
- **Filter Overlay** (triggered from header button):
  - Show WIP Data (checkbox, only if WIP overrides exist)
  - Expand All / Collapse All (button)

### 6. WIP (Work-in-Progress) Management
- Detect WIP sessions (generic titles like "Developer Lab 1" or "Placeholder" descriptions)
- **Three-state system** for each session:
  - **Add WIP**: Create new WIP override for placeholder sessions
  - **Edit WIP**: Modify existing WIP data
  - **Toggle WIP**: Enable/disable WIP display per session (👁️ WIP / 👁️ CSV buttons)
- Store overrides in browser localStorage with enabled/disabled state
- Global toggle between CSV and WIP data (header filter overlay)
- Individual session toggle to temporarily view CSV data while keeping WIP stored
- Visual indicators:
  - Active WIP: Yellow background, 📝 badge
  - Disabled WIP: Gray background, 📝❌ badge
- WIP overrides persist until real data comes in future CSV

### 7. Scheduling Grid View
- **Visual schedule display**: Grid showing sessions/labs by venue and time slot
- **Track-based color coding**: 24 distinct colors for instant track identification
  - Limited palette: Only 2 blues, 1 purple for maximum distinction
  - Colors span entire spectrum: reds, oranges, yellows, greens, teals, blues, purples, pinks, browns, grays
  - Each session cell has light background + thick left border in track color
- **Interactive cells**: Click any session to view details in slide-in panel
- **Full title display**: Session codes + complete titles from main CSV
- **Filtering controls**:
  - **Day View**: Everything All at Once, Monday, Tuesday, Wednesday
  - **Type Filter**: All, Sessions, Labs (determined by session code prefix)
  - **Track Color Legend**: Collapsible legend showing all track colors
- **Detail panel** (slides in from left as overlay):
  - Session title with track badge
  - **Collapsible description** (closed by default, HTML-rendered)
  - Scheduling info (code, day, time, venue, capacity)
  - Session metadata (type, status, published)
  - Speakers and products as badges
  - Link to session catalog
- **Grid remains visible** underneath panel for comparing concurrent sessions
- **Special cell states**: OPEN (gray), TBD (yellow), HOLD (orange), REPEAT, Do Not Schedule (red)
- **Sticky headers**: Venue column and time slot row stay visible while scrolling
- **Conflict detection**: Easy to spot scheduling conflicts at a glance
- **CSV upload**: Separate upload button for scheduling grid CSV file

### 8. Filter System
- **Unified header button**: Filter icon button appears in header (bottom-right, aligned with nav tabs)
- Filter overlays slide in from right side when button clicked
- Backdrop closes overlay when clicked outside
- Each view (Sessions, Speakers, Tracks, Products) has its own overlay with relevant filters
- **Auto-selection**: Choosing "Skill Exchange" type → auto-sets track to "Skill Exchange"
- **Auto-selection**: Choosing "Pre-conference Training" → auto-sets track to "ADLS"

---

## Application Structure

```
summit-status/
├── public/                          # Static assets (favicon, etc.)
├── data/                            # CSV data directory
│   ├── .gitkeep                     # Keeps folder in git
│   └── Summit 2025 Session Details Report.csv  # ← Gitignored
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx            # Overview view with stats
│   │   ├── Dashboard.css
│   │   ├── SessionList.jsx          # Sessions view (list of cards)
│   │   ├── SessionList.css
│   │   ├── SessionCard.jsx          # Individual session card
│   │   ├── SessionCard.css
│   │   ├── SpeakersView.jsx         # Speakers table view
│   │   ├── SpeakersView.css
│   │   ├── TracksView.jsx           # Tracks view with mini cards
│   │   ├── TracksView.css
│   │   ├── ProductsView.jsx         # Products view showing labs by product
│   │   ├── ProductsView.css
│   │   ├── FileUpload.jsx           # CSV file upload component
│   │   ├── FileUpload.css
│   │   ├── SplashScreen.jsx         # Initial welcome/upload modal
│   │   ├── SplashScreen.css
│   │   ├── WIPModal.jsx             # WIP data editing modal
│   │   └── WIPModal.css
│   ├── utils/
│   │   ├── csvParser.js             # CSV parsing and data transformation
│   │   ├── wipStorage.js            # localStorage WIP data management
│   │   └── productsList.js          # Master product list for coverage tracking
│   ├── App.jsx                      # Main app component (routing, state)
│   ├── App.css                      # Main app styles (header, nav)
│   ├── index.css                    # Global styles (CSS variables, resets)
│   ├── main.jsx                     # React entry point
│   └── assets/                      # Images, icons
├── .gitignore                       # Git ignore rules (includes CSV file)
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
└── README.md                        # This file
```

---

## Data Model

### CSV Column Structure (Key Fields)

The application expects a CSV with these columns (exact names required):

**Session Information:**
- `SESSION CODE` - Unique identifier (e.g., "S001", "L042", "GS1")
- `SESSION TITLE` - Session title
- `SESSION ABSTRACT` - HTML description (may contain `<p>`, `<ul>`, `<li>` tags)
- `CFP: SESSION TYPE` - Original session type from submission
- `DERIVED_SESSION_TYPE` - ⚠️ **Computed field** (added by parser, not in CSV)

**Categorization:**
- `CFP: INTERNAL TRACK (SUMMIT)` - Internal track name (e.g., "Analytics", "Developers")
- `CFP: PUBLIC TRACK (SUMMIT)` - Public-facing track name
- `TRACK MANAGER NAME` - Track manager (format: "Last, First")
- `CFP: SESSION FORMAT` - Format (e.g., "Online", "In person")

**Status:**
- `PUBLISHED` - "Yes" or "No"
- `SESSION STATUS` - "Accepted" or "New"

**Speakers:**
- `SPEAKER (ASSIGNED TO SESSION TASKS) NAME` - Primary speaker (last, first)
- `SPEAKER (ASSIGNED TO SESSION TASKS) COMPANY` - Primary speaker company
- `SPEAKER NAME` - Co-presenter (last, first)
- `SPEAKER COMPANY` - Co-presenter company

**Scheduling:**
- `DATE (FIRST TIME SLOT)` - Session date (MM/DD/YYYY format)
- `TIME (FIRST TIME SLOT)` - Session time

**Additional:**
- `CAPACITY` - Room capacity
- `TECHNICAL LEVEL` - Difficulty level
- `AUDIENCE TYPE` - Comma-separated audience types
- `CFP: PRODUCTS` - Associated products

### Session Type Derivation Logic

Session types are **derived from SESSION CODE prefix** (implemented in `src/utils/csvParser.js`):

```javascript
// Prefix patterns:
S###     → "Session"
OS###    → "Online Session"
L###     → "Hands-on Lab"
CERT#    → "Certification Exam"
CP##     → "Community Theater"
GS1, GS2 → "Keynote"
GS3      → "Sneaks"
SK#      → "Strategy Keynote"
TRN##    → "Pre-conference Training"

// Special override:
If CFP: SESSION TYPE contains "Skill Exchange" → "Skill Exchange"
```

### Session Type Categories

**Track Sessions:**
- Community Theater
- Hands-on Labs
- Sessions
- Online Sessions

**Summit Sessions:**
- Skill Exchange
- Pre-conference Training
- Keynote
- Strategy Keynote
- Sneaks
- Certification Exam
- Other

---

## Component Details

### App.jsx (Main Container)

**Responsibilities:**
- CSV file loading and parsing (initial fetch + file upload)
- Global state management (sessions, filters, view state)
- View routing (Overview, Tracks, Sessions, Speakers)
- Filter overlay coordination
- WIP data integration

**Key State Variables:**
```javascript
sessions          // Merged CSV + WIP data
rawSessions       // Original CSV data (before WIP)
filteredSessions  // Sessions after applying filters
stats             // Calculated statistics
view              // Current active view
lastUpdated       // CSV file modification date
filters           // Current filter selections
showSplashScreen  // Show/hide upload modal
showWIPData       // Toggle between CSV and WIP data
wipCount          // Number of active WIP overrides
showFilterOverlay // Filter overlay state per view
```

**Header Structure:**
```
┌─────────────────────────────────────────────────┐
│ Title                        Updated: [Date]     │  ← Top row (clickable date badge)
│ Overview | Tracks | Sessions | Speakers [Filter] │  ← Bottom row (nav + filter button)
└─────────────────────────────────────────────────┘
```

**Note:** The filter button only appears when on Sessions, Speakers, Tracks, or Products views (not on Overview).

---

### Dashboard.jsx (Overview View)

**Data Aggregation:**
- Calculates total/published/unpublished counts
- Groups sessions by internal track
- Computes completion percentages per track
- Finds most common track manager per track

**UI Components:**
1. **Totals Section**: Bar chart showing session status
2. **Session Status**: Published/Unpublished with percentages
3. **% Complete by Track**: Expandable accordion
   - Each track shows progress bar
   - Expanded view shows session type breakdown
   - Clickable session types navigate to filtered Sessions view

**Key Functions:**
- `calculateTrackData()` - Aggregates session data by track and type
- `getMostCommonTrackManager()` - Finds most frequent track manager
- `handleNavigateToSessions()` - Navigates with pre-applied filters

---

### SessionList.jsx (Sessions View)

**Responsibilities:**
- Renders list of SessionCard components
- Receives filtered sessions from App.jsx
- No local filter state (all managed by App)

**Filter Component:**
- `SessionListFilters` - Separate component with all filter controls
- Rendered inside filter overlay in `App.jsx` (not in SessionList itself)
- Overlay triggered by header filter button
- Includes WIP toggle if WIP overrides exist

**WIP Integration:**
- Passes `showWIPData`, `onToggleWIPData`, `wipCount` props
- Passes `onEditWIP` handler to SessionCard for WIP editing

---

### SessionCard.jsx (Individual Session)

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Internal Track Tab] [Code Tab]         │  ← Above card
┌─────────────────────────────────────────┐
│ Session Title  [Published] [New] [Online]│
│ Description with HTML rendering          │
│ • Bullet points properly indented        │
│                                          │
│ [Grid of details:]                       │
│ CAPACITY: 50      DATE: Sunday, April 19 │
│ TECHNICAL LEVEL: Intermediate            │
│                                          │
│ Speaker                                  │
│ John Doe                                 │
│ Adobe                                    │
│                                          │
│ Co-presenter                             │
│ Jane Smith                               │
│ Microsoft                                │
└─────────────────────────────────────────┘
```

**Key Functions:**
- `renderHTML()` - Safely renders HTML in description
- `parseAudienceType()` - Converts comma-separated list to bullets
- `formatDate()` - Formats date as "Day, Month Day"
- `cleanCompanyName()` - Deduplicates company names

**WIP Indicators:**
- Yellow border/background for WIP sessions
- "Add WIP Data" or "📝 Edit WIP" button inline with badges

---

### SpeakersView.jsx (Speakers Table)

**Data Structure:**
```javascript
speakerRows = [
  {
    rowId: "S001",
    speaker: "Doe, John",
    speakerCompany: "Adobe",
    coSpeaker: "Smith, Jane",
    coSpeakerCompany: "Microsoft",
    sessionCode: "S001",
    track: "Analytics",
    sessionType: "Session",
    published: "Yes",
    session: { /* full session object */ }
  }
]
```

**Features:**
- Expandable rows (caret icon to expand/collapse)
- Expanded row shows full SessionCard below
- Filter overlay (triggered from header) with Session Type, Speaker Company, Track
- Company deduplication (e.g., "Adobe, Adobe" → "Adobe")
- Filters both assigned speaker and co-speaker companies

**Props:**
- `sessions` - Full session array
- `showFilterOverlay` - Boolean to show/hide filter panel
- `onCloseFilterOverlay` - Callback to close filter panel

---

### TracksView.jsx (Tracks View)

**Data Aggregation:**
- Groups sessions by internal track
- Calculates counts per session type (CP, S, OS, L)
- Computes published/total for each type
- Overall completion percentage

**Track Display:**
```
▶ Analytics                                    65%
  Ron Nagy           CP 0/0  S 2/4  OS 1/2  L 1/1
  ════════════════════════════════╾─────── 65%

  [When expanded:]
  
  Sessions (2 published / 4 total)
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ Card 1 │ │ Card 2 │ │ Card 3 │ │ Card 4 │
  └────────┘ └────────┘ └────────┘ └────────┘
```

**Filters & Toggles (in Filter Overlay):**
- Show main in-person tracks only (excludes: Keynote and Sneaks, Strategy Keynote, CP Theater, Sponsors, Summit - other, Industry Session, ACS, Skill Exchange, ADLS)
- Show WIP Data (only if `wipCount > 0`)
- **Section Filters**: Show/hide specific session types across all tracks
  - Community Theater checkbox
  - Sessions checkbox
  - Online Sessions checkbox
  - Hands-on Labs checkbox
- Expand All / Collapse All button

**Props:**
- `sessions` - Full session array
- `showWIPData` - Boolean for WIP data display
- `wipCount` - Number of active WIP overrides
- `onToggleWIP` - Callback for WIP toggle
- `onWIPUpdate` - Callback after WIP edit/delete
- `showFilterOverlay` - Boolean to show/hide filter panel
- `onCloseFilterOverlay` - Callback to close filter panel

**Mini Session Cards:**
- Horizontal grid layout (4 cards per row)
- Shows title, description (truncated), products, speakers
- Two-column info layout:
  - Left column: Products (from CFP: PRODUCTS field)
  - Right column: Speakers with company info
- "More..." button expands card to full content
- Yellow background + border for active WIP sessions
- Gray background + border for disabled WIP sessions
- WIP action buttons inline with content:
  - "Add WIP" for placeholder sessions without overrides
  - "Edit WIP" to modify existing WIP data
  - "👁️ WIP" / "👁️ CSV" toggle button (green = WIP active, gray = CSV view)

---

### ProductsView.jsx (Products View)

**Data Aggregation:**
- Groups Hands-on Labs by product (from CFP: PRODUCTS field)
- Filters to only include Labs (ignores sessions, online sessions, etc.)
- Compares against master product list to identify coverage gaps
- Sorts products alphabetically

**Product Display:**
```
▶ Adobe Real-Time CDP B2B Edition           2 Labs
  
  [When expanded:]
  
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ Lab 1  │ │ Lab 2  │
  └────────┘ └────────┘
```

**Filters & Toggles (in Filter Overlay):**
- Show WIP Data (only if `wipCount > 0`)
- Expand All / Collapse All button

**Props:**
- `sessions` - Full session array (filters to Labs only)
- `showWIPData` - Boolean for WIP data display
- `wipCount` - Number of active WIP overrides
- `onToggleWIP` - Callback for WIP toggle
- `onWIPUpdate` - Callback after WIP edit/delete
- `showFilterOverlay` - Boolean to show/hide filter panel
- `onCloseFilterOverlay` - Callback to close filter panel

**Lab Cards:**
- Similar to TracksView mini cards but with additional metadata:
  - Session code (blue badge)
  - Track name (gray text)
  - Title and description (truncated with "More..." button)
  - All products used in the lab (if multiple products)
  - Speakers with company info
- Yellow background + border for active WIP sessions
- Gray background + border for disabled WIP sessions
- WIP action buttons inline with content (same as TracksView)

**Products Without Labs Section:**
- Displays at bottom of view
- Shows all products from `MASTER_PRODUCTS_LIST` that don't have associated labs
- Count displayed in heading: "Products Without Labs (X)"
- Grid layout matching lab cards
- Neutral styling (white cards with gray borders)
- Helps identify product coverage gaps
- Automatically excludes umbrella products:
  - Adobe Experience Manager (parent of Assets, Forms, Sites, etc.)
  - Adobe Experience Cloud (umbrella product)
  - Adobe Creative Cloud (umbrella product)
  - Adobe Document Cloud (umbrella product)
  - Adobe GenAI (umbrella term)
  - Not Product-Specific (meta category)

**Master Product List:**
- Defined in `src/utils/productsList.js`
- Canonical list of ~50 Adobe products
- Used for gap analysis only (not for filtering CSV data)
- Manually curated to exclude umbrella/parent products

---

### SchedulingGrid.jsx (Scheduling Grid View)

**Purpose:**
- Visual schedule view showing sessions/labs arranged by time slot and venue
- Interactive grid with track-based color coding
- Slide-in detail panel for session information
- Day and type filtering

**Data Sources:**
1. **Scheduling Grid CSV** - Venue/time slot assignments (required)
2. **Session Details CSV** - Full session information (optional but recommended)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  📅 Scheduling Grid        [📁 Upload New Grid]             │
├─────────────────────────────────────────────────────────────┤
│ 📆 DAY VIEW                🎯 TYPE FILTER   🎨 TRACK COLOR  │
│ [Everything, All at Once] [Monday] [Tuesday] [Wednesday]    │
│ [All] [Sessions] [Labs]                    [View Legend ▼]  │
│                                                              │
│ [When legend expanded:]                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 Analytics  🟠 B2B Customer Journeys  🟡 Commerce     │ │
│ │ 🟢 Content Supply Chain  🔵 Developers  🟣 Customer...  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Venue       │ Sessions #1  │ Sessions #2  │ Labs #1  │... │
│              │ 10:00-11:00  │ 11:30-12:30  │ 9:30-11:00│   │
│──────────────┼──────────────┼──────────────┼───────────┼────│
│ Level 5      │ S324         │ S331         │ L123      │    │
│ Palazzo A    │ Drive Growth │ Build Brand  │ CDM Lab   │    │
│ (CAP 324)    │ [colored by  │ [colored by  │ [colored] │    │
│              │  track]      │  track]      │           │    │
│──────────────┼──────────────┼──────────────┼───────────┼────│
│ Level 4      │ S231         │ OPEN         │ L223      │    │
│ Delfino 1    │ Adobe on...  │              │ Orchestr..│    │
│ (CAP 423)    │ [colored]    │ [gray]       │ [colored] │    │
└─────────────────────────────────────────────────────────────┘
```

**State Management:**
```javascript
- view: 'all' | 'monday' | 'tuesday' | 'wednesday'
- filterType: 'all' | 'Session' | 'Lab'  
- showLegend: boolean
- selectedSession: object | null
- sessionDetails: object | null  
- showDescription: boolean
```

**Key Features:**

1. **Grid Display:**
   - Sticky venue column (left) and time slot headers (top)
   - Session cells color-coded by track (24 distinct colors)
   - Session code + full title displayed in each cell
   - Hover effect with scale and shadow on clickable cells

2. **Track Color System:**
   - 24 colors across spectrum (defined in `trackColors.js`)
   - Limited blues (2), purples (1) for maximum distinction
   - Each cell has light background + thick left border in track color
   - Collapsible legend showing all track colors

3. **Cell Types:**
   - **Session/Lab cells**: Clickable, show code + title, track-colored
   - **OPEN**: Gray, non-clickable
   - **TBD/HOLD**: Yellow/orange, clickable
   - **Do Not Schedule**: Red, non-clickable
   - **REPEAT**: Indicated with label

4. **Detail Panel (Slide-in from Left):**
   - Opens on cell click as overlay
   - Semi-transparent backdrop
   - Grid remains visible underneath
   - Sections:
     - Title with track badge (colored by track)
     - **Collapsible Description** (▶ expands, ▼ collapses)
       - Closed by default
       - HTML-rendered content (paragraphs, lists, bold)
     - Scheduling Information (code, day, time, venue, capacity)
     - Session Information (type, status, published)
     - Speakers (as badges)
     - Products (as badges)
     - Catalog link

5. **Filtering:**
   - **Day**: Filter to specific conference day or view all
   - **Type**: Determined by session CODE prefix (L### = Lab, S### = Session)
   - Combined filters (e.g., Monday + Labs)

**Props:**
- `schedule` - Parsed scheduling grid data from CSV
- `allSessions` - Main session details array (for enrichment)
- `onScheduleUpload` - Callback for CSV upload

**Key Functions:**
- `getFilteredSchedule()` - Filters by day and type
- `getCellStyle()` - Returns track-based styling (background, border)
- `formatSessionDisplay()` - Renders cell content (gets title from allSessions)
- `handleCellClick()` - Opens detail panel
- `renderHTML()` - Safely renders HTML descriptions

**Data Flow:**
```
Scheduling Grid CSV
        ↓
   scheduleParser.js
        ↓
   { timeSlots, venues, days }
        ↓
   SchedulingGrid.jsx
        ↓
   Session clicked → findSessionByCode(allSessions)
        ↓
   Show detail panel with full session info
```

**CSS Classes:**
- `.schedule-cell` - Base cell style
- `.has-session` - Clickable session cell
- `.open`, `.tbd`, `.hold`, `.repeat`, `.do-not-schedule` - Special states
- `.session-code` - Blue session code display
- `.session-title` - Smaller title text
- `.details-overlay-panel` - Slide-in panel from left
- `.details-overlay-backdrop` - Semi-transparent backdrop
- `.description-accordion` - Collapsible description section

**Helper Files:**
- `src/utils/scheduleParser.js` - Parses scheduling grid CSV
- `src/utils/trackColors.js` - 24-color track mapping

---

### WIPModal.jsx (WIP Editing)

**Form Fields:**
- Session Code (read-only)
- Track (read-only)
- Session Type (read-only)
- **Title** (required)
- **Description** (required, textarea)
- Speaker Name (optional)
- Speaker Company (optional)
- Co-presenter Name (optional)
- Co-presenter Company (optional)

**Buttons:**
- Save WIP Data
- Delete WIP Data (if override exists)
- Cancel

---

### SplashScreen.jsx (Upload Modal)

**Triggers:**
- On first load (no CSV file found)
- When clicking "Updated: [Date]" badge

**Content:**
- Welcome message
- Instructions for CSV export
- FileUpload component
- Close button (only if data already loaded)

---

## State Management

### App-Level State (App.jsx)

```javascript
// Data
const [sessions, setSessions] = useState([])           // Merged CSV + WIP
const [rawSessions, setRawSessions] = useState([])     // Pure CSV
const [filteredSessions, setFilteredSessions] = useState([])
const [stats, setStats] = useState(null)
const [lastUpdated, setLastUpdated] = useState(null)

// View state
const [view, setView] = useState('overview')           // 'overview' | 'tracks' | 'sessions' | 'speakers' | 'products'

// Filter state
const [filters, setFilters] = useState({
  sessionType: '',
  published: '',
  sessionStatus: '',
  internalTrack: '',
  product: ''
})
const [filterOptions, setFilterOptions] = useState({})

// UI state
const [showSplashScreen, setShowSplashScreen] = useState(false)
const [showWIPData, setShowWIPData] = useState(true)
const [wipCount, setWipCount] = useState(0)
const [showFilterOverlay, setShowFilterOverlay] = useState(false)
const [showSpeakersFilterOverlay, setShowSpeakersFilterOverlay] = useState(false)
const [showTracksFilterOverlay, setShowTracksFilterOverlay] = useState(false)
const [showProductsFilterOverlay, setShowProductsFilterOverlay] = useState(false)
```

### Component-Level State

**Dashboard**: `expandedTracks` (Set of expanded track names)

**SessionList**: No local state (filters managed by App)

**SpeakersView**: 
- `expandedRows` (Set of expanded row IDs)
- `speakerCompanyFilter`, `trackFilter`, `sessionTypeFilter`

**TracksView**:
- `showMainTracksOnly`, `expandAll`
- `expandedTracks` (object mapping track name → boolean)
- `expandedCards` (Set of expanded card IDs)
- `editingSession` (currently editing WIP session)
- `visibleSections` (object mapping section type → boolean visibility)

**ProductsView**:
- `expandAll`
- `expandedProducts` (object mapping product name → boolean)
- `expandedCards` (Set of expanded card IDs)
- `editingSession` (currently editing WIP session)

**WIPModal**: Form field state (`title`, `description`, `speaker1`, etc.)

### Data Flow

```
CSV File Upload
     ↓
csvParser.parseCSV(csvString)
     ↓
rawSessions (stored)
     ↓
applyWIPOverrides(rawSessions, showWIPData)
     ↓
sessions (rendered)
     ↓
Filter application
     ↓
filteredSessions
     ↓
View components render
```

---

## Styling Architecture

### Global Styles (index.css)

**CSS Variables:**
```css
:root {
  --primary-color: #5258E4
  --secondary-color: #7B61FF
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  --card-bg: #ffffff
  --text-color: #000000
  --text-secondary: #666666
  --border-color: #e0e0e0
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
}
```

**Typography:**
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`
- All text: `font-style: normal` (no italics anywhere)
- Labels: `font-weight: 900` (extra bold)

### Component Styles

Each component has its own CSS file following BEM-like conventions:
- `.component-name` (container)
- `.component-name__element` (child elements)
- `.component-name--modifier` (variants)

**Key Patterns:**
- Cards: White background, rounded corners, shadow
- Badges: Inline-block, small padding, rounded, colored background
- Buttons: Cursor pointer, hover effects, no border (unless specific)
- Filter overlays: Fixed position, slide-in animation, backdrop blur

**Shared Filter Overlay Styles:**
Filter overlay CSS is defined in `SessionList.css` but used by all three views (Sessions, Speakers, Tracks):
- `.filter-overlay-backdrop` - Full-screen semi-transparent overlay
- `.filter-overlay-panel` - Slide-in panel from right
- `.filter-overlay-close` - Close button (× icon)
- Animations: `@keyframes fadeIn`, `@keyframes slideInRight`

### Responsive Considerations

- Filter overlays: `max-width: 90vw` for smaller screens
- Session cards: Stack vertically on mobile
- Tracks view cards: Flexible grid (4 columns → 2 columns → 1 column)

### CSS Styling Guidelines

**Important Rules:**
1. ❌ **NEVER use `!important`** - User preference, maintain proper specificity instead
2. ✅ **No italics anywhere** - All text should have `font-style: normal`
3. ✅ **Black text for readability** - Labels and content use `color: #000` or `color: black`
4. ✅ **Extra bold labels** - Field labels use `font-weight: 900`

**Color Palette:**
- Primary purple: `#5258E4`
- Secondary purple: `#7B61FF`
- Background gradient: Purple (from `#667eea` to `#764ba2`)
- Card background: `#ffffff` (white)
- Text: `#000000` (black)
- Secondary text: `#666666` (grey for track managers, totals)
- Borders: `#e0e0e0` (light grey)

**Badge Colors:**
- Published: Green (`#10b981` background)
- Unpublished/New: Orange (`#f59e0b` background)
- Online: Blue (`#3b82f6` background)
- Track tab: Black background, white text
- Session code tab: Blue (`#3b82f6`) background, white text
- WIP background tint: `rgba(255, 237, 153, 0.3)` (light yellow)

**Progress Bar Colors:**
- 0-33%: Red (`#ef4444`)
- 33-66%: Yellow (`#f59e0b`)
- 66-100%: Green (`#10b981`)

**Spacing:**
- Card padding: `1.5rem`
- Section gaps: `1rem` to `2rem`
- Tight spacing: `0.5rem` (for compact lists)
- Track items: Reduced to `0.4rem` gap for compact display

---

## WIP (Work-in-Progress) System

### Purpose
Allow users to enrich placeholder sessions with real data before official CSV updates arrive.

### Detection Logic (wipStorage.js)

```javascript
isWIPSession(session) {
  const title = session['SESSION TITLE']
  const abstract = session['SESSION ABSTRACT']
  
  // Generic title patterns
  const genericTitles = [
    /^Developer Lab \d+$/i,
    /^Session \d+$/i,
    /^Lab \d+$/i,
    /^TBD$/i
  ]
  
  // Check for "Placeholder" in description
  const hasPlaceholder = abstract?.includes('Placeholder')
  
  return genericTitles.some(pattern => pattern.test(title)) || hasPlaceholder
}
```

### Storage Format

**localStorage key:** `summit-wip-overrides`

**Value format (JSON):**
```json
{
  "L001": {
    "title": "Advanced Analytics Deep Dive",
    "description": "<p>Learn advanced techniques...</p>",
    "speaker1": "John Doe",
    "speaker1Company": "Adobe",
    "speaker2": "Jane Smith",
    "speaker2Company": "Microsoft",
    "enabled": true,
    "updatedAt": "2025-12-21T10:30:00.000Z"
  },
  "L002": { ... }
}
```

**New fields:**
- `enabled` (boolean): Controls whether WIP data is displayed (default: true)
- `updatedAt` (ISO string): Timestamp of last update

### WIP Lifecycle

1. **Detection**: App identifies WIP sessions on CSV load
2. **Editing**: User clicks "Add WIP Data" or "Edit WIP"
3. **Storage**: Data saved to localStorage, keyed by SESSION CODE with `enabled: true`
4. **Merging**: `applyWIPOverrides()` merges WIP data into sessions array (only if enabled)
5. **Global Toggle**: Users can toggle between CSV data and WIP data views (all sessions)
6. **Individual Toggle**: Users can toggle WIP per session (👁️ WIP / 👁️ CSV buttons)
7. **Persistence**: WIP data and enabled/disabled state persist across page reloads
8. **Override**: When real data arrives in CSV (non-generic title), WIP is ignored

### WIP Three-State System

Each session with WIP data has three possible actions:

1. **Add WIP** (`hasWIPOverride === false`)
   - Button: "Add WIP"
   - Action: Opens WIPModal to create new override
   - Result: Creates override with `enabled: true`

2. **Edit WIP** (`hasWIPOverride === true`)
   - Button: "Edit WIP"
   - Action: Opens WIPModal with existing data
   - Result: Updates override data, preserves enabled state

3. **Toggle WIP** (`hasWIPOverride === true`)
   - Button: "👁️ WIP" (green) or "👁️ CSV" (gray)
   - Action: Toggles `enabled` flag without opening modal
   - Result: Shows WIP data (enabled) or CSV data (disabled)
   - WIP data remains in localStorage when disabled

### WIP UI Indicators

- **Active WIP** (enabled = true):
  - Yellow background + yellow border
  - Badge: 📝
  - Toggle button: "👁️ WIP" (green)
- **Disabled WIP** (enabled = false):
  - Gray background + gray border
  - Badge: 📝❌ (dimmed)
  - Toggle button: "👁️ CSV" (gray)
- **No WIP override** (WIP session):
  - Yellow background + yellow border
  - Badge: ⚠️
  - Button: "Add WIP"
- **Global WIP toggle** in filter overlays (only if `wipCount > 0`)

---

## Filter System

### Filter Overlay Architecture

**Trigger Button (Header):**
- Located in header bottom row, aligned with nav tabs
- Only visible on Sessions, Speakers, and Tracks views
- Icon: Funnel/filter SVG icon + "Filters" text
- Position: Bottom-right, same vertical alignment as nav buttons

**Overlay Structure:**
```jsx
<div className="filter-overlay-backdrop" onClick={onCloseFilterOverlay}>
  <div className="filter-overlay-panel" onClick={(e) => e.stopPropagation()}>
    <button className="filter-overlay-close" onClick={onCloseFilterOverlay}>
      &times;
    </button>
    [Filter controls specific to each view]
  </div>
</div>
```

**Styling:**
- Panel: Fixed position, right side, 400px width (max 90vw)
- Full height with scroll overflow
- White background, shadow
- z-index: 1000 (backdrop), 1001 (panel)

**Animation:**
- Backdrop: Fade in (`opacity: 0 → 1`, 0.2s)
- Panel: Slide in from right (`translateX(100%) → 0`, 0.3s)
- Easing: ease-out for smooth entry

**Behavior:**
- Click backdrop → closes overlay
- Click close button (×) → closes overlay
- Click inside panel → stays open (stopPropagation)
- Each view manages its own overlay state (separate state variables)

### Filter Types

**Sessions View:**
1. **Session Type** (radio buttons, 2 groups):
   - Track: All / Community Theater / Hands-on Labs / Sessions / Online Sessions
   - Summit: Skill Exchange / Pre-conference Training / Keynote / Strategy Keynote / Sneaks / Certification Exam / Other
2. **Published** (radio): All / Published / Unpublished
3. **Session Status** (radio): All / Accepted / New
4. **Internal Track** (dropdown): All Tracks / [dynamic list]
5. **Product** (dropdown): All Products / [dynamic list]
6. **WIP Toggle**: Show WIP Data (checkbox, only if WIP overrides exist)

**Speakers View:**
1. **Session Type** (radio): All / [dynamic list]
2. **Speaker Company** (dropdown): All Companies / [dynamic list]
3. **Track** (dropdown): All Tracks / [dynamic list]

**Tracks View:**
1. **Show main in-person tracks only** (checkbox)
2. **Show WIP Data** (checkbox, only if WIP overrides exist)
3. **Section Filters**: Show/hide specific session types
   - Community Theater (checkbox)
   - Sessions (checkbox)
   - Online Sessions (checkbox)
   - Hands-on Labs (checkbox)
4. **Expand All / Collapse All** (button)

### Filter Auto-Selection Logic

**Skill Exchange:**
```javascript
if (sessionType === 'Skill Exchange') {
  setFilters({ ...filters, internalTrack: 'Skill Exchange' })
}
```

**Pre-conference Training:**
```javascript
if (sessionType === 'Pre-conference Training') {
  setFilters({ ...filters, internalTrack: 'ADLS' })
}
```

### Filter Application Flow

1. User changes filter in overlay
2. `handleFilterChange(field, value)` called in App.jsx
3. `filters` state updated
4. `useEffect` watches filters, recalculates `filteredSessions`
5. View components re-render with filtered data

---

## Development Guide

### Common Tasks

**Add a new filter:**
1. Add filter state to `App.jsx` filters object
2. Add filter option extraction in `csvParser.getUniqueValues()`
3. Add filter control to appropriate overlay component
4. Add filter logic in `useEffect` that calculates `filteredSessions`

**Add a new CSV column:**
1. Update data documentation in this README
2. Access via `session['COLUMN NAME']` (exact CSV header)
3. Add parsing logic in `csvParser.js` if transformation needed

**Add a new view:**
1. Create `NewView.jsx` and `NewView.css` in `src/components/`
2. Add view state option to `App.jsx` view state
3. Add navigation button in header nav tabs
4. Add conditional render in `App.jsx` main section
5. Pass necessary props (sessions, filters, handlers)

**Modify session card display:**
1. Edit `SessionCard.jsx` render logic
2. Update `SessionCard.css` styles
3. Test in both Sessions view and expanded views (Speakers, Tracks)

**Debug CSV parsing:**
1. Check browser console for parse errors
2. Verify column names match exactly (case-sensitive)
3. Add console.log in `csvParser.js` to inspect parsed data
4. Use React DevTools to inspect session objects

### Testing WIP System

```javascript
// In browser console:

// View all WIP overrides
JSON.parse(localStorage.getItem('summit-wip-overrides'))

// Clear all WIP data
localStorage.removeItem('summit-wip-overrides')

// Add test WIP override
const overrides = JSON.parse(localStorage.getItem('summit-wip-overrides')) || {}
overrides['L001'] = {
  title: 'Test Lab',
  description: '<p>Test description</p>'
}
localStorage.setItem('summit-wip-overrides', JSON.stringify(overrides))
location.reload()
```

### Git Workflow

```bash
# Daily development
git add .
git commit -m "Descriptive message"
git push origin main

# Feature branch (optional)
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Output will be in `dist/` directory.

---

## Scheduling Grid Feature

The Scheduling Grid provides a visual, interactive view of the Summit schedule showing when and where each session/lab is scheduled across venues and time slots.

### Overview

The Scheduling Grid displays sessions in a spreadsheet-style layout with:
- **Venues** (rows): Conference rooms with capacity information
- **Time Slots** (columns): Sessions #1-10, Labs #1-7, Strategy Keynotes
- **Color-coded cells**: Each session colored by its track for instant visual identification
- **Interactive details**: Click any session to view full information in a slide-in panel

### Key Features

#### 1. **Visual Schedule Layout**
- Grid-based view showing the entire Summit schedule at a glance
- Sticky headers (venue column and time slot row) for easy navigation while scrolling
- Session codes (S###, L###) displayed with full titles from session details CSV
- Track-based color coding with 24 distinct colors

#### 2. **Filtering & Views**
- **Day View Filter**: Everything All at Once, Monday, Tuesday, Wednesday
- **Type Filter**: All, Sessions, Labs
- **Track Color Legend**: Collapsible legend showing all tracks and their colors

#### 3. **Track Color System**
- 24 distinct colors carefully selected across the color spectrum
- Maximum visual separation (only 2 blues, 1 purple, diverse palette)
- Colors include: reds, oranges, yellows, greens, teals, blues, purples, pinks, browns, grays
- Each session cell has:
  - Light background color (track's light color)
  - Thick left border (track's main color)
  - Session code and title displayed

#### 4. **Slide-in Detail Panel**
- Opens from the left as an overlay (like filter panels in other views)
- Grid remains visible underneath for comparison
- Click backdrop or X button to close
- Shows complete session information:
  - **Highlighted title section** with track badge in track color
  - **Collapsible description** (closed by default, expands to show HTML-formatted content)
  - **Scheduling information**: Session code, day, time slot, venue, capacity
  - **Session information**: Type, status, published state
  - **Speakers**: Displayed as badges
  - **Products**: Displayed as badges (like in other views)
  - **Catalog link**: Button to view in session catalog

#### 5. **Special Cell States**
- **OPEN**: Available slot (gray)
- **TBD**: To be determined (yellow)
- **HOLD**: Reserved slot (orange)
- **REPEAT**: Repeat session indicator
- **Do Not Schedule**: Blocked slot (red)

### Data Sources

The Scheduling Grid uses TWO CSV files:

#### 1. **Scheduling Grid CSV** (Required)
- Upload via "Upload New Grid" button
- Complex structure with time slots in headers, venues in rows
- Contains: Session codes, venue names, capacity, time slot assignments
- Special markers: OPEN, HOLD, TBD, REPEAT, Do Not Schedule

#### 2. **Session Details CSV** (Optional but recommended)
- The main CSV loaded at app startup
- Provides: Full session titles, descriptions, speakers, products, status
- When loaded, enriches grid cells with complete information
- Without it, only session codes from scheduling grid are shown

### File Structure

```
src/
├── components/
│   ├── SchedulingGrid.jsx      # Main grid component
│   └── SchedulingGrid.css      # Grid styling
├── utils/
│   ├── scheduleParser.js       # Parses scheduling grid CSV
│   └── trackColors.js          # 24-color track mapping
```

### Technical Implementation

#### scheduleParser.js
- Parses complex CSV structure with multiple header rows
- Extracts time slots from first two rows
- Identifies venues from column 1 (rooms with capacity)
- Skips metadata rows (Speakers, Special Notes, Add Mics, AV)
- Parses session codes and titles from cell content
- **Determines session type from code prefix** (L### = Lab, S### = Session, SK## = Strategy Keynote)
- Creates structured data: `{ timeSlots, venues, days }`

#### trackColors.js
- Defines 24 distinct colors for tracks
- Each color has: `background`, `text`, `light`, `border`
- Organized by color family (reds, oranges, yellows, etc.)
- Supports track name variations and aliases
- Provides `getTrackColor()` and `getSessionTrackColor()` helpers

#### SchedulingGrid.jsx Component
**State Management:**
```javascript
- view: 'all' | 'monday' | 'tuesday' | 'wednesday'
- filterType: 'all' | 'Session' | 'Lab'
- showLegend: boolean (track color legend visibility)
- selectedSession: object | null (for detail panel)
- sessionDetails: object | null (full session info from main CSV)
- showDescription: boolean (description accordion state)
```

**Key Functions:**
- `getFilteredSchedule()`: Filters by day and type
- `getCellStyle()`: Returns track-based styling for each cell
- `getCellClassName()`: Adds CSS classes based on cell state
- `formatSessionDisplay()`: Renders cell content (code + title from session details CSV)
- `handleCellClick()`: Opens detail panel with session information
- `renderHTML()`: Safely renders HTML descriptions using dangerouslySetInnerHTML

#### SchedulingGrid.css
**Grid Layout:**
- Fixed-width venue column (280px) with sticky positioning
- Scrollable table with sticky headers
- Minimum column width (220px) for readability
- Responsive adjustments for mobile

**Cell Styling:**
- Track colors applied via inline styles (background, border-left)
- Hover effects with scale transform and shadow
- Session code in bold, colored text
- Session title in smaller, wrapped text

**Detail Panel:**
- Fixed position overlay from left (500px width)
- Semi-transparent backdrop (rgba(0, 0, 0, 0.5))
- Slide-in animation (0.3s ease)
- Styled sections with modern cards
- HTML description rendering with proper paragraph/list formatting

### Color Palette Strategy

The 24-color palette was designed for maximum distinction:

**Color Distribution:**
- Reds (2): Crimson, Ruby
- Oranges (2): Bright Orange, Dark Orange
- Yellows (2): Gold, Dark Goldenrod
- Greens (3): Lawn Green, Forest Green, Dark Olive
- Teals (2): Dark Cyan, Light Sea Green
- Blues (2 only!): Dodger Blue, Cobalt Blue
- Purple (1 only!): Dark Magenta
- Indigos (2): Indigo, Rebecca Purple
- Pinks (1): Deep Pink
- Browns (3): Saddle Brown, Peru, Chocolate
- Grays (2): Dim Gray, Dark Gray
- Special (2): Coral, Rosy Brown

**Design Principles:**
- Strict limits on similar colors (max 2-3 per hue)
- Wide hue variation across color wheel
- Different saturation and brightness levels
- Accessible text colors (white on dark, black on light)
- Named after standard web colors for consistency

### Usage Workflow

#### Initial Setup
1. Navigate to "Scheduling Grid" tab
2. Click "Upload New Grid" button
3. Select scheduling grid CSV file
4. Grid populates with sessions color-coded by track

#### Viewing the Schedule
1. **Select Day**: Choose "Everything, All at Once" or specific day (Monday/Tuesday/Wednesday)
2. **Filter Type**: Toggle between All, Sessions, or Labs
3. **View Legend**: Click "View Legend" to see track color mappings
4. **Scroll Grid**: Use sticky headers to navigate large schedule

#### Checking Session Details
1. Click any session cell (colored cells with session codes)
2. Detail panel slides in from left showing:
   - Title with track badge
   - Description (click ▶ to expand)
   - Scheduling info (code, day, time, venue, capacity)
   - Session metadata (type, status, published)
   - Speakers and products as badges
   - Link to catalog
3. Grid remains visible for comparing concurrent sessions
4. Click backdrop or X to close panel

#### Identifying Conflicts
1. Select a time slot by looking at a specific column
2. Scan down to see all sessions scheduled at that time
3. Click sessions to view details and check for:
   - Track clustering (too many of same track)
   - Competing content (similar topics at same time)
   - Speaker conflicts (same speaker in multiple sessions)
   - Venue capacity issues

### Common Issues & Solutions

**Issue**: Grid shows only session codes, no titles
- **Cause**: Session details CSV not loaded
- **Solution**: Upload main session details CSV at app startup

**Issue**: Labs filter shows no results
- **Cause**: Sessions were in "Labs #1" time slot but had S### codes
- **Solution**: Fixed - now determines type from session CODE prefix (L### = Lab)

**Issue**: All cells show same color when clicking a session
- **Cause**: Bug in getCellStyle() using selected session for all cells
- **Solution**: Fixed - now each cell looks up its own track color

**Issue**: Empty cells are clickable
- **Cause**: Session codes existed but weren't visible
- **Solution**: Fixed - always display session codes; prevent clicks on truly empty cells

**Issue**: Description shows HTML tags
- **Cause**: Not rendering HTML content
- **Solution**: Fixed - uses dangerouslySetInnerHTML like SessionCard

**Issue**: Too many similar colors (lots of blues)
- **Cause**: Initial color palette wasn't diverse enough
- **Solution**: Fixed - limited to 2 blues, 1 purple; added diverse palette across spectrum

### Integration with Other Views

- **Session codes** link to main session details CSV
- **Track colors** are consistent with track identity
- **Products** display as badges (same style as other views)
- **Speakers** display as badges (consistent styling)
- **Descriptions** rendered with HTML (same as SessionCard)
- **Published status** shown with colored indicators (✓/⏳)

### Future Enhancements

Potential improvements for Scheduling Grid:
1. **Drag-and-drop** to reschedule sessions
2. **Export** modified schedules back to CSV
3. **Conflict warnings** with automatic detection
4. **Filter by track** or product
5. **Search** for specific sessions
6. **Highlight related sessions** (same track, speaker, product)
7. **Print view** optimized for paper schedules
8. **Thursday** scheduling support (currently Mon-Wed only)
9. **Multi-select** to compare multiple sessions
10. **Notes/comments** per time slot

---

## Future Considerations

### Potential Enhancements

1. **Multi-user collaboration**: Move from localStorage to backend database
2. **Export functionality**: Export filtered sessions as CSV or Excel
3. **Compare CSV versions**: Diff view showing changes between uploads
4. **Trending over time**: Store historical CSV snapshots, show progress charts
5. **Email notifications**: Alert track managers of status changes
6. **Bulk WIP operations**: Import/export WIP data as JSON
7. **Advanced filtering**: Combine filters with AND/OR logic
8. **Search functionality**: Full-text search across sessions
9. **Calendar view**: Display sessions by date/time in calendar format
10. **Print/PDF export**: Generate printable reports

### Known Limitations

- **Single user**: localStorage is per-browser, not shared
- **No backend**: All data is client-side (CSV + localStorage)
- **No authentication**: Anyone with the app can view/edit WIP data
- **CSV dependency**: App requires manual CSV uploads
- **Browser-bound**: WIP data doesn't sync across devices

### Rainfocus API Integration

The CSV comes from Rainfocus. Future versions could:
- Authenticate with Rainfocus API
- Fetch data automatically on schedule
- Push WIP changes back to Rainfocus
- Real-time sync instead of manual uploads

**Note:** This would require backend infrastructure and API credentials.

---

## Support & Contact

This is an internal Adobe tool. For questions or issues:
- Check this README first
- Review component source code (well-commented)
- Use Cursor AI chat with this README for context

**Repository:** https://github.com/gribbletog/summit-status (private)

---

## License

Private - Adobe Internal Use Only

**Last Updated:** December 21, 2025
