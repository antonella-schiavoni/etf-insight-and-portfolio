
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, AnalysisResult, KnowledgeSnippet, FTMarketIntelligence } from "../types";

export const analyzeETFs = async (
  query: string,
  riskLevel: RiskLevel,
  knowledgeBase: KnowledgeSnippet[],
  deepAnalysis: boolean = false,
  europeanFocus: boolean = false
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const riskInstructions = {
    [RiskLevel.CONSERVATIVE]: "Focus on Low-Volatility, Dividend Aristocrats, and Fixed Income.",
    [RiskLevel.MODERATE]: "Focus on Broad Market Indices and Balanced Growth.",
    [RiskLevel.AGGRESSIVE]: "Focus on High-Growth Thematic ETFs and Semiconductors."
  };

  const combinedKnowledge = knowledgeBase.map(k => `Source (${new Date(k.timestamp).toLocaleDateString()}): ${k.content}`).join("\n\n---\n\n");

  const prompt = `
    Task: Act as a senior Quant Analyst. Generate a balanced 6-ETF long-term portfolio.
    
    INTELLIGENCE CONTEXT:
    """
    ${combinedKnowledge || "No specific local knowledge provided. Use general market data."}
    """

    TARGET PARAMETERS:
    - User Strategy Query: ${query}
    - Risk Profile: ${riskLevel} (${riskInstructions[riskLevel]})
    - Regional Focus: ${europeanFocus ? "European Exchanges" : "Global"}
    
    INSTRUCTIONS:
    1. Synthesize the intelligence provided.
    2. Search the web for actual ETF data (Price, ROI, Expense Ratios).
    3. Construct a 6-ETF portfolio with specific allocation percentages.
    4. Provide an 'alignmentScore' (0-100) reflecting how well this portfolio matches the provided intelligence context.

    Output: JSON only.
  `;

  const modelName = deepAnalysis ? "gemini-3-pro-preview" : "gemini-3-flash-preview";
  
  const config: any = {
    tools: [{ googleSearch: {} }],
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              allocation: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              growthDriver: { type: Type.STRING },
              riskRating: { type: Type.STRING },
              expenseRatio: { type: Type.STRING },
              dividendYield: { type: Type.STRING },
              exchange: { type: Type.STRING },
              historicalReturns: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, value: { type: Type.STRING } } }
              },
              topHoldings: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, weight: { type: Type.STRING } } }
              },
              sectorExposure: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { sector: { type: Type.STRING }, weight: { type: Type.STRING } } }
              }
            }
          }
        },
        summary: { type: Type.STRING },
        riskAssessment: { type: Type.STRING },
        alignmentScore: { type: Type.NUMBER },
        alignmentReasoning: { type: Type.STRING }
      },
      required: ["recommendations", "summary", "riskAssessment", "alignmentScore", "alignmentReasoning"]
    }
  };

  if (deepAnalysis) {
    config.thinkingConfig = { thinkingBudget: 24000 };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: config
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeIntelligence = async (userInput?: string): Promise<FTMarketIntelligence> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = userInput 
    ? `Analyze this specific market intelligence content (likely from a Financial Times newsletter or email):
       """
       ${userInput}
       """
       
       1. Extract 4-5 key market takeaways.
       2. Determine sentiment (Bullish/Bearish/Neutral).
       3. Identify trending sectors.
       4. Using Google Search, find 3 specific ETFs that directly capitalize on the themes in this text.
       
       Output structured JSON.`
    : `Search for the latest market trends from FT.com (Financial Times) newsletters.
       1. Extract 4-5 key market takeaways for the current week.
       2. Determine overall market sentiment.
       3. Identify trending sectors.
       4. Find 3 specific ETFs that benefit from these trends.
       
       Output structured JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketSentiment: { type: Type.STRING },
          sentimentReasoning: { type: Type.STRING },
          topTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
          trendingSectors: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, impact: { type: Type.STRING } } } 
          },
          longTermOpportunities: { 
            type: Type.ARRAY, 
            items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, explanation: { type: Type.STRING } } } 
          },
          strategicRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ticker: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                riskRating: { type: Type.STRING },
                expenseRatio: { type: Type.STRING },
                dividendYield: { type: Type.STRING },
                historicalReturns: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { period: { type: Type.STRING }, value: { type: Type.STRING } } }
                },
                sectorExposure: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { sector: { type: Type.STRING }, weight: { type: Type.STRING } } }
                },
                topHoldings: {
                    type: Type.ARRAY,
                    items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, weight: { type: Type.STRING } } }
                }
              }
            }
          },
          lastUpdated: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
