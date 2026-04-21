# ORMSM — User Guide

**Operational Risk Management System Module**

ORMSM is an internal web application used by [Organization] to manage two critical operational risk functions: emergency employee safety and enterprise risk self-assessment. It is a browser-based tool — no installation required — and is designed to work on desktop and tablet screens.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Call Tree Module — Employee Safety](#call-tree-module--employee-safety)
3. [RCSA Module — Risk Self-Assessment](#rcsa-module--risk-self-assessment)
4. [Compliance Context](#compliance-context)
5. [Frequently Asked Questions](#frequently-asked-questions)

---

## System Overview

ORMSM has two independent modules. Your access and use of each depends on how the system is launched:

| Module | Purpose | Access |
|--------|---------|--------|
| **Call Tree** | Emergency employee safety during incidents | Default view |
| **RCSA** | Risk and control self-assessment across departments | Toggle via top navigation |

You can switch between modules at any time using the module switcher in the top navigation bar.

### Browser Compatibility

ORMSM works best on Chrome, Edge, or Firefox. It is not optimized for mobile phones.

---

## Call Tree Module — Employee Safety

### What Is the Call Tree?

The Call Tree is an emergency notification and response tracking system. When an incident occurs — a natural disaster, a system outage, a security threat, or any event that affects employee safety — the organization needs to quickly determine which employees are safe and which may need assistance.

Rather than making hundreds of individual phone calls, the Call Tree automates this by sending SMS (text messages) to all employees simultaneously. Employees reply with a simple code, and their responses appear in real time on this dashboard.

### Key Concepts

**Event** — An incident that triggers the call tree. Two types:

- **Test Event** — A drill or rehearsal. Used to ensure the system works without triggering full emergency procedures.
- **Actual Event** — A real emergency. Triggers the full response protocol.

**Incident** — Synonym for "Event" used throughout the system.

**Contact** — An employee in the system. Each contact has a name, department, mobile phone number, and location (Head Office or Branch).

**Response** — An employee's SMS reply to the call tree. Responses are automatically classified as:

| Status | Meaning |
|--------|---------|
| **Safe** | Employee confirmed they are unharmed |
| **Slight** | Minor issue (e.g., minor injury, delayed commute) |
| **Moderate** | Moderate impact (e.g., significant property damage, being unable to travel) |
| **Severe** | Urgent assistance needed |
| **No Response** | Employee has not replied yet |

The system determines status by reading keywords in the SMS reply. For example, replying with "1" or "safe" maps to Safe; replying with "4" or "help" maps to Severe.

**Response Rate** — The percentage of all contacts who have replied. A low response rate during an active incident is a warning sign.

---

### Starting an Event

Only authorized personnel (typically Security, HR, or Risk Management) should initiate a Call Tree event.

1. Click **Start New Event** on the Call Tree dashboard.
2. Enter an **Event Name** that clearly describes the situation (e.g., "Fire Drill — Head Office 2026" or "Typhoon Rosal — Branch Network").
3. Select the **Event Type**:
   - **TEST** — Use for drills. This will not trigger full emergency protocols.
   - **ACTUAL** — Use for real emergencies. This immediately activates the full response protocol.
4. Click **Start**.

Once started, the banner at the top of the dashboard changes to indicate an active event is in progress. An SMS blast is sent to all employees in the system automatically.

> **Note:** Starting an event does not automatically send SMS. The SMS sending is handled by a separate SMS blast provider integrated with the organization's systems. The Call Tree dashboard receives and displays the responses once employees begin replying.

---

### The Live Dashboard

When an event is active, the dashboard displays real-time response data. It updates automatically — you do not need to refresh the page.

#### KPI Cards (Top Row)

These five cards give an at-a-glance summary:

| Card | What It Shows |
|------|--------------|
| **Total Contacts** | Total number of employees in the system |
| **Responded** | Number who have replied, expressed as a percentage |
| **Safe** | Number who confirmed they are safe |
| **Affected** | Number who reported any level of impact (Slight, Moderate, or Severe) |
| **Pending** | Number who have not yet replied |

Clicking any KPI card filters the entire dashboard to show only employees matching that category.

#### Status Donut Chart

A circular chart showing the breakdown of responses by status. Hover over a segment to see the exact count and percentage.

#### Response Rate Donut

Shows what percentage of employees have replied versus still pending.

#### Response Timeline

A line chart showing when responses arrived. This helps identify if response volume is increasing as expected, or if certain time periods had particularly high/low reply rates.

#### Department and Location Breakdown

Two bar charts showing response distribution by:
- **Department** — Which departments have the most respondents
- **Location** — Head Office vs. Branch breakdown

---

### The Responses Table

The main table below the charts lists every employee who has responded. You can see:

- **Name** — Employee's full name
- **Department**
- **Location** — Head Office or Branch
- **Status** — Their confirmed safety status
- **Response Time** — When their SMS reply was received
- **Contents** — The raw text of their message

The table is sorted by response time by default, so the most recent replies appear first.

#### Unknown Responses

Some SMS replies cannot be automatically matched to an employee — for example, if the employee's name in the system differs from how they signed their message, or if the reply is ambiguous. These appear in the **Unknown Responses** table.

If you see an unknown response, you can manually identify the employee by reviewing the message content and contact details, then record the response manually.

#### Pending Responses

The **Pending** table shows employees who have not yet responded. During an active incident, this list should be small. If many employees are still pending, consider whether follow-up contact is needed.

---

### Filtering the Dashboard

Use the **Filters** panel above the KPI cards to narrow down the data by:

- **Department** — Show only employees from specific departments
- **Location** — Head Office or Branch
- **Level** — Job level or position type
- **Status** — Show only Safe, Affected, or Pending employees

Filters are applied across all charts and tables simultaneously. Click a KPI card to activate the corresponding filter, or manually select filter options and click **Apply**.

---

### Ending an Event

When the incident is resolved, click **End Event** in the active event banner. Confirm the action. The event will move to the historical record.

> Once an event is ended, no new SMS responses for that event will be processed. Make sure all expected responses have been received before ending.

---

### Incident History

The **History** view (accessible via the History/Live toggle button) lets you review past events. Select any past incident from the list to view the full response data as it appeared at the end of that event.

This is useful for:
- Post-incident reviews
- Verifying that response rates met targets
- Identifying departments or locations with consistently low response rates

---

### Uploading Data

The dashboard receives data from the organization's SMS and HR systems. However, you can also manually upload data files in two formats:

#### Employee List (for adding or updating contacts)

1. Click **Upload Data** on the dashboard toolbar.
2. Select the **Employee List** tab.
3. Upload an Excel file (.xls or .xlsx) containing the employee roster.
   - The file must follow the organization's standard HR export format.
   - Required columns: Department, Employee ID, Full Name, Position, Contact No, Status, Level.
   - The system skips the first 4 rows of the file (header rows in the standard export).
   - Inactive employees (resigned, terminated) are automatically excluded.
   - Duplicate records are detected and removed automatically.
4. The system will display a summary: how many employees were synced, and how many duplicate or inactive records were removed.

#### Response Data (for loading SMS replies)

1. Click **Upload Data** and select the **Response Data** tab.
2. Upload a CSV file or a ZIP archive containing a CSV.
   - Required columns: `From Presentation` (phone number), `Client Submit Time`, `Message`.
3. The system parses the file and loads the response records into the database.

> **Tip:** Response data files are typically provided by the SMS blast provider after an event. Upload them after the event ends to complete the record.

---

## RCSA Module — Risk Self-Assessment

### What Is RCSA?

RCSA stands for **Risk and Control Self-Assessment**. It is a structured process where each department identifies the risks inherent in their day-to-day operations, evaluates how well their controls work, and documents what still needs to be done.

This module gives the Risk Management team and department heads a unified view of the organization's risk landscape — which risks are biggest, which controls are weakest, and which risks have overdue action plans.

### Key Concepts

**Risk** — Something that could go wrong in a business process. Each risk is described by:

- **Risk Description** — What the risk is (e.g., "Unauthorized payments due to weak invoice verification")
- **Possible Causes** — What typically leads to this risk materializing
- **Affected Process** — The business process where the risk exists

**Inherent Risk Score** — How serious the risk would be if no controls existed. Calculated as:

`Likelihood Score × Impact Score`

Both scores range from 1 (lowest) to 4 (highest).

| Inherent Risk Score | Rating |
|---------------------|--------|
| 1–3 | Minor |
| 4–6 | Moderate |
| 7–9 | Major |
| 10–16 | Critical |

**Control** — A measure already in place to reduce the risk. Controls are rated:

| Controls Rating | Label | Meaning |
|----------------|-------|---------|
| 1–3 | **Strong** | Controls are working well |
| 4–6 | **Satisfactory** | Controls are adequate but could be improved |
| 7–9 | **Needs Improvement** | Significant control gaps exist |
| 10 | **Unsatisfactory** | Controls are not effective |

**Residual Risk Score** — The remaining risk after controls are applied. This is derived by factoring in how effective the existing controls are.

**Risk Treatment** — What the department plans to do with the remaining risk:

| Treatment | Meaning |
|-----------|---------|
| **Reduce** | Take action to lower the risk (most common) |
| **Accept** | The risk is within appetite; no action needed |
| **Avoid** | Stop the activity that creates the risk |
| **Transfer** | Transfer the risk (e.g., through insurance) |

**Root Cause** — The underlying category of why the risk exists:

- People
- Process
- Systems
- External Events

**Event Type** — The operational risk category the risk belongs to (based on BSP's standard operational risk classification):

- Execution, Delivery, and Process Management
- Business Disruption and System Failures
- External Fraud
- Internal Fraud
- Employment Practices and Workplace Safety
- Damage to Physical Assets
- Clients, Products, and Business Practices

**Assessment Period** — The quarter or reporting period the assessment applies to (e.g., 2026-Q1).

**Status** — The current state of the risk entry:

| Status | Meaning |
|--------|---------|
| **Open** | Risk has been identified; action plan is pending or in progress |
| **In Progress** | An active action plan is being executed |
| **Closed** | The risk has been adequately addressed or the action plan is complete |

---

### Dashboard Overview

The RCSA dashboard is divided into several sections:

#### Header / Filter Bar

Use the filter bar to narrow down the risk register by:

- **Assessment Period** — Select a specific quarter
- **Department** — View risks for specific departments
- **Status** — Open, In Progress, or Closed
- **Inherent Risk Level** — Minor, Moderate, Major, or Critical
- **Control Rating** — Strong, Satisfactory, Needs Improvement, Unsatisfactory

The **Clear All** button resets all filters.

#### KPI Cards (Top Row)

| Card | What It Shows |
|------|--------------|
| **Open Risks** | Total number of risks not yet closed |
| **Overdue Actions** | Action plans past their deadline |
| **Avg. Controls Score** | Average control effectiveness across all visible risks (color-coded) |
| **Avg. Residual Level** | Average residual risk level across all visible risks (color-coded) |

Clicking any KPI card filters the data to show only the relevant items.

#### Charts Row

Four small charts on the left show:

- **Control Types** — Breakdown of controls by type (Preventive, Detective, Corrective, None)
- **Root Cause** — Distribution of risks by root cause category
- **Inherent Risk Heatmap** — A grid showing inherent risk scores across likelihood and impact dimensions
- **Risk Treatment** — How risks are being handled (Reduce, Accept, Avoid, Transfer)

One large chart on the right:

- **Event Type** — Shows the distribution of risks across BSP's seven event type categories. Toggle between a bar chart and a Sankey diagram using the buttons above the chart.

  The **Sankey diagram** is a flow visualization. It shows how risks flow from root causes → event types → inherent risk levels. Click any node to filter the register to show only risks connected to that element.

Below the Event Type chart:

- **Residual Risk by Department** — A horizontal bar chart comparing residual risk levels across all departments.

#### Risk Register Table

Below the charts, the full risk register displays every risk matching your current filters. Each row shows:

- Department
- Process Name
- Risk Description
- Root Cause
- Event Type
- Control Type
- Inherent Risk Score and Level
- Control Rating
- Risk Treatment
- Status
- Action Plan (if any)
- Action Plan Deadline

Click any row to open a detailed modal with the full risk information.

Click **Open Full Register** to view the complete risk register in a modal with all columns and full text.

---

### Using Demo Mode

If the dashboard cannot connect to the live database, click **Load Demo Data** on the error screen. Demo mode loads 100 synthetic risk records so you can explore the dashboard's features without connecting to the live system.

Demo mode is clearly labeled in the header so you always know whether you are viewing real or sample data.

---

## Compliance Context

ORMSM is designed to support [Organization]'s compliance with the following Bangko Sentral ng Pilipinas (BSP) regulatory requirements:

### Operational Risk Management

**BSP Circular No. 1107 (Series of 2018)** — Risk Governance Framework
Sets the expectation that banks maintain a comprehensive risk management system covering all material risk types, including operational risk. The RCSA module supports this by providing a structured, documented self-assessment process where each department identifies and evaluates its operational risks and the effectiveness of controls.

**BSP Operational Risk Management Guidelines** — Under the Basel II/III framework adopted by the Philippines
Requires banks to identify, assess, monitor, and control operational risks. The RCSA module's risk register, inherent and residual risk scoring, and control ratings directly support the identify and assess components of this framework.

### Business Continuity Management

**BSP Circular No. 951, Series of 2016** — Policy on Business Continuity Management
Requires banks to have a tested Business Continuity Plan (BCP) and to conduct regular drills. The Call Tree module supports BCP execution by providing a real-time channel to account for all employees during and after a disruption event. The Incident History feature provides documentation of drills and actual events, supporting the BSP's requirement for BCP testing records.

**BSP Circular No. 900 (Series of 2015)** — Information Security Management
Addresses operational resilience and incident response. The Call Tree module's ability to rapidly confirm employee safety status during a disruption supports the human element of incident response.

### RCSA and the Three Lines Model

The RCSA module reflects the **Three Lines Model** (formerly Three Lines of Defense) recognized by the Institute of Internal Auditors and endorsed by the BSP:

1. **First Line** — Business units own and manage their risks. RCSA places the risk identification and control assessment responsibility with each department head.
2. **Second Line** — Risk Management and Compliance oversee risk management. The Risk Management Office uses the RCSA dashboard to monitor and aggregate risk information across all departments.
3. **Third Line** — Internal Audit provides independent assurance. RCSA outputs (risk registers, control assessments, action plans) provide audit evidence of the bank's risk management activities.

### Data Retention and Record-Keeping

Both modules maintain permanent records of:
- All call tree events (test and actual), including response rates and employee statuses
- Risk assessments by period, department, and risk category

These records support BSP supervisory examination requirements and internal audit requests.

---

## Frequently Asked Questions

### General

**Q: Do I need an internet connection to use ORMSM?**
A: Yes. ORMSM is a web-based application that connects to a cloud database. It requires an active internet connection. It does not work offline.

**Q: Who can see my department's risk data in RCSA?**
A: Access is controlled by the organization's authentication system. Typically, department heads can see their own department's risks. Risk Management and senior leadership can see all departments.

**Q: Can I export data from ORMSM?**
A: The Risk Register displays data that you can review on screen. For formal exports, contact the IT or Risk Management team to generate reports directly from the database.

---

### Call Tree

**Q: The dashboard shows "No Response" for everyone. What does this mean?**
A: It means the SMS blast has not yet received replies, or the response data has not been uploaded yet. If you are in an active event and expecting replies, check with whoever manages the SMS blast to confirm messages were sent.

**Q: An employee says they replied but their name is not on the list. What happened?**
A: Their reply may have been classified as an "Unknown Response" — a reply that could not be automatically matched to an employee record. Check the Unknown Responses table. If their name appears there with a clear message, you can record their status manually.

**Q: Can I add a new employee during an active event?**
A: Yes. Upload the updated employee list via Upload Data. New employees will appear in the dashboard after the next refresh.

**Q: I started a Test event by mistake. Can I cancel it?**
A: You can end the event immediately by clicking End Event. A test event with no duration is still recorded in history but causes minimal disruption.

---

### RCSA

**Q: A risk in our department shows "Closed" but we still have an open action plan. Why?**
A: A risk may be marked Closed when the control improvement has been verified, even if the formal action plan is still being finalized. If you believe a risk has been prematurely closed, contact the Risk Management Office.

**Q: How often should the risk register be updated?**
A: The standard practice is a full RCSA cycle every quarter (every 3 months), with departments reviewing and attesting to their risks each period. The Risk Management Office may require updates outside of the cycle if significant new risks emerge.

**Q: The Sankey diagram is hard to read. Is there another view?**
A: Yes. Use the toggle button above the Event Type chart to switch between the Sankey diagram and a standard bar chart. The bar chart may be easier to read for presentations or when viewing on smaller screens.

**Q: What does "Demo Mode" mean?**
A: Demo Mode means the dashboard is showing synthetic (made-up) data rather than your organization's actual risk register. This happens automatically if the live database connection fails. Switch to live data by resolving the connection issue or contact IT.
