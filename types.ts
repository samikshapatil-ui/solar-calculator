
export type UserCategory = 'Residential' | 'Commercial' | 'Industrial';
export type RooftopUnit = 'Sq. Meter' | 'Sq. Feet';

export interface SolarInputData {
  systemSize: number;
  monthlyGeneration: number;
  annualGeneration: number;
  location: string;
  category: UserCategory;
  currency: string;
  unitCost: number;
  // New Rooftop Fields
  rooftopAreaValue: number;
  rooftopAreaUnit: RooftopUnit;
  usableAreaPercentage: number;
  name: string;
  phone: string;
  email: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIAdviceResponse {
  summary: string;
  benefits: string[];
  environmental_impact: string;
  recommendations: string[];
  sources?: GroundingSource[];
}

export interface AppState {
  loading: boolean;
  error: string | null;
  data: SolarInputData | null;
  aiResponse: AIAdviceResponse | null;
  showSuccessMessage: boolean;
}
