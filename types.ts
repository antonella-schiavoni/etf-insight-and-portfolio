
export enum RiskLevel {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive'
}

export interface ETFRecommendation {
  ticker: string;
  name: string;
  category: string;
  allocation: number; // Percentage 0-100
  reasoning: string;
  riskRating: 'Low' | 'Medium' | 'High';
  expenseRatio?: string;
  recentPerformance?: string; // e.g. "+5.2% (30d)"
  exchange?: string; // e.g. "AMS", "XETRA", "LSE"
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MarketPulse {
  overview: string;
  topSectors: { name: string; url?: string }[];
  recentTrends: string[];
  lastUpdated: string;
}

export interface AnalysisResult {
  recommendations: ETFRecommendation[];
  summary: string;
  riskAssessment: string;
  sources: GroundingSource[];
}
