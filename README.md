# Summit 2026 Session Status Dashboard

A web application for visualizing and managing Adobe Summit 2026 session data.

## Features

- **Overview Dashboard**: View total sessions, session status breakdown, and track completion percentages
- **Sessions View**: Browse and filter sessions with advanced filtering options
  - Filter by Session Type (Track/Summit sessions)
  - Filter by Published status
  - Filter by Session Status
  - Filter by Internal Track
  - Filter by Products
- **Speakers View**: View speaker information with expandable session details
  - Filter by Speaker Company
  - Filter by Track
  - Filter by Session Type

## Session Type Auto-Detection

Session types are automatically derived from SESSION CODE prefixes:
- `S###` → Session
- `OS###` → Online Session
- `L###` → Hands-on Lab
- `CERT#` → Certification Exam
- `CP##` → Community Theater
- `GS1, GS2` → Keynote
- `GS3` → Sneaks
- `SK#` → Strategy Keynote
- `TRN##` → Pre-conference Training

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Loading Data

The app automatically loads data from `/data/Summit 2025 Session Details Report.csv` on startup. You can also upload a new CSV file using the file upload button.

## Built With

- React.js
- Vite
- PapaParse (CSV parsing)

## Project Structure

```
summit-status/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── SessionList.jsx
│   │   ├── SessionCard.jsx
│   │   ├── SpeakersView.jsx
│   │   └── FileUpload.jsx
│   ├── utils/
│   │   └── csvParser.js
│   ├── App.jsx
│   └── main.jsx
├── data/
│   └── Summit 2025 Session Details Report.csv
└── package.json
```

## License

Private - Adobe Internal Use Only
