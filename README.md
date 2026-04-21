# ORMSM — Operational Risk Management System Module

A real-time monitoring and risk assessment dashboard built with React and Supabase. ORMSM ships two modules: **Call Tree** for emergency employee safety and **RCSA** for risk control self-assessment.

## Modules

### Call Tree Module
A live dashboard for tracking employee safety during emergencies or business disruptions. When an incident is triggered, an SMS blast is sent to all employees and responses are collected and visualized in real time.

- **Live Dashboard** — monitors active incidents with real-time Supabase subscriptions
- **Incident Management** — start and end incidents directly from the interface
- **Response Tracking** — SMS replies are parsed using a custom tokenized prefix-matcher and classified as Safe or Severe
- **Historical Archive** — review past incidents and analyze response performance
- **Data Visualization** — Recharts-powered charts for metrics and trends

### RCSA Module
Risk Control Self-Assessment dashboard for identifying, measuring, and monitoring operational risks across the organization.

- **Risk Register** — filterable, searchable risk register with inherent and residual risk assessments
- **KPI Tracking** — key risk indicators with threshold-based monitoring and trend visualization
- **Multi-dimensional Filtering** — filter by business unit, risk category, control status, and more
- **Demo Mode** — synthetic data for demonstration and onboarding purposes
- **Sankey Diagrams** — risk flow visualization powered by D3

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Bundler | Vite 7 |
| Language | TypeScript |
| Backend / Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Recharts |
| Sankey Diagrams | D3 (d3-sankey, d3-shape) |
| Data Import | PapaParse, JSZip, SheetJS (xlsx) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Running the Dashboard

**Call Tree module (default):**
```bash
npm run dev
```

**RCSA module:**
```bash
npm run dev:rcsa
```

**With network exposure (for mobile testing):**
```bash
npm run dev:host
```

### Building

```bash
# Call Tree build
npm run build

# RCSA build
npm run build:rcsa
```

Output is generated in the `dist/` directory.

### Linting

```bash
npm run lint
```

## Documentation

Detailed documentation is available in the `docs/` folder:

- [ORMSM User Guide](docs/ORMSM-USER-GUIDE.md) — For employees using the Call Tree or RCSA modules. Covers all features, workflows, and compliance context in plain language.
- [ORMSM Technical Documentation](docs/ORMSM-TECHNICAL.md) — For developers and IT staff. Covers architecture, database schema, environment configuration, and deployment.

## License

The repository is shared publicly for **portfolio and educational purposes only**. All credentials, API keys, and company-specific data are excluded. **This code is not licensed for reuse.**
