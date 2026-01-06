# TA View Implementation Plan

## Overview
Add a new "TA" (Technical Assistant) tab to display Hands-on Lab allocations with interactive lab details.

---

## Data Structure

### CSV File
- **Location**: `data/ta-allocations.csv` (or similar)
- **Parsing**: New utility function in `csvParser.js` or separate `taParser.js`
- **Storage**: Separate state in `App.jsx` (similar to sessions)

### Expected Columns (to be confirmed)
- `LAB CODE` (e.g., "L337")
- `LAB TITLE`
- `TRACK`
- `TA NAME`
- `TA EMAIL`
- `TIME SLOT`
- `LOCATION/ROOM`
- `DATE`
- `CAPACITY`
- `STATUS` (e.g., Assigned, Pending, etc.)

---

## UI/UX Design Options

### Option 1: Table with Side Panel (Recommended)
**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ TA Allocations                            [Filters] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────┬──────────────┬────────┬──────┐       │
│ │ Lab Code │ Lab Title    │ Track  │ TA   │       │
│ ├──────────┼──────────────┼────────┼──────┤       │
│ │ L337 → │ Analytics Lab│ Analyt.│ John │       │
│ │ L338     │ Dev Lab      │ Devs   │ Jane │       │
│ │ ...      │ ...          │ ...    │ ...  │       │
│ └──────────┴──────────────┴────────┴──────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Interaction:**
- Click row → Side panel slides in from right with full details
- Hover on Lab Code → Tooltip shows quick summary
- Panel shows: Lab details, TA info, session details (merged from main CSV)

**Pros:**
- Clean, spreadsheet-like interface
- Easy to scan multiple labs
- Familiar pattern (similar to SpeakersView)
- Side panel keeps context visible

### Option 2: Card Grid with Modal
**Layout:**
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ L337   │ │ L338   │ │ L339   │ │ L340   │
│ Analyt.│ │ Dev Lab│ │ Content│ │ Mobile │
│ John D.│ │ Jane S.│ │ Bob M. │ │ Amy L. │
└────────┘ └────────┘ └────────┘ └────────┘
```

**Interaction:**
- Click card → Modal opens with full details
- Hover → Tooltip with quick info

**Pros:**
- Visual, scannable
- Good for overview
- Similar to TracksView cards

### Option 3: Grouped by Track (Recommended Alternative)
**Layout:**
```
▼ Analytics (5 labs)
  ┌──────────┬──────────────┬──────┬──────────┐
  │ L337     │ Analytics Lab│ John │ 9:00 AM  │
  │ L338     │ Data Lab     │ Jane │ 11:00 AM │
  └──────────┴──────────────┴──────┴──────────┘

▼ Developers (8 labs)
  ┌──────────┬──────────────┬──────┬──────────┐
  │ L401     │ Code Lab     │ Bob  │ 10:00 AM │
  └──────────┴──────────────┴──────┴──────────┘
```

**Pros:**
- Organized by track (natural grouping)
- Similar to TracksView pattern
- Easy to find labs by track

---

## Recommended Approach: Hybrid Solution

**Main View: Table with Grouping**
- Group labs by track (expandable like TracksView)
- Table layout within each track group
- Click lab code → Side panel with details
- Hover lab code → Tooltip with quick summary

**Why this works:**
1. Combines best of table (data density) and grouping (organization)
2. Consistent with existing TracksView pattern
3. Side panel keeps context while showing details
4. Tooltips for quick reference without interrupting flow

---

## Component Structure

```
src/components/
├── TAView.jsx              # Main TA view component
├── TAView.css
├── TATable.jsx             # Table of TA allocations (optional)
├── TADetailPanel.jsx       # Side panel with lab details
└── TADetailPanel.css
```

---

## Data Flow

```
TA CSV File
    │
    ▼
parseTACSV() (new function)
    │
    ▼
App.jsx state (taAllocations)
    │
    ▼
TAView component
    │
    ├─→ Group by track
    ├─→ Merge with session data (by LAB CODE)
    └─→ Render tables with interaction
```

---

## Features to Implement

### Core Features (Phase 1)
- [ ] CSV upload for TA data
- [ ] Parse TA data
- [ ] Display table grouped by track
- [ ] Click lab code → open side panel
- [ ] Side panel shows:
  - Lab details from main CSV
  - TA information
  - Time/location
  - Capacity/status

### Enhanced Features (Phase 2)
- [ ] Hover tooltip on lab code
- [ ] Filter by track
- [ ] Filter by TA name
- [ ] Filter by time slot
- [ ] Search labs
- [ ] Export filtered data
- [ ] Color-coding by status
- [ ] Highlight unassigned labs

### Advanced Features (Phase 3)
- [ ] Drag-and-drop TA reassignment
- [ ] Conflict detection (TA double-booked)
- [ ] Calendar view of lab schedules
- [ ] TA availability management
- [ ] Email TA from panel

---

## Integration Points

### App.jsx Changes
```javascript
// New state
const [taAllocations, setTAAllocations] = useState([])
const [rawTAData, setRawTAData] = useState([])

// New view
const [view, setView] = useState('overview') 
// Add 'ta' as option: 'overview' | 'tracks' | 'sessions' | 'speakers' | 'ta'

// New tab in header
<button onClick={() => setView('ta')}>TA</button>
```

### csvParser.js Updates
```javascript
export const parseTACSV = (csvString) => {
  // Parse TA-specific CSV
  // Return structured TA data
}

export const mergeLabWithTA = (sessions, taAllocations) => {
  // Merge lab sessions with TA data
  // Match by LAB CODE
}
```

---

## UI Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│ Summit 2026 Session Status Dashboard    Updated: Dec 21, 2025  │
│ Overview | Tracks | Sessions | Speakers | TA          [Filter] │
└─────────────────────────────────────────────────────────────────┘

TA Allocations - Hands-on Labs

┌─ Analytics ───────────────────────────────────────── 3 labs ─┐
│ Lab Code   Title                Track      TA        Time     │
│ ─────────────────────────────────────────────────────────────│
│ L337 ℹ️   Analytics Deep Dive  Analytics  John Doe  9:00 AM │
│ L338 ℹ️   Data Visualization   Analytics  Jane S.   11:00 AM│
│ L339 ℹ️   Advanced Metrics     Analytics  Bob M.    2:00 PM │
└───────────────────────────────────────────────────────────────┘

┌─ Developers ──────────────────────────────────────── 5 labs ─┐
│ Lab Code   Title                Track      TA        Time     │
│ ─────────────────────────────────────────────────────────────│
│ L401 ℹ️   React Fundamentals   Developers Alice K.  10:00 AM│
│ ...                                                           │
└───────────────────────────────────────────────────────────────┘

[When clicking L337, side panel slides in from right]

                                    ┌─────────────────────────┐
                                    │ ✕  Lab Details          │
                                    ├─────────────────────────┤
                                    │ L337                    │
                                    │ Analytics Deep Dive     │
                                    │                         │
                                    │ 📍 Room: Ballroom 2A    │
                                    │ 🕐 Time: 9:00-11:00 AM  │
                                    │ 📅 Date: April 20       │
                                    │ 👥 Capacity: 50         │
                                    │                         │
                                    │ TA Assigned:            │
                                    │ John Doe                │
                                    │ john.doe@adobe.com      │
                                    │                         │
                                    │ Session Details:        │
                                    │ [Full session info]     │
                                    │                         │
                                    │ [Edit TA] [View Session]│
                                    └─────────────────────────┘
```

---

## Implementation Steps

### Step 1: Data Preparation
1. Export XLSX to CSV
2. Review column structure
3. Ensure LAB CODE matches session CSV format
4. Add sample data for testing

### Step 2: Backend (Data Layer)
1. Create TA CSV parser in `csvParser.js`
2. Add TA data state to `App.jsx`
3. Create merge function to combine lab sessions with TA data
4. Test data parsing and merging

### Step 3: UI Components
1. Create `TAView.jsx` component
2. Implement grouped table layout
3. Add track expansion/collapse
4. Style with `TAView.css`

### Step 4: Interactive Features
1. Create `TADetailPanel.jsx` side panel
2. Implement click handler to open panel
3. Populate panel with merged data
4. Add tooltip component for hover

### Step 5: Filters & Enhancement
1. Add filter overlay (track, TA, status)
2. Add search functionality
3. Color-code by status
4. Add export functionality

### Step 6: Testing & Polish
1. Test with real data
2. Responsive design
3. Performance optimization
4. Documentation update

---

## File Upload Strategy

### Option A: Separate Upload (Simpler)
- New upload button in TA view
- Independent from session CSV
- User uploads TA CSV separately

### Option B: Combined Upload (Better UX)
- Upload both CSVs from splash screen
- Store both in separate state
- Merge data automatically

**Recommendation: Option A for Phase 1, Option B for Phase 2**

---

## Technical Considerations

### Data Merging
- Match TA data with session data by LAB CODE
- Handle missing matches gracefully
- Show warning if lab in TA CSV but not in session CSV

### Performance
- Memoize grouped data
- Virtualize table if many labs
- Lazy-load detail panel content

### State Management
```javascript
// App.jsx additions
const [taAllocations, setTAAllocations] = useState([])
const [mergedLabData, setMergedLabData] = useState([])

useEffect(() => {
  // Merge sessions with TA data
  const merged = mergeLabWithTA(sessions, taAllocations)
  setMergedLabData(merged)
}, [sessions, taAllocations])
```

---

## Questions to Answer Before Starting

1. **TA CSV Structure**: Can you share the exact column names?
2. **Relationship**: Does each lab have one TA or multiple?
3. **Time Slots**: Are there multiple sessions of the same lab with different TAs?
4. **Editing**: Should users be able to edit TA assignments in the app?
5. **Priority**: Which features are must-have vs nice-to-have?

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Share TA CSV structure** (column names and sample data)
3. **Prioritize features** (what's needed for MVP?)
4. **Start implementation** with Phase 1

---

**Estimated Timeline:**
- Phase 1 (Core): 3-4 hours
- Phase 2 (Enhanced): 2-3 hours
- Phase 3 (Advanced): 4-5 hours (if needed)

**Total MVP (Phase 1 + 2): ~6 hours**

