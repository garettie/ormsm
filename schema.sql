-- ORMSM Database Schema
-- Exported from Supabase for architecture documentation
-- You can replace the contents of this file with a fresh export if needed.

CREATE TABLE public.ContactAltNumbers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contact_id text NOT NULL,
  number text NOT NULL UNIQUE,
  source_response_id text,
  created_at timestamp with time zone DEFAULT now(),
  contact_name text,
  CONSTRAINT ContactAltNumbers_pkey PRIMARY KEY (id)
);

CREATE TABLE public.MasterContacts (
  name text NOT NULL,
  location text,
  department text,
  position text,
  number text,
  id text NOT NULL UNIQUE,
  level text,
  status text,
  CONSTRAINT MasterContacts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.Responses (
  datetime timestamp with time zone NOT NULL,
  contact text NOT NULL,
  contents text,
  uid text NOT NULL UNIQUE,
  receivedtime timestamp with time zone DEFAULT now(),
  CONSTRAINT Responses_pkey PRIMARY KEY (uid)
);

CREATE TABLE public.incidents (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['test'::text, 'actual'::text])),
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  is_targeted boolean DEFAULT false,
  CONSTRAINT incidents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.event_contacts (
  id bigint NOT NULL DEFAULT nextval('event_contacts_id_seq'::regclass),
  incident_id integer,
  name text,
  number text,
  department text,
  location text,
  position text,
  level text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT event_contacts_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id)
);

CREATE TABLE public.processes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department text NOT NULL,
  process_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT processes_pkey PRIMARY KEY (id)
);

CREATE TABLE public.risks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department text NOT NULL,
  risk_description text NOT NULL,
  possible_causes text,
  root_cause text NOT NULL CHECK (root_cause = ANY (ARRAY['People'::text, 'Process'::text, 'Systems'::text, 'External Events'::text])),
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['Execution delivery and process management'::text, 'Business disruption and system failures'::text, 'External fraud'::text, 'Employment practices and workplace safety'::text, 'Internal fraud'::text, 'Damage to physical assets'::text, 'Clients products and business practices'::text])),
  likelihood_score integer NOT NULL CHECK (likelihood_score >= 1 AND likelihood_score <= 4),
  impact_score integer NOT NULL CHECK (impact_score >= 1 AND impact_score <= 4),
  inherent_risk_score integer NOT NULL,
  control_description text,
  control_design_score integer CHECK (control_design_score >= 1 AND control_design_score <= 4),
  control_implementation_score integer CHECK (control_implementation_score >= 1 AND control_implementation_score <= 4),
  residual_risk_score integer CHECK (residual_risk_score >= 1 AND residual_risk_score <= 16),
  risk_treatment text CHECK (risk_treatment = ANY (ARRAY['Accept'::text, 'Avoid'::text, 'Reduce'::text, 'Transfer'::text])),
  action_plan text,
  action_plan_deadline date,
  responsible_department text,
  status text CHECK (status = ANY (ARRAY['Open'::text, 'In Progress'::text, 'Closed'::text])),
  assessment_period text,
  created_at timestamp with time zone DEFAULT now(),
  controls_rating integer CHECK (controls_rating >= 1 AND controls_rating <= 16),
  process_id uuid,
  process_name text,
  control_type text CHECK (control_type = ANY (ARRAY['Preventive'::text, 'Detective'::text, 'Corrective'::text, 'None'::text])),
  CONSTRAINT risks_pkey PRIMARY KEY (id),
  CONSTRAINT risks_process_id_fkey FOREIGN KEY (process_id) REFERENCES public.processes(id)
);