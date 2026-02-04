export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface CountryOption {
  value: string;
  label: string;
  country: Country;
}

export interface Submission {
  id: string;
  country_code: string;
  country_name: string;
  display_name: string | null;
  created_at: string;
  session_id: string;
}

export interface CountryCount {
  country_code: string;
  country_name: string;
  count: number;
}

export interface SubmitRequest {
  country_code: string;
  country_name: string;
  display_name?: string;
  session_id: string;
}

export interface StatsResponse {
  countries: CountryCount[];
  total: number;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  stats?: StatsResponse;
}

export type ChartType = 'bar' | 'pie';
