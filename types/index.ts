export type CompanyType = 'startup' | 'mnc' | 'enterprise';
export type OpportunityType = 'internship' | 'full-time';
export type TechRole =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'ai-ml'
  | 'data-science'
  | 'devops'
  | 'mobile'
  | 'other';

export type LocationType = 'remote' | 'hybrid' | 'on-site';

export interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  company_type?: CompanyType | null;
  company_logo_url?: string | null;
  opportunity_type: OpportunityType;
  tech_role: TechRole | string;
  target_batches: number[];
  is_fresher_eligible: boolean;
  min_exp_years: number;
  location_type: LocationType;
  city?: string | null;
  country: string;
  full_description_html?: string | null;
  requirements_bullets?: string[] | null;
  stipend_or_salary?: string | null;
  apply_url: string;
  source_platform: string;
  posted_at?: string;
  expires_at?: string | null;
  is_active: boolean;
}

export interface HackathonRound {
  round_num: number;
  name: string;
  date: string;
  details: string;
}

export type HackathonMode = 'online' | 'offline' | 'hybrid';

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  banner_image_url: string;
  mode: HackathonMode;
  venue_city?: string | null;
  venue_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  themes: string[];
  start_date?: string | null;
  end_date?: string | null;
  registration_deadline: string;
  problem_statement?: string | null;
  rounds_description?: HackathonRound[] | null;
  prizes_summary?: string | null;
  apply_url: string;
  platform: string;
  created_at?: string;
  is_active: boolean;
  distance_km?: number; // client computed
}

export interface SyncLog {
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  source?: string;
}
