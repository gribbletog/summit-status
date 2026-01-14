# Scheduling Grid Feature Guide

## Overview
The Scheduling Grid feature provides a visual representation of the Summit schedule, showing which sessions are scheduled in which venues at different times.

## Features

### 1. **Multiple Views**
- **Everything, All at Once**: View all days and time slots in one comprehensive grid
- **Day Views**: Filter by Monday, Tuesday, or Wednesday to focus on a single day
- **Type Filters**: Toggle between All, Sessions, or Labs

### 2. **Interactive Grid**
- **Track Color-Coded Cells**: Each session displays in its track's signature color (e.g., Analytics in red, B2B Customer Journeys in orange, Content Supply Chain in blue, etc.)
- **Visual State Indicators**:
  - **Colored Border**: Track-colored left border indicates which track the session belongs to
  - **OPEN**: Available slot (gray)
  - **TBD**: Session planned but details pending (yellow)
  - **HOLD**: Slot is on hold (orange)
  - **REPEAT**: Session is a repeat from another time slot (displayed with note)
  - **Do Not Schedule**: Slot should not be used (red)
  
### 3. **Modern Side Panel Details**
- Click any session cell to open a beautifully designed side panel
- The grid remains visible while the panel is open for easy comparison
- The panel features:
  - **Highlighted Session Title**: Large, prominent display with track badge in track color
  - **Scheduling Info**: Session code, time slot, day, venue, capacity (organized in a clean grid)
  - **Session Details**: Title, track, type, status, published status with colored indicators
  - **Description**: Full session description in a styled card
  - **Speakers**: Speaker names displayed as elegant badges
  - **Products**: Associated Adobe products shown as modern, pill-shaped badges
  - **Catalog Link**: Prominent button to view session in the catalog

### 4. **Track-Based Color Coding**
Each track has its own distinctive color that carries through the entire system:
- Sessions are colored by their track for instant visual identification
- Makes it easy to see track distribution across time slots and venues
- Helps identify track clustering or conflicts at a glance
- Track colors match the original scheduling grid for consistency

### 5. **Conflict Detection**
The grid helps identify scheduling conflicts by:
- Showing all sessions at the same time across different venues
- Track colors make it obvious when similar sessions overlap
- Allowing quick comparison of concurrent sessions
- Displaying session details side-by-side with the grid

## How to Use

### Initial Setup
1. Navigate to the **Scheduling Grid** tab in the navigation
2. Click **"Upload Scheduling Grid CSV"**
3. Select your scheduling grid CSV file (format: SUMMIT 2026 Scheduling Grid - In-Person Agenda.csv)

### Exploring the Schedule
1. **Choose a View**:
   - Start with "Everything, All at Once" to see the full picture
   - Switch to day views (Monday/Tuesday/Wednesday) for focused planning
   
2. **Filter by Type**:
   - Use the Type filter to view only Sessions or Labs
   - This is helpful when planning specific activity types

3. **Review Session Details**:
   - Click any session in the grid to open the side panel
   - The grid remains visible so you can compare with other sessions
   - Review full session information including speakers, description, and status

4. **Check for Conflicts**:
   - Look at a specific time slot across all venues
   - Click sessions to compare details
   - Verify no scheduling conflicts exist

### Typical Workflows

#### **Planning a Day**
1. Select a day view (e.g., Tuesday)
2. Review which venues are occupied at each time slot
3. Click sessions to verify details and check for conflicts
4. Identify OPEN slots for new sessions

#### **Managing Labs**
1. Click "Labs" in the Type filter
2. View all lab sessions across the event
3. Check venue capacities
4. Ensure proper distribution across time slots

#### **Verifying Session Placement**
1. Find a specific session code in the grid
2. Click to open details panel
3. Verify:
   - Correct venue and capacity
   - No time conflicts with related sessions
   - Appropriate day and time slot
   - Session status and published state

## CSV File Format

The scheduling grid CSV should have:
- **Row 1**: Time slot names (e.g., "Sessions #1", "Labs #1")
- **Row 2**: Time slot times (e.g., "10:00am - 11:00am")
- **Column 1**: Venue names with capacity (e.g., "Level 5 Palazzo A (CAP 324)")
- **Cells**: Session codes and titles (e.g., "S324: Drive Growth with AI-Ready...")

Special markers recognized:
- `OPEN` - Available slot
- `TBD` - To be determined
- `HOLD` - Reserved
- `REPEAT` - Repeat session
- `Do Not Schedule` - Blocked slot

## Integration with Session Details

When both the Session Details CSV and Scheduling Grid CSV are loaded:
- Clicking a session in the grid displays full session information
- Session status, speakers, and descriptions are shown
- Links to the session catalog are available
- You can cross-reference scheduling with session details

## Tips

1. **Load Session Details First**: Upload your session details CSV before the scheduling grid for maximum functionality
2. **Use Day Views for Planning**: When actively scheduling, day views reduce visual clutter
3. **Check Conflicts Early**: Use the grid to spot potential conflicts before finalizing the schedule
4. **Monitor Capacity**: Venue capacities are shown in the grid to help with room assignments
5. **Track Changes**: Re-upload the scheduling grid CSV as changes are made to see the latest schedule

## Troubleshooting

### Grid Not Loading
- Ensure the CSV file follows the expected format
- Check that column and row headers are present
- Verify the file is not empty

### Session Details Not Showing
- Make sure the Session Details CSV is loaded in the app
- Verify session codes match between both files
- Check that the SESSION CODE field exists in the details CSV

### Performance Issues
- Use day views instead of "Everything, All at Once" for large schedules
- Filter by type (Sessions or Labs) to reduce grid size
- Close the side panel when not needed

## Future Enhancements

Potential improvements for this feature:
- Drag-and-drop to reschedule sessions
- Export modified schedules
- Automatic conflict detection with warnings
- Filter by track or product
- Search for specific sessions
- Highlight related sessions (same track, same speaker, etc.)
