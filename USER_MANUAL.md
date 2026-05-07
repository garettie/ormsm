# ORMSM User Manual

## 1. What is ORMSM?
The Operational Risk Management & System Monitoring (ORMSM) application is a dual-purpose dashboard. It gives management real-time visibility into two critical areas:
1.  **Emergency Response (Call Tree):** Tracking the safety and whereabouts of employees during a crisis or disaster.
2.  **Risk Management (RCSA):** Monitoring departmental operational risks, controls, and action plans.

## 2. Why do we need it?
During an emergency, tracking down hundreds of employees via SMS, chat, and phone calls is chaotic. The Call Tree module organizes that chaos into a single dashboard, automatically figuring out who is safe, who needs help, and who hasn't answered yet. 

On the day-to-day side, the RCSA module replaces scattered spreadsheets with a centralized view of company risks, ensuring that high-priority issues are tracked and mitigated.

## 3. Who is this for?
*   **HR / Crisis Management Teams:** To monitor employee safety, broadcast emergency alerts, and coordinate rescue or assistance efforts.
*   **Risk Officers:** To log departmental risks, rate internal controls, and track mitigation deadlines.
*   **Department Heads:** To view the risk profile and incident response rates of their specific teams.

---

## 4. How to Use: The Call Tree Dashboard

The Call Tree dashboard is your command center during an emergency. It matches incoming text messages from employees to your official staff directory.

### Step 1: Update the Employee Directory
Before an incident occurs, the system needs to know who works here.
1.  Export the current employee list from the HR system as an Excel file (`Employee List.xls`).
2.  Navigate to the Contacts section of the ORMSM dashboard.
3.  Upload the file. The system will update the master directory with current names, departments, and phone numbers.

### Step 2: Start an Incident
When a crisis occurs (e.g., severe weather, facility issue):
1.  Click **New Incident**.
2.  Name the event (e.g., "Typhoon Tracker - Sept 2024").
3.  Choose whether this is a **Company-Wide** event or a **Targeted** event (only affecting specific departments or locations). 
4.  Start the incident. 

### Step 3: Log Responses
As employees reply to the emergency SMS broadcast, their responses need to be fed into the system.
1.  Export the raw SMS response log from the SMS provider portal.
2.  Navigate to the Incident Dashboard and upload the response file.
3.  The system will automatically read the messages, link the phone numbers to the employee directory, and categorize their status (Safe, Slight, Moderate, Severe).

### Step 4: Monitor the Dashboard
Once data is uploaded, the main dashboard will populate:
*   **Status Charts:** See exactly how many people are safe versus how many require immediate assistance.
*   **Demographic Breakdown:** View response rates separated by department or location to see if specific offices are unresponsive.
*   **Unknown Responses:** If an employee replies from an unregistered phone number, the system will flag it here. Admins can read the message (e.g., "This is John Smith, I am safe") and manually link it to John Smith's profile.

---

## 5. How to Use: The RCSA Dashboard

The Risk Control Self-Assessment (RCSA) module tracks operational health. 

### Viewing the Risk Profile
*   **The Heatmap:** The main screen displays a heatmap of current risks, categorized by Likelihood and Impact. Risks in the "red" zone require immediate attention.
*   **Department Filters:** Use the dropdowns at the top to filter the dashboard for a specific department (e.g., "Show me only IT risks").
*   **Root Cause Analysis:** Review the charts to see if most of your risks are caused by People, Processes, Systems, or External Events.

### Managing Risks
When a risk is identified in a department:
1.  Log the risk description, root cause, and potential impact.
2.  Document the **Controls** currently in place to stop the risk (e.g., "Dual approval required for payments").
3.  Score the control. If the control is weak, assign an **Action Plan** and a deadline to fix it.
4.  Monitor the Status column. Risks should move from "Open" to "In Progress" to "Closed" as action plans are completed.