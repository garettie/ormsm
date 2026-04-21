# ORMSM Call Tree Module: Technical Specification

This document provides technical, system-level documentation of the **Call Tree Module**, a subsystem within the Operational Risk Management System Module (ORMSM). Its purpose is to onboard new developers or serve as context for an AI assistant to understand the system's underlying architecture and data flow.

---

## 1. System Architecture overview
The Call Tree module is built around a decoupled architecture where data ingestion is handled primarily via Python scripts interacting with an external SMS Blast provider, and data persistence is managed by a Supabase (PostgreSQL) backend.

### Technical Stack
- **Database:** Supabase (PostgreSQL)
- **Ingestion/ETL Scripts:** Python (e.g., `sprout-clean.py`)
- **External Integration:** 3rd Party SMS Blast Module (via manual/automated extract delivery)
- **Frontend/Dashboard:** TypeScript-based Web UI (integrated with the wider ORMSM dashboard bundle)

---

## 2. Data Flow & Integration Points

The data pipeline relies on two primary data streams: State Configuration (Contacts) and State Mutation (Responses).

### 2.1 Contacts Ingestion Pipeline (Master Contacts)
1. **Source Data:** HR Database CSV/Excel export provided through the IT-managed SMS Blast module.
2. **Transform (ETL):** `sprout-clean.py`
   - Ingests the raw HR employee `.xls` export.
   - Cleans the records: normalizes phone numbers (converts local "09" prefixes to country code "639"), strips formatting characters from names, and splits departments to differentiate "Head Office" versus "Branch" locations.
   - Excludes inactive employees (e.g., "resigned" or "terminated") and deduplicates records.
3. **Load:** Pushes active employees to the Supabase database via an upsert utilizing the employee `id`.
4. **Reconciliation:** Fetches the active DB payload and recursively deletes stale or inactive users.
5. **Target Table:** `MasterContacts`

### 2.2 Response Ingestion Pipeline (Message Reports)
When a call tree is executed, an SMS is broadcasted using the Sender ID **AGRIBANK**.
1. **Source Data:** SMS message reply reports downloaded from the SMS Blast provider (as `.zip` or `.csv`).
2. **Transform (ETL):** `response-etl.py`
   - Unzips and loads the raw SMS logs, strictly validating required columns.
   - Normalizes contact phone numbers by appending a `+` prefix where needed.
   - Maps the implicit columns (`From Presentation` -> `contact`, `Client Submit Time` -> `datetime`, `Message` -> `contents`) and generates a UUID (`uid`).
   - *Note:* This script acts strictly as a dumb data-pipe. It does **not** parse the severity levels or resolve missing names itself.
3. **Load:** Performs a direct `POST` payload insertion of unstructured response logs into Supabase.
4. **Target Table:** `Responses`

### 2.3 Call Tree Logic (Application Layer)
Because `response-etl.py` pushes raw data directly, the actual intelligence takes place at the system's application level (refer to `useDashboardData.ts`):
- **Severity Classification (`parseResponse`):** The application evaluates the raw string against a `STATUS_MAPPING` dictionary. Messages mapped to "1", "safe", "ok", or "unaffected" result in `Safe`, while "4", "severe", "help", or "critical" evaluate to `Severe`. Once identified, the severity token is spliced out of the text, leaving the remainder of the text designated as the employee `name`.
- **Custom Fuzzy Matching (`findContactByName`):** Instead of standard fuzzy string distance calculations, the system employs a custom tokenized prefix-matcher. The leftover `name` string is split into individual search tokens. The algorithm checks if *every* search token forms a prefix for at least one token in the `MasterContacts` employee's full name. For example, a text replying `"1 John S"` successfully matches against `"John Smith"`.
- **Ambiguity Detection:** To prevent false positive assignments, if a partial name matches multiple valid employees, the matching logic explicitly drops the entry into an `unknownResponses` queue requiring manual dashboard intervention.

---

## 3. Database Schema Mapping (Supabase)

*(Note: The following assumes strict typing based on system behaviors).*

### `MasterContacts` Table
Serves as the source of truth for the Call Tree audience.
- `id` (text, likely unique identifier)
- `name` (text, employee's full name)
- `number` (text, mobile number for SMS matching)
- `department` (text)
- `position` (text)
- `location` (text)
- `level` (text)
- `status` (text)

### `Responses` Table
Logs individual status transactions triggered during an event.
- `uid` (text, unique identifier)
- `datetime` (timestamp with time zone, timestamp of processing)
- `receivedtime` (timestamp with time zone, when the SMS was natively received)
- `contact` (text, maps to the sender's details/number)
- `contents` (text, contains the raw message or parsed severity status)

---

## 4. Known Constraints & Considerations
- **Manual Triggers:** Currently, invoking `sprout-clean.py` and `response-etl.py` rely on manual extraction. (A potential future enhancement is hooking into Webhooks to automate this via Supabase Edge Functions / AWS Lambda).
- **Fuzzy Match Execution:** Because name attribution and severity parsing happens asynchronously in the application layer via fuzzy matching, matching edge cases (e.g., severe misspellings) may require manual review via the dashboard.
- **Dashboard Synchronization:** The Dashboard reads directly from Supabase. Ensure Row Level Security (RLS) is appropriately scoped to allow the frontend readonly access, whilst ensuring Python ETL credentials have `INSERT`/`UPDATE` authority.
