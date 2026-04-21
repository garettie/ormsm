import { getControlsLabel } from "./riskLevels";

const RISKS = [
  // ─── Accounting Department ────────────────────────────────────────────
  {
    department: "Accounting Department",
    process_name: "General Ledger Reconciliation",
    risk_description:
      "Unreconciled general ledger accounts leading to misstatements in financial reports",
    possible_causes:
      "Manual data entry errors, delayed posting of transactions",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Monthly GL reconciliation review and sign-off by senior accountant",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement automated reconciliation tool by Q2 2026",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Accounting Department",
    process_name: "Financial Reporting",
    risk_description: "Late submission of regulatory financial reports to BSP",
    possible_causes: "Incomplete data from branches, manual consolidation",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Reporting calendar with milestone tracking and alerts",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Accounting Department",
    process_name: "Accounts Payable Processing",
    risk_description:
      "Unauthorized or duplicate vendor payments due to inadequate approval controls",
    possible_causes: "Lack of segregation of duties, weak invoice verification",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Dual approval required for payments exceeding PHP 50,000",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Accounting Department",
    process_name: "Fixed Asset Management",
    risk_description:
      "Inaccurate fixed asset register leading to incorrect depreciation calculations",
    possible_causes: "Assets not tagged or tracked on disposal",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Post-discovery adjustment of asset records after audit findings",
    control_type: "Corrective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Deploy barcode tagging system for all assets",
    action_plan_deadline: "2026-09-30",
  },
  {
    department: "Accounting Department",
    process_name: "Tax Compliance",
    risk_description:
      "Incorrect withholding tax computation resulting in BIR penalties",
    possible_causes: "Changes in tax regulations not promptly applied",
    root_cause: "External Events",
    event_type: "Clients products and business practices",
    control_description:
      "Quarterly tax compliance review by external tax consultant",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Transfer",
    status: "Open",
    action_plan: "Subscribe to automated tax update service",
    action_plan_deadline: "2026-04-30",
  },
  {
    department: "Accounting Department",
    process_name: "Petty Cash Management",
    risk_description:
      "Misuse or misappropriation of petty cash funds across branches",
    possible_causes:
      "Weak custodianship controls and infrequent surprise counts",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description: "Weekly surprise petty cash counts by internal audit",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 2,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Reduce petty cash ceiling and enforce digital reimbursement",
    action_plan_deadline: "2026-05-15",
  },

  // ─── Branch Banking Group ─────────────────────────────────────────────
  {
    department: "Branch Banking Group",
    process_name: "Cash-in-Vault Management",
    risk_description:
      "Excess cash held in branches beyond insured limits, exposing the bank to loss from theft or robbery",
    possible_causes: "Delayed cash pickups, poor cash forecasting",
    root_cause: "Process",
    event_type: "Damage to physical assets",
    control_description:
      "Daily cash position reporting and automatic alerts for thresholds",
    control_type: "Detective",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 7,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Negotiate more frequent armored car pickups",
    action_plan_deadline: "2026-04-30",
  },
  {
    department: "Branch Banking Group",
    process_name: "Account Opening",
    risk_description:
      "Onboarding of fictitious or shell accounts used for money laundering",
    possible_causes:
      "Inadequate KYC verification, pressure to meet account targets",
    root_cause: "People",
    event_type: "External fraud",
    control_description:
      "Mandatory ID verification via BSP-approved digital KYC tool",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Branch Banking Group",
    process_name: "Teller Operations",
    risk_description:
      "Cash shortages or overages at teller counters due to transaction errors",
    possible_causes: "High transaction volume, manual counting, distractions",
    root_cause: "People",
    event_type: "Execution delivery and process management",
    control_description:
      "End-of-day teller balancing with dual counting requirement",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 2,
    controls_rating: 4,
    risk_treatment: "Accept",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Branch Banking Group",
    process_name: "Customer Complaint Resolution",
    risk_description:
      "Unresolved customer complaints leading to reputational damage and BSP sanctions",
    possible_causes:
      "No centralized tracking system, lack of escalation protocol",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Complaint ticketing system with SLA tracking and escalation matrix",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement automated complaint management platform",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Branch Banking Group",
    process_name: "ATM Operations",
    risk_description:
      "ATM downtime or card skimming incidents affecting customer confidence",
    possible_causes:
      "Hardware failures, inadequate physical security of ATM sites",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "Post-incident investigation and skimming device removal protocol",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Install anti-skimming devices and CCTV at all ATM sites",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Branch Banking Group",
    process_name: "Remittance Processing",
    risk_description:
      "Errors in remittance encoding resulting in misdirected fund transfers",
    possible_causes:
      "Manual data entry, illegible remittance forms from customers",
    root_cause: "People",
    event_type: "Execution delivery and process management",
    control_description:
      "Maker-checker process for all remittance transactions",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },

  // ─── Compliance Monitoring Office ──────────────────────────────────────
  {
    department: "Compliance Monitoring Office",
    process_name: "AML/CTF Monitoring",
    risk_description:
      "Failure to detect suspicious transactions resulting in regulatory sanctions",
    possible_causes:
      "Outdated transaction monitoring rules, insufficient staffing",
    root_cause: "Systems",
    event_type: "Clients products and business practices",
    control_description:
      "Automated AML transaction monitoring system with daily alert reviews",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Compliance Monitoring Office",
    process_name: "Regulatory Reporting",
    risk_description:
      "Late or inaccurate submission of compliance reports to BSP/AMLC",
    possible_causes:
      "Manual report preparation, dependency on multiple departments",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Regulatory calendar with automated reminders and pre-submission validation",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Develop centralized regulatory reporting dashboard",
    action_plan_deadline: "2026-07-31",
  },
  {
    department: "Compliance Monitoring Office",
    process_name: "Compliance Testing",
    risk_description:
      "Compliance testing gaps that miss high-risk areas or emerging regulations",
    possible_causes: "Annual-only testing cycle, lack of risk-based scoping",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Corrective action plan issued after each testing cycle with gap remediation tracking",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 7,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Adopt continuous compliance monitoring approach",
    action_plan_deadline: "2026-08-31",
  },
  {
    department: "Compliance Monitoring Office",
    process_name: "Sanctions Screening",
    risk_description:
      "Processing transactions involving sanctioned individuals or entities",
    possible_causes: "Delayed sanctions list updates, screening system bypass",
    root_cause: "Systems",
    event_type: "External fraud",
    control_description:
      "Real-time sanctions screening integrated with core banking system",
    control_type: "Preventive",
    likelihood_score: 1,
    impact_score: 4,
    controls_rating: 2,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Compliance Monitoring Office",
    process_name: "Policy Dissemination",
    risk_description:
      "Staff unaware of updated compliance policies leading to inadvertent violations",
    possible_causes:
      "No acknowledgment tracking, policies stored in hard-to-find locations",
    root_cause: "People",
    event_type: "Employment practices and workplace safety",
    control_description:
      "Mandatory policy acknowledgment via intranet with tracking dashboard",
    control_type: "Preventive",
    likelihood_score: 3,
    impact_score: 2,
    controls_rating: 5,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Launch compliance policy e-learning module",
    action_plan_deadline: "2026-05-31",
  },

  // ─── Credit Department ─────────────────────────────────────────────────
  {
    department: "Credit Department",
    process_name: "Loan Origination",
    risk_description:
      "Approval of loans to unqualified borrowers leading to increased NPLs",
    possible_causes:
      "Incomplete credit investigation, override of credit scoring",
    root_cause: "People",
    event_type: "Clients products and business practices",
    control_description:
      "Credit committee review for all loans above PHP 500,000 with documented scorecard",
    control_type: "Preventive",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 7,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement automated credit scoring system",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Credit Department",
    process_name: "Collateral Valuation",
    risk_description:
      "Overvaluation of collateral exposing the bank to under-secured loans",
    possible_causes: "Use of non-accredited appraisers, outdated market data",
    root_cause: "External Events",
    event_type: "Clients products and business practices",
    control_description:
      "Revaluation and write-down of collateral upon discovery of overvaluation",
    control_type: "Corrective",
    likelihood_score: 3,
    impact_score: 4,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Onboard third-party digital appraisal platform",
    action_plan_deadline: "2026-07-31",
  },
  {
    department: "Credit Department",
    process_name: "Loan Monitoring",
    risk_description:
      "Deteriorating loan accounts not detected early, resulting in higher provisioning costs",
    possible_causes: "Infrequent loan reviews, no early warning system",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Monthly past-due aging reports with automatic escalation for 30+ days overdue",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Deploy loan early warning dashboard",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Credit Department",
    process_name: "Loan Documentation",
    risk_description:
      "Missing or incomplete loan documents compromising enforceability of contracts",
    possible_causes:
      "Time pressure to release loans, manual document checklist",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Digital document checklist with mandatory completion before loan release",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Credit Department",
    process_name: "DOSRI Monitoring",
    risk_description:
      "Undetected DOSRI (Directors, Officers, Stockholders, and Related Interests) loan limit breaches",
    possible_causes: "Incomplete DOSRI mapping, manual tracking",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Quarterly DOSRI certification and automated related-party transaction flagging",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Integrate DOSRI tracker with core banking system",
    action_plan_deadline: "2026-08-31",
  },
  {
    department: "Credit Department",
    process_name: "Loan Restructuring",
    risk_description:
      "Evergreening of non-performing loans through improper restructuring to hide delinquency",
    possible_causes:
      "Pressure to maintain low NPL ratios, lack of clear policy",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Post-restructuring review and reclassification of accounts found to be improperly restructured",
    control_type: "Corrective",
    likelihood_score: 3,
    impact_score: 4,
    controls_rating: 9,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Implement independent restructuring review committee",
    action_plan_deadline: "2026-05-31",
  },

  // ─── Digital Banking Department ─────────────────────────────────────────
  {
    department: "Digital Banking Department",
    process_name: "Mobile Banking Application",
    risk_description:
      "Security vulnerabilities in mobile app exposing customer data and funds",
    possible_causes: "Infrequent penetration testing, outdated libraries",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "Annual penetration testing and quarterly vulnerability scanning",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Engage external security firm for bi-annual pen testing",
    action_plan_deadline: "2026-04-30",
  },
  {
    department: "Digital Banking Department",
    process_name: "Online Fund Transfer",
    risk_description:
      "Unauthorized fund transfers through compromised customer credentials",
    possible_causes: "Phishing attacks, weak authentication mechanisms",
    root_cause: "External Events",
    event_type: "External fraud",
    control_description:
      "Multi-factor authentication and transaction limit controls",
    control_type: "Preventive",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Deploy adaptive fraud detection engine",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Digital Banking Department",
    process_name: "Digital Onboarding",
    risk_description:
      "Fraudulent account creation through synthetic identity fraud on digital channels",
    possible_causes:
      "Weak liveness detection, absence of biometric verification",
    root_cause: "External Events",
    event_type: "External fraud",
    control_description:
      "AI-powered liveness detection and real-time ID verification",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Digital Banking Department",
    process_name: "API Management",
    risk_description:
      "Third-party API integrations creating unauthorized data access pathways",
    possible_causes:
      "Inadequate API security review, excessive permissions granted",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "API gateway with rate limiting, logging, and quarterly access reviews",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement API security governance framework",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Digital Banking Department",
    process_name: "System Availability",
    risk_description:
      "Extended digital banking platform downtime impacting customer transactions",
    possible_causes:
      "Server capacity issues, single point of failure in architecture",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "99.5% uptime SLA with automated failover and real-time monitoring",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Implement cloud-based disaster recovery setup",
    action_plan_deadline: "2026-09-30",
  },

  // ─── Human Resource Department ──────────────────────────────────────────
  {
    department: "Human Resource Department",
    process_name: "Recruitment and Hiring",
    risk_description:
      "Hiring of unfit or dishonest employees due to inadequate background checks",
    possible_causes:
      "Time pressure to fill vacancies, incomplete reference verification",
    root_cause: "People",
    event_type: "Employment practices and workplace safety",
    control_description:
      "Mandatory NBI clearance, credit check, and previous employer verification",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Human Resource Department",
    process_name: "Payroll Processing",
    risk_description:
      "Payroll computation errors or ghost employees causing financial losses",
    possible_causes:
      "Manual payroll computations, delayed personnel action notices",
    root_cause: "Process",
    event_type: "Internal fraud",
    control_description:
      "Automated payroll system with mandatory headcount reconciliation before each run",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan:
      "Deploy automated payroll validation with biometric attendance integration",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Human Resource Department",
    process_name: "Employee Training",
    risk_description:
      "Insufficient training leading to operational errors and compliance violations",
    possible_causes: "No structured training program, budget constraints",
    root_cause: "People",
    event_type: "Employment practices and workplace safety",
    control_description:
      "Remedial training and performance improvement plans issued after incidents",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Launch LMS platform with compliance training modules",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Human Resource Department",
    process_name: "Employee Separation",
    risk_description:
      "Departing employees retain access to systems and confidential data",
    possible_causes: "Delayed IT access revocation, no formal exit process",
    root_cause: "Process",
    event_type: "Internal fraud",
    control_description:
      "Emergency access revocation initiated upon discovery of retained access",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 9,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Automate access revocation via HR-IT system integration",
    action_plan_deadline: "2026-04-30",
  },
  {
    department: "Human Resource Department",
    process_name: "Workplace Safety",
    risk_description:
      "Workplace injuries or health incidents due to inadequate safety protocols",
    possible_causes:
      "Non-compliance with DOLE safety standards, outdated fire equipment",
    root_cause: "External Events",
    event_type: "Employment practices and workplace safety",
    control_description:
      "Quarterly safety inspections and annual emergency drill",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },

  // ─── Information Technology Department ──────────────────────────────────
  {
    department: "Information Technology Department",
    process_name: "Core Banking System Administration",
    risk_description:
      "Core banking system outage disrupting all branch operations and customer services",
    possible_causes:
      "Hardware failure, inadequate redundancy, untested patches",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "High-availability cluster with automated failover and tested BCP",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Information Technology Department",
    process_name: "Cybersecurity Management",
    risk_description:
      "Data breach through ransomware or phishing attacks compromising customer information",
    possible_causes:
      "Insufficient endpoint protection, lack of security awareness training",
    root_cause: "External Events",
    event_type: "External fraud",
    control_description:
      "EDR solution deployed on all endpoints with 24/7 SOC monitoring",
    control_type: "Detective",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 6,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan:
      "Deploy zero-trust architecture and mandatory phishing simulations",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Information Technology Department",
    process_name: "Backup and Recovery",
    risk_description:
      "Data loss due to untested or incomplete backup procedures",
    possible_causes:
      "Backup jobs failing silently, insufficient offsite storage",
    root_cause: "Systems",
    event_type: "Business disruption and system failures",
    control_description:
      "Daily automated backups with monthly restoration drills",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Migrate to cloud-based backup with real-time replication",
    action_plan_deadline: "2026-07-31",
  },
  {
    department: "Information Technology Department",
    process_name: "User Access Management",
    risk_description:
      "Excessive or orphaned user access rights creating unauthorized data access risks",
    possible_causes:
      "No periodic access review, role changes not reflected in system",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Access revocation and privilege reset after unauthorized access discovery",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan:
      "Implement role-based access control with automated provisioning",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Information Technology Department",
    process_name: "Change Management",
    risk_description:
      "Unauthorized or untested system changes causing production incidents",
    possible_causes:
      "Bypassing change advisory board, insufficient testing environments",
    root_cause: "Process",
    event_type: "Business disruption and system failures",
    control_description:
      "Formal CAB approval process with mandatory UAT sign-off before deployment",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Information Technology Department",
    process_name: "Vendor/Third-Party IT Risk",
    risk_description:
      "Critical dependency on third-party service providers with inadequate SLA enforcement",
    possible_causes: "No vendor risk assessment, single vendor dependency",
    root_cause: "External Events",
    event_type: "Business disruption and system failures",
    control_description:
      "Annual vendor risk assessment and documented SLAs with penalty clauses",
    control_type: "Preventive",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 5,
    risk_treatment: "Transfer",
    status: "In Progress",
    action_plan:
      "Establish vendor management committee and alternative vendor roster",
    action_plan_deadline: "2026-08-31",
  },

  // ─── Internal Audit Department ──────────────────────────────────────────
  {
    department: "Internal Audit Department",
    process_name: "Risk-Based Audit Planning",
    risk_description:
      "Audit plan not covering high-risk areas resulting in undetected control gaps",
    possible_causes:
      "Reliance on prior year plan, insufficient risk assessment inputs",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Annual risk assessment with input from all department heads and board approval",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Internal Audit Department",
    process_name: "Audit Execution",
    risk_description:
      "Audit findings lack depth or fail to identify root causes of control weaknesses",
    possible_causes:
      "Inexperienced auditors, inadequate audit tools and methodologies",
    root_cause: "People",
    event_type: "Execution delivery and process management",
    control_description:
      "Peer review of all audit working papers and findings before report issuance",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Invest in continuous auditing tools and advanced training",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Internal Audit Department",
    process_name: "Audit Finding Tracking",
    risk_description:
      "Outstanding audit findings not remediated timely, weakening internal controls",
    possible_causes: "No tracking system, lack of management accountability",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Automated finding tracker with escalation to Audit Committee for overdue items",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan:
      "Implement audit management software with real-time dashboards",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Internal Audit Department",
    process_name: "Auditor Independence",
    risk_description:
      "Compromised auditor independence due to familiarity threats or management pressure",
    possible_causes:
      "Long tenure auditing same units, reporting line conflicts",
    root_cause: "People",
    event_type: "Employment practices and workplace safety",
    control_description:
      "Annual rotation of audit assignments and direct reporting line to Audit Committee",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Accept",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Internal Audit Department",
    process_name: "Quality Assurance Review",
    risk_description:
      "Internal audit function not meeting IIA Standards, risking regulatory criticism",
    possible_causes: "No quality assurance and improvement program (QAIP)",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Annual internal assessment and external quality review every 5 years",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Schedule next external quality assessment review",
    action_plan_deadline: "2026-12-31",
  },

  // ─── Legal Department ──────────────────────────────────────────────────
  {
    department: "Legal Department",
    process_name: "Contract Review and Management",
    risk_description:
      "Unfavorable contract terms due to insufficient legal review before execution",
    possible_causes:
      "Departments signing without legal clearance, time pressure",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Mandatory legal sign-off for all contracts above PHP 100,000",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Legal Department",
    process_name: "Litigation Management",
    risk_description:
      "Adverse court decisions resulting in significant financial losses for the bank",
    possible_causes: "Weak case management, delayed evidence gathering",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Quarterly litigation review with external counsel and board reporting",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Transfer",
    status: "In Progress",
    action_plan:
      "Establish legal reserve fund and engage standby litigation counsel",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Legal Department",
    process_name: "Regulatory Change Monitoring",
    risk_description:
      "Non-compliance due to failure to identify and implement new regulatory requirements",
    possible_causes: "No systematic regulatory tracking, information silos",
    root_cause: "External Events",
    event_type: "Execution delivery and process management",
    control_description:
      "Subscription to BSP circular alerts with impact assessment within 15 days",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Develop regulatory change management framework",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Legal Department",
    process_name: "Data Privacy Compliance",
    risk_description:
      "Violation of Data Privacy Act resulting in NPC sanctions and customer trust loss",
    possible_causes:
      "Inadequate privacy impact assessments, unclear data handling procedures",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Data Protection Officer oversight with annual privacy impact assessments",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Conduct bank-wide data mapping and privacy impact assessment",
    action_plan_deadline: "2026-07-31",
  },
  {
    department: "Legal Department",
    process_name: "Board and Corporate Governance",
    risk_description:
      "Governance lapses exposing the bank to regulatory penalties and shareholder action",
    possible_causes: "Incomplete board minutes, delayed corporate filings",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Corporate secretary checklist and annual governance self-assessment",
    control_type: "Preventive",
    likelihood_score: 1,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Accept",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },

  // ─── Loans and Assets Management Department ────────────────────────────
  {
    department: "Loans and Assets Management Department",
    process_name: "Loan Collection",
    risk_description:
      "Ineffective collection efforts leading to rising past-due accounts and NPL ratios",
    possible_causes: "Understaffed collection team, no predictive analytics",
    root_cause: "People",
    event_type: "Execution delivery and process management",
    control_description:
      "Manual follow-up calls and demand letters after accounts become past due",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 4,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Deploy AI-assisted collection prioritization tool",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Loans and Assets Management Department",
    process_name: "ROPA Management",
    risk_description:
      "Acquired properties (ROPA) deteriorating in value or remaining unsold beyond regulatory holding period",
    possible_causes: "Lack of active marketing, poor property maintenance",
    root_cause: "Process",
    event_type: "Damage to physical assets",
    control_description:
      "Quarterly ROPA valuation and active disposition plan with board reporting",
    control_type: "Detective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 7,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Partner with real estate brokers for accelerated disposal",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Loans and Assets Management Department",
    process_name: "Loan Foreclosure",
    risk_description:
      "Legal challenges to foreclosure proceedings causing delays and additional costs",
    possible_causes:
      "Defective loan documentation, borrower legal counterclaims",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Pre-foreclosure legal review checklist and documentation completeness audit",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Strengthen pre-foreclosure due diligence protocol",
    action_plan_deadline: "2026-07-31",
  },
  {
    department: "Loans and Assets Management Department",
    process_name: "Write-Off Processing",
    risk_description:
      "Premature or improper write-off of loans without exhausting all recovery avenues",
    possible_causes:
      "Insufficient documentation of collection efforts, policy non-compliance",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Board approval required for write-offs with mandatory collection effort documentation",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Accept",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Loans and Assets Management Department",
    process_name: "Loan Restructuring Assessment",
    risk_description:
      "Restructured loans re-defaulting due to unrealistic repayment terms",
    possible_causes: "Weak borrower capacity assessment during restructuring",
    root_cause: "People",
    event_type: "Clients products and business practices",
    control_description:
      "Updated financial analysis and stress testing before restructuring approval",
    control_type: "Preventive",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Develop standardized restructuring viability scorecard",
    action_plan_deadline: "2026-05-31",
  },

  // ─── Marketing Department ──────────────────────────────────────────────
  {
    department: "Marketing Department",
    process_name: "Product Development",
    risk_description:
      "Launch of new deposit or loan products without adequate risk assessment",
    possible_causes:
      "Pressure to meet revenue targets, bypassing product approval committee",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Mandatory product approval committee review with risk, compliance, and legal sign-off",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Marketing Department",
    process_name: "Advertising and Promotions",
    risk_description:
      "Misleading marketing claims resulting in customer complaints and BSP sanctions",
    possible_causes:
      "Inadequate legal/compliance review of marketing materials",
    root_cause: "People",
    event_type: "Clients products and business practices",
    control_description:
      "Compliance review checklist for all advertising materials prior to publication",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Marketing Department",
    process_name: "Customer Data Analytics",
    risk_description:
      "Unauthorized use of customer data for marketing purposes violating data privacy",
    possible_causes:
      "Customer consent not properly obtained, data sharing without DPO approval",
    root_cause: "Process",
    event_type: "Clients products and business practices",
    control_description:
      "Data usage policy with DPO clearance and customer consent verification",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement customer consent management platform",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Marketing Department",
    process_name: "Brand Reputation Management",
    risk_description:
      "Negative social media exposure damaging the bank's reputation and customer trust",
    possible_causes:
      "Slow response to online complaints, no social media monitoring",
    root_cause: "External Events",
    event_type: "Clients products and business practices",
    control_description:
      "Social media monitoring tool with crisis communication protocol",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 5,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Establish dedicated social media response team",
    action_plan_deadline: "2026-04-30",
  },
  {
    department: "Marketing Department",
    process_name: "Financial Literacy Programs",
    risk_description:
      "Failure to deliver mandated financial literacy programs to underserved communities",
    possible_causes: "Budget constraints, no program tracking and reporting",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Annual financial literacy plan with quarterly progress reporting to BSP",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 2,
    controls_rating: 4,
    risk_treatment: "Accept",
    status: "In Progress",
    action_plan: "Partner with LGUs for community financial literacy sessions",
    action_plan_deadline: "2026-05-31",
  },

  // ─── Risk Management Office ────────────────────────────────────────────
  {
    department: "Risk Management Office",
    process_name: "Enterprise Risk Management",
    risk_description:
      "Incomplete risk identification resulting in unmanaged exposures across the bank",
    possible_causes:
      "Risk register not updated, departments not providing timely risk inputs",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Quarterly risk register update with mandatory department attestation",
    control_type: "Preventive",
    likelihood_score: 3,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Deploy automated risk register with real-time dashboards",
    action_plan_deadline: "2026-03-31",
  },
  {
    department: "Risk Management Office",
    process_name: "Capital Adequacy Assessment",
    risk_description:
      "Underestimation of capital requirements leading to regulatory capital shortfall",
    possible_causes:
      "Inaccurate risk-weighted asset calculations, outdated models",
    root_cause: "Systems",
    event_type: "Execution delivery and process management",
    control_description:
      "Monthly capital adequacy ratio monitoring with stress testing",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Risk Management Office",
    process_name: "Operational Risk Event Tracking",
    risk_description:
      "Operational risk events not captured or analyzed, preventing lessons learned",
    possible_causes: "No incident reporting culture, manual event collection",
    root_cause: "People",
    event_type: "Execution delivery and process management",
    control_description:
      "Post-incident root cause analysis and corrective action issuance",
    control_type: "Corrective",
    likelihood_score: 4,
    impact_score: 3,
    controls_rating: 8,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Launch bank-wide operational risk event reporting portal",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Risk Management Office",
    process_name: "Business Continuity Planning",
    risk_description:
      "Business continuity plans untested or outdated, resulting in prolonged disruptions",
    possible_causes:
      "No annual BCP testing, changes in operations not reflected in plans",
    root_cause: "Process",
    event_type: "Business disruption and system failures",
    control_description:
      "Annual BCP drill with post-drill gap analysis and plan updates",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Conduct tabletop exercise with all critical departments",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Risk Management Office",
    process_name: "Key Risk Indicator Monitoring",
    risk_description:
      "Key risk indicators (KRIs) not triggering timely risk responses due to poor calibration",
    possible_causes:
      "Thresholds not validated against historical data, inconsistent reporting",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Monthly KRI dashboard with color-coded breach alerts to senior management",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 5,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan:
      "Recalibrate all KRI thresholds based on 3-year historical data",
    action_plan_deadline: "2026-04-30",
  },

  // ─── Security and Safety Department ────────────────────────────────────
  {
    department: "Security and Safety Department",
    process_name: "Physical Security of Premises",
    risk_description:
      "Branch robbery or break-in due to inadequate physical security measures",
    possible_causes:
      "Non-functional CCTV, untrained security personnel, weak entry controls",
    root_cause: "People",
    event_type: "Damage to physical assets",
    control_description:
      "24/7 CCTV monitoring, armed security guards, and panic alarm systems",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Security and Safety Department",
    process_name: "Cash-in-Transit Operations",
    risk_description:
      "Loss of cash during transit between branches and head office",
    possible_causes:
      "Inadequate armored vehicle usage, predictable transit routes",
    root_cause: "External Events",
    event_type: "Damage to physical assets",
    control_description:
      "Armed escort, GPS-tracked armored vehicles, and randomized routes",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Transfer",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Security and Safety Department",
    process_name: "Fire Safety Compliance",
    risk_description:
      "Fire incidents at bank premises due to outdated fire suppression equipment",
    possible_causes:
      "Expired fire extinguishers, non-functional sprinkler systems",
    root_cause: "External Events",
    event_type: "Damage to physical assets",
    control_description:
      "Emergency response and fire damage containment procedures activated post-incident",
    control_type: "Corrective",
    likelihood_score: 3,
    impact_score: 4,
    controls_rating: 7,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Replace all fire suppression systems older than 5 years",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Security and Safety Department",
    process_name: "Incident Response",
    risk_description:
      "Delayed or disorganized response to security incidents leading to escalation",
    possible_causes:
      "No standardized incident response plan, unclear communication protocols",
    root_cause: "Process",
    event_type: "Damage to physical assets",
    control_description:
      "Documented incident response playbook with regular tabletop exercises",
    control_type: "Preventive",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Conduct quarterly security incident response drills",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Security and Safety Department",
    process_name: "Access Control Management",
    risk_description:
      "Unauthorized after-hours access to restricted areas like vaults and server rooms",
    possible_causes:
      "Shared access cards, broken biometric readers, no access logs review",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Biometric access control with daily access log monitoring",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "Open",
    action_plan: "Deploy upgraded biometric system with real-time alerting",
    action_plan_deadline: "2026-04-30",
  },

  // ─── Treasury Department ───────────────────────────────────────────────
  {
    department: "Treasury Department",
    process_name: "Liquidity Management",
    risk_description:
      "Liquidity shortfall preventing the bank from meeting maturing obligations",
    possible_causes:
      "Asset-liability maturity mismatch, unexpected large withdrawals",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Daily liquidity position reporting with minimum liquidity coverage ratio monitoring",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Treasury Department",
    process_name: "Investment Portfolio Management",
    risk_description:
      "Investment losses due to unauthorized trading or exceeding risk appetite limits",
    possible_causes:
      "Trader exceeding position limits, lack of independent risk oversight",
    root_cause: "People",
    event_type: "Internal fraud",
    control_description:
      "Real-time position limit monitoring and independent middle-office valuation",
    control_type: "Detective",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Treasury Department",
    process_name: "Interest Rate Risk Management",
    risk_description:
      "Adverse impact on net interest income from sudden interest rate movements",
    possible_causes: "Unhedged rate-sensitive positions, poor gap analysis",
    root_cause: "External Events",
    event_type: "Execution delivery and process management",
    control_description:
      "Monthly interest rate sensitivity analysis and duration gap reporting to ALCO",
    control_type: "Detective",
    likelihood_score: 3,
    impact_score: 3,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan:
      "Implement automated ALM system for real-time rate sensitivity analysis",
    action_plan_deadline: "2026-06-30",
  },
  {
    department: "Treasury Department",
    process_name: "Counterparty Risk Assessment",
    risk_description:
      "Exposure to defaulting counterparties in interbank or investment transactions",
    possible_causes:
      "Inadequate counterparty credit review, concentration risk",
    root_cause: "External Events",
    event_type: "External fraud",
    control_description:
      "Counterparty credit limits and annual credit review with concentration monitoring",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 4,
    controls_rating: 4,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Develop automated counterparty exposure dashboard",
    action_plan_deadline: "2026-05-31",
  },
  {
    department: "Treasury Department",
    process_name: "Regulatory Reserve Requirements",
    risk_description:
      "Non-compliance with BSP reserve requirements resulting in penalties",
    possible_causes: "Computation errors, delayed reserve adjustments",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "Automated daily reserve computation with compliance threshold alerts",
    control_type: "Preventive",
    likelihood_score: 1,
    impact_score: 4,
    controls_rating: 2,
    risk_treatment: "Reduce",
    status: "Closed",
    action_plan: null,
    action_plan_deadline: null,
  },
  {
    department: "Treasury Department",
    process_name: "Foreign Exchange Operations",
    risk_description:
      "Foreign exchange losses from unhedged positions or erroneous FX transactions",
    possible_causes:
      "Lack of FX hedging strategy, manual transaction processing",
    root_cause: "Process",
    event_type: "Execution delivery and process management",
    control_description:
      "FX position limits with end-of-day P&L reporting and maker-checker for trades",
    control_type: "Preventive",
    likelihood_score: 2,
    impact_score: 3,
    controls_rating: 3,
    risk_treatment: "Reduce",
    status: "In Progress",
    action_plan: "Implement automated FX trading and reconciliation platform",
    action_plan_deadline: "2026-07-31",
  },
];

export function generateMockRisks() {
  return RISKS.map((r, i) => {
    const inherent = r.likelihood_score * r.impact_score;
    // Derive residual from inherent score modulated by controls quality
    const controlStrength = Math.max(0, (11 - r.controls_rating) / 10);
    const resL = Math.max(
      1,
      Math.round(r.likelihood_score * (1 - controlStrength * 0.4)),
    );
    const resImp = Math.max(
      1,
      Math.round(r.impact_score * (1 - controlStrength * 0.3)),
    );
    const residual = resL * resImp;

    return {
      ...r,
      id: `mock-${i}`,
      inherent_risk_score: inherent,
      residual_risk_score: residual,
      control_rating: getControlsLabel(r.controls_rating),
      assessment_period: "2026-Q1",
    };
  });
}
