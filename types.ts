
export enum RiskLevel {
  CONSERVATIVE = 'Conservative',
  MODERATE = 'Moderate',
  AGGRESSIVE = 'Aggressive'
}

export interface HistoricalReturn {
  period: string; // "1Y", "3Y", "5Y", "10Y"
  value: string;  // e.g. "+45.2%"
}

export interface Holding {
  name: string;
  weight: string;
}

export interface SectorExposure {
  sector: string;
  weight: string;
}

export interface ETFRecommendation {
  ticker: string;
  name: string;
  category: string;
  allocation: number;
  reasoning: string;
  growthDriver: string;
  riskRating: 'Low' | 'Medium' | 'High';
  expenseRatio: string;
  dividendYield: string;
  exchange: string;
  historicalReturns: HistoricalReturn[];
  topHoldings: Holding[];
  sectorExposure: SectorExposure[];
  fullDescription: string;
}

export interface KnowledgeSnippet {
  id: string;
  content: string;
  timestamp: number;
  sourceType: 'Email' | 'Web' | 'Manual';
}

export interface AnalysisResult {
  recommendations: ETFRecommendation[];
  summary: string;
  riskAssessment: string;
  alignmentScore?: number; // 0-100 score of how well this matches current knowledge
  alignmentReasoning?: string;
  sources: string[];
}

export interface SavedPortfolio {
  id: string;
  name: string;
  timestamp: number;
  riskLevel: RiskLevel;
  query: string;
  result: AnalysisResult;
}

export interface FTMarketIntelligence {
  marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentReasoning: string;
  topTakeaways: string[];
  trendingSectors: { name: string; impact: 'Positive' | 'Negative' | 'Mixed' }[];
  longTermOpportunities: { theme: string; explanation: string }[];
  lastUpdated: string;
  strategicRecommendations?: ETFRecommendation[];
}
