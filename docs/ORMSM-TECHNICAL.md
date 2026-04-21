# ORMSM — Technical Documentation

**Operational Risk Management System Module**

This document is for developers, system administrators, and IT personnel who need to understand how ORMSM is built, deployed, and maintained.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Module Architecture](#module-architecture)
5. [Database Schema](#database-schema)
6. [Data Flow](#data-flow)
7. [Environment Configuration](#environment-configuration)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)

---

## Architecture Overview

ORMSM is a single-page application (SPA) with two independently deployed modules sharing a common frontend infrastructure. It follows a cloud-native, serverless architecture pattern where the frontend is hosted as static files and communicates directly with a PostgreSQL database via Supabase.

```
Browser (React SPA)
    │
    ├── Call Tree Module ──► Supabase (PostgreSQL + Real-time)
    │                           └── SMS Blast Provider (external)
    │
    └── RCSA Module ────────► Supabase (PostgreSQL)
                                └── HR System (CSV/Excel export)
```

The two modules are:

- **Call Tree** — Emergency employee safety and SMS response tracking. Uses Supabase real-time subscriptions for live data updates.
- **RCSA** — Risk and control self-assessment. Standard REST queries with no real-time requirement.

Both modules share the same React application shell, authentication layer, and build pipeline but are deployed independently via Vite's multi-mode build.

---

## Project Structure

```
src/
├── App.tsx                    # Root router — decides which module to load
├── main.tsx                   # React entry point
├── index.css                  # Global Tailwind CSS imports
│
├── components/                # Shared UI components
│   ├── AppShell.tsx           # Top navigation, module switcher, shell layout
│   ├── Badge.tsx              # Reusable status badge
│   └── ErrorBoundary.tsx      # Global error handler
│
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   ├── constants.ts           # Shared constants (status colors, order)
│   └── utils.ts                # Utility functions (date formatting, cn(), etc.)
│
└── modules/
    ├── calltree/              # Call Tree module (TypeScript + React)
    │   ├── CallTreeDashboard.tsx
    │   ├── types.ts           # TypeScript interfaces
    │   ├── components/
    │   │   ├── dashboard/
    │   │   │   ├── DashboardContent.tsx    # Main live view
    │   │   │   ├── DashboardHeader.tsx     # Module header
    │   │   │   ├── IncidentControls.tsx    # Start/end event controls
    │   │   │   ├── IncidentHistory.tsx     # Historical incident viewer
    │   │   │   ├── IncidentDetail.tsx      # Detail view for a past incident
    │   │   │   ├── StartIncidentForm.tsx   # Form to initialize an event
    │   │   │   ├── RegisterIncidentForm.tsx
    │   │   │   ├── KPICard.tsx             # Metric card
    │   │   │   ├── Filters.tsx             # Filter panel
    │   │   │   ├── DataUpload.tsx          # CSV/Excel upload modal
    │   │   │   ├── charts/
    │   │   │   │   ├── StatusDonut.tsx     # Response status breakdown
    │   │   │   │   ├── ResponseDonut.tsx   # Response rate donut
    │   │   │   │   ├── ResponseTimeline.tsx # Responses over time
    │   │   │   │   └── DemographicChart.tsx # Bar chart by dept/location
    │   │   │   └── tables/
    │   │   │       ├── ResponsesTable.tsx  # All responses table
    │   │   │       └── AuxiliaryTables.tsx  # Unknown + Pending tables
    │   │   └── ui/
    │   │       └── MultiSelect.tsx         # Multi-select dropdown
    │   ├── hooks/
    │   │   ├── useDashboardData.ts         # Fetches + subscribes to contacts/responses
    │   │   └── useIncident.ts               # Manages active incident state
    │   └── lib/
    │       ├── supabase.ts                 # Supabase client
    │       ├── constants.ts                # Status colors, order
    │       └── csv.ts                      # CSV parsing helpers
    │
    └── rcsa/                   # RCSA module (Plain JS + React)
        ├── RCSADashboard.jsx            # Main RCSA dashboard
        ├── components/
        │   ├── DashboardHeader.jsx       # Filter bar
        │   ├── DashboardKPIs.jsx        # KPI row
        │   ├── KpiCard.jsx              # Individual KPI card
        │   ├── KpiModal.jsx             # KPI detail modal
        │   ├── RiskBadge.jsx            # Risk level badge
        │   ├── RiskRegister.jsx         # Risk register table
        │   ├── RiskRegisterModal.jsx    # Full register modal
        │   ├── FilterIndicators.jsx     # Active filter chips
        │   ├── MultiFilter.jsx          # Multi-select filter
        │   ├── SingleFilter.jsx         # Single-select filter
        │   ├── SectionCard.jsx          # Chart container card
        │   ├── LegendRow.jsx            # Chart legend item
        │   ├── MiniRiskBar.jsx          # Small risk level bar
        │   ├── DarkTooltip.jsx          # Styled tooltip
        │   └── charts/
        │       ├── InherentRiskHeatmap.jsx   # 5×5 likelihood/impact heatmap
        │       ├── ControlTypeChart.jsx       # Donut — control types
        │       ├── RootCauseChart.jsx          # Donut — root cause breakdown
        │       ├── EventTypeChart.jsx         # Bar — event type distribution
        │       ├── SankeyEventType.jsx        # D3 Sankey — risk flow
        │       ├── RiskTreatmentChart.jsx     # Donut — risk treatments
        │       └── DepartmentRiskChart.jsx    # Horizontal bar — residual risk
        ├── hooks/
        │   └── useDashboardData.js      # Filtering, aggregation logic
        ├── lib/
        │   └── supabase.js              # Supabase client
        └── utils/
            ├── riskLevels.js           # Risk level definitions, color maps
            ├── mockData.js              # Synthetic demo risk data (100 records)
            └── chartUtils.jsx           # Chart helper components
```

---

## Technology Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.x |
| Bundler | Vite | 7.x |
| Language | TypeScript (Call Tree) / JavaScript (RCSA) | TS ~5.9 |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 0.563 |
| Charts | Recharts | 3.7 |
| Sankey Diagrams | D3 (d3-sankey, d3-shape) | 3.x |
| Data Import | PapaParse, JSZip, SheetJS (xlsx) | Latest |

### Backend

| Layer | Technology |
|-------|-----------|
| Database | Supabase (PostgreSQL) |
| Real-time | Supabase Realtime (Call Tree subscriptions) |
| Authentication | Supabase Auth (Anon key for client-side) |

### Development

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| TypeScript | Type checking (tsc -b) |
| Vite | Dev server, building |

---

## Module Architecture

### Code-Splitting

Both modules are lazy-loaded via React.lazy(). The root App.tsx determines which module to display based on the VITE_APP_MODE environment variable:

- Default (no mode set): Call Tree module loads
- `VITE_APP_MODE=rcsa`: RCSA module loads

This allows the two modules to be deployed independently.

### Call Tree Module (TypeScript)

Built in TypeScript for type safety given the real-time, multi-subscription data flow. Key patterns:

- **Real-time subscriptions** via Supabase `channel().on('postgres_changes')` — no polling needed
- **Custom hooks** — `useDashboardData` handles data fetching and subscription setup; `useIncident` manages the active incident
- **Tokenized prefix-matcher** — parses SMS replies by extracting the status token first, then matching remaining tokens against employee names in the MasterContacts table

### RCSA Module (JavaScript)

Built in plain JavaScript (JSX) for faster iteration and simpler onboarding for contributors less familiar with TypeScript. Uses the same component patterns as the Call Tree module.

Key patterns:
- **Filter state** held in the top-level RCSADashboard component
- **Derived data** computed via `useDashboardData` custom hook — no separate data fetching hook
- **Demo mode** — when `demoMode=true` is passed in, the dashboard loads synthetic risk data from `mockData.js` instead of querying Supabase

---

## Database Schema

The application uses Supabase (PostgreSQL) with Row Level Security (RLS) enabled. The following tables are used:

### MasterContacts

Stores the employee directory.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Employee ID (primary key) |
| `name` | text | Full name |
| `number` | text | Mobile phone number (E.164 format preferred) |
| `department` | text | Department name |
| `position` | text | Job title |
| `level` | text | Job level |
| `location` | text | Head Office or Branch |
| `status` | text | Active/inactive status |

### Responses

Stores SMS replies received during an event.

| Column | Type | Description |
|--------|------|-------------|
| `uid` | text | UUID — primary key |
| `contact` | text | Sender's phone number |
| `datetime` | timestamptz | When the SMS was received by the SMS provider |
| `contents` | text | Raw message text |
| `incident_id` | integer | (Optional) Links to incidents.id |

### Incidents

Stores call tree events.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `name` | text | Event name |
| `type` | text | 'test' or 'actual' |
| `start_time` | timestamptz | When event was started |
| `end_time` | timestamptz | When event was ended (null if active) |

### Risks (RCSA)

Stores risk register entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `department` | text | Department |
| `process_name` | text | Business process name |
| `risk_description` | text | Risk description |
| `possible_causes` | text | Root causes |
| `root_cause` | text | Root cause category |
| `event_type` | text | BSP event type |
| `control_description` | text | Existing control description |
| `control_type` | text | Preventive/Detective/Corrective/None |
| `likelihood_score` | integer | 1–4 |
| `impact_score` | integer | 1–4 |
| `controls_rating` | integer | 1–10 |
| `risk_treatment` | text | Accept/Avoid/Reduce/Transfer |
| `status` | text | Open/In Progress/Closed |
| `action_plan` | text | Remediation action plan |
| `action_plan_deadline` | date | Target completion date |
| `assessment_period` | text | e.g., "2026-Q1" |

---

## Data Flow

### Call Tree

```
SMS Blast Provider
       │
       ▼
  Supabase Responses table
       │
       ▼
  useDashboardData hook
  (subscribes via Supabase real-time)
       │
       ▼
  DashboardContent component
       │
       ├── parseResponse() ──► Status classification (Safe/Slight/Moderate/Severe)
       │
       ├── findContactByName() ──► Tokenized prefix-match against MasterContacts
       │
       └── Displays: KPI cards, charts, tables
```

SMS replies are mapped to employee contacts by matching the phone number in the `contact` field. If a phone match fails, the system attempts a name match using the tokenized prefix matcher.

### RCSA

```
HR System ──► [Manual CSV/Excel export] ──► Supabase risks table
                                                    │
                                                    ▼
                                              useDashboardData hook
                                              (REST query, no real-time)
                                                    │
                                                    ▼
                                              Filtered & aggregated
                                                    │
                                                    ▼
                                              RCSADashboard components
```

---

## Environment Configuration

Create a `.env` file in the project root (not committed to version control):

```env
# Supabase connection — used by both modules
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-or-publishable-key

# Optional: build mode (rcsa = RCSA module, empty = Call Tree module)
VITE_APP_MODE=
```

For RCSA-only deployments:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-or-publishable-key
VITE_APP_MODE=rcsa
```

### .env.example

A template is provided at `.env.example`. Copy it to `.env` and fill in your Supabase project credentials.

---

## Development Workflow

### Prerequisites

- Node.js 18 or higher
- A Supabase project (free tier works for development)

### Setup

```bash
# Install dependencies
npm install

# Create and configure environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server (Call Tree module)
npm run dev

# Start RCSA module
npm run dev:rcsa

# Expose to local network (for mobile testing)
npm run dev:host
```

### Building

```bash
# Build Call Tree module
npm run build

# Build RCSA module
npm run build:rcsa
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc -b
```

---

## Deployment

The project includes a Vercel deployment configuration (`vercel.json`). Deploy steps:

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Add environment variables in Vercel's project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
4. For the RCSA deployment, also add: `VITE_APP_MODE=rcsa`
5. Deploy.

Alternatively, build locally and deploy the `dist/` directory to any static hosting provider (Netlify, Cloudflare Pages, S3 + CloudFront, etc.).

### Multi-Module Deployment

Since both modules share the same codebase, two separate Vercel projects (or two separate deployments) are needed:

1. **Call Tree deployment** — uses default build command (`npm run build`), no special environment variables
2. **RCSA deployment** — uses `npm run build:rcsa` as build command and `VITE_APP_MODE=rcsa` as an environment variable

Both point to the same GitHub repository but use different project settings.

### Supabase Row Level Security

Ensure RLS policies are configured in your Supabase project:

- `MasterContacts` — readable by authenticated users, writable by service role or ETL processes
- `Responses` — insertable by service role (ETL process), readable by all
- `Incidents` — readable and writable by authenticated users
- `Risks` — readable and writable by authenticated users

The client-side app only requires read access to most tables. ETL/data-loading processes require insert/update access.
