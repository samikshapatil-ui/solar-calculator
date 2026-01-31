
export type UserCategory = 'Residential' | 'Commercial' | 'Industrial';
export type RooftopUnit = 'Sq. Meter' | 'Sq. Feet';

// Represents a web source link from Google Search grounding
export interface GroundingSource {
  title: string;
  uri: string;
}

// Represents the structured response from the solar analyst AI
export interface AIAdviceResponse {
  summary: string;
  benefits: string[];
  environmental_impact: string;
  recommendations: string[];
  sources?: GroundingSource[];
}

export interface SolarInputData {
  systemSize: number;
  monthlyGeneration: number;
  annualGeneration: number;
  location: string;
  category: UserCategory;
  currency: string;
  unitCost: number;
  rooftopAreaValue: number;
  rooftopAreaUnit: RooftopUnit;
  usableAreaPercentage: number;
  name: string;
  phone: string;
  email: string;
}

export interface AppState {
  loading: boolean;
  error: string | null;
  data: SolarInputData | null;
  aiResponse: AIAdviceResponse | null;
  showSuccessMessage: boolean;
}
