# ORMSM System Documentation

## 1. System Overview
The Operational Risk Management & System Monitoring (ORMSM) application is a web-based dashboard suite designed for real-time crisis management and operational risk tracking. 

The system consists of two primary modules:
*   **Call Tree Dashboard:** An emergency response tracking system. It aggregates employee check-in data during critical events, parsing natural language responses to determine safety status and identify personnel requiring assistance.
*   **RCSA (Risk Control Self-Assessment) Dashboard:** A centralized interface for tracking departmental risks, evaluating the effectiveness of internal controls, and monitoring mitigation action plans.

## 2. Technical Architecture
The application is built as a Single Page Application (SPA) utilizing a modern frontend stack connected to a cloud-hosted relational database.

*   **Frontend Framework:** React 19, built with Vite.
*   **Styling:** Tailwind CSS.
*   **Database:** PostgreSQL (currently hosted via Supabase).
*   **Data Access Layer:** The current iteration utilizes the Supabase client SDK for direct-to-database queries via PostgREST. 
*   **Intended Enterprise Architecture:** For enterprise deployment, the direct-to-database client calls should be abstracted. The intended architecture requires a standard API middleware layer (e.g., REST or GraphQL) to handle database interactions, authentication, and webhook ingestion securely.

## 3. Data Ingestion & Automation Lifecycle
The system relies on external data sources for employee directories and SMS responses. The current state utilizes manual ingestion for prototyping and validation, with automated ingestion defined as the required production state.

### 3.1 Employee Directory
*   **Current State:** Extracted from the HR system as an `Employee List.xls` file and manually uploaded into the application to populate the `MasterContacts` table.
*   **Target Production State:** The API middleware should implement a nightly sync with the enterprise HRIS (e.g., Active Directory, Workday) to automatically update employee records, departments, and contact numbers.

### 3.2 SMS Incident Responses
*   **Current State:** Incident responses are exported from the SMS provider portal as a ZIP/CSV file and manually uploaded into the application to populate the `Responses` table.
*   **Target Production State:** The API middleware must expose a secure webhook endpoint. The SMS provider will be configured to push real-time response payloads directly to this webhook, eliminating manual intervention and enabling real-time dashboard updates.

## 4. Core Business Logic
The most critical logic resides in the Call Tree module, specifically the parsing and matching algorithms in `src/modules/calltree/hooks/useDashboardData.ts`. If the data access layer is moved to a backend API, this logic must be ported.

### 4.1 Response Parsing (`parseResponse`)
The system does not rely on strict keyword matching from users. It parses natural language strings to determine status:
*   Tokens are stripped of punctuation and lowercased.
*   The system scans for mapped keywords (e.g., "1", "safe", "unaffected", "ok" map to `Safe`; "4", "severe", "help" map to `Severe`).
*   If a status is found, the remaining text is extracted as a potential "Name" (used when employees reply from borrowed phones).

### 4.2 Contact Matching Hierarchy
When a response is received, the system attempts to link it to a specific employee in the `MasterContacts` table using a waterfall approach:
1.  **Name Match:** If the parser extracted a name, it searches the contact directory. If an exact match is found, the phone number is logged into `ContactAltNumbers` to auto-match future messages from that device.
2.  **Primary Phone Match:** The system checks if the incoming number matches a known `number` in the `MasterContacts` table.
3.  **Alternate Phone Match:** The system checks the `ContactAltNumbers` table for previously validated secondary devices.
4.  **Unknown:** If all fail, the message is flagged in the "Unknown Responses" queue for manual admin review.

## 5. Database Schema & Models
The PostgreSQL database consists of several core tables necessary for the application to function. 

*   `MasterContacts`: The core employee directory (Name, Department, Primary Number, Location).
*   `ContactAltNumbers`: Dynamically populated table linking secondary phone numbers to `MasterContacts` records based on name-matching logic.
*   `incidents`: Tracks discrete emergency events (`id`, `start_time`, `end_time`, `is_targeted`).
*   `event_contacts`: A junction table used for "targeted" incidents, linking specific employees to a specific incident rather than broadcasting to the entire company.
*   `Responses`: The raw log of incoming SMS messages (`datetime`, `contact` number, `contents`).
*   `risks`: The core table for the RCSA module, tracking risk descriptions, likelihood/impact scores, control ratings, and action plans.
*   `processes`: Defines department-level processes that risks are tied to.

*(Note: Provide the included `schema.sql` file to the database administration team to generate these tables.)*

## 6. Setup & Deployment
To run the frontend application:

1.  Clone the repository and run `npm install`.
2.  Create a `.env` file in the root directory.
3.  Provide the necessary environment variables required for the database connection (currently `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`).
4.  Execute `npm run dev` to start the local development server, or `npm run build` to generate the static assets for production deployment.