
import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, AnalysisResult, MarketPulse } from "../types";

export const analyzeETFs = async (
  query: string,
  riskLevel: RiskLevel,
  pastedContent?: string,
  deepAnalysis: boolean = false,
  europeanFocus: boolean = false
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const riskInstructions = {
    [RiskLevel.CONSERVATIVE]: "Focus on Low-Volatility, Dividend Aristocrats, Fixed Income, and Physical Gold ETFs. Prioritize wealth preservation over high-speed growth.",
    [RiskLevel.MODERATE]: "Focus on Broad Market Indices (S&P 500, MSCI World) and moderate sector diversification. A balance of growth and stability.",
    [RiskLevel.AGGRESSIVE]: "Focus on High-Growth Thematic ETFs (AI, Semiconductor, Cyber Security, Crypto), Leveraged ETFs, or small-cap growth. Prioritize capital appreciation and outperforming the benchmark regardless of volatility."
  };

  const prompt = `
    Task: Extract and analyze the latest ETF data for a PROFITABLE investment strategy.
    
    Target Profile:
    - User Risk Level: ${riskLevel}
    - Specific Strategy: ${riskInstructions[riskLevel]}
    - Market Focus: ${europeanFocus ? "STRICTLY European Markets (Euronext Amsterdam, Xetra, LSE)" : "Global"}
    
    Data Source Instructions:
    - SOURCE OF TRUTH (High Returns): Access and index results from 'https://es.tradingview.com/markets/etfs/funds-highest-returns/'.
    - SOURCE OF TRUTH (Technical Details): Access and index results from 'https://www.justetf.com/en/search.html?search=ETFS'.
    - EXTRACT: Tickers, TER (Expense Ratio), Dividend Yield, and 1-year performance directly from these listing indices.
    - VALIDATE: Ensure ETFs are actively traded and suggest the specific exchange (e.g., AMS for Amsterdam).

    Context:
    - User Query/Interests: ${query}
    ${pastedContent ? `- Additional User-Provided Data: ${pastedContent}` : ""}

    Rules:
    1. STRICT REQUIREMENT: You MUST suggest EXACTLY 6 profitable ETFs matching the risk profile.
    2. For ${riskLevel}, ensure the 'recentPerformance' and 'reasoning' clearly reflect why it fits that specific risk bucket.
    3. Include Exchange data (e.g., AMS, XETRA).
    
    Output Format: JSON only.
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
          minItems: 6,
          maxItems: 6,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              allocation: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              riskRating: { type: Type.STRING },
              expenseRatio: { type: Type.STRING },
              recentPerformance: { type: Type.STRING },
              exchange: { type: Type.STRING }
            },
            required: ["ticker", "name", "category", "allocation", "reasoning", "riskRating"]
          }
        },
        summary: { type: Type.STRING },
        riskAssessment: { type: Type.STRING }
      },
      required: ["recommendations", "summary", "riskAssessment"]
    }
  };

  if (deepAnalysis) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: config
  });

  const parsedData = JSON.parse(response.text || "{}");

  const sources: any[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "External Source",
          uri: chunk.web.uri
        });
      }
    });
  }

  return {
    ...parsedData,
    sources
  };
};

export const getMarketPulse = async (): Promise<MarketPulse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Search the web (focusing on es.tradingview.com/markets/etfs/funds-highest-returns/ and justetf.com) for the last 30-90 days of ETF performance data.
    1. Identify the TOP 10 performing ETF sectors globally.
    2. For each sector, find a relevant URL from TradingView or JustETF.
    3. Provide a concise summary of current market trends.
    
    Return as JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          topSectors: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["name"]
            } 
          },
          recentTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
          lastUpdated: { type: Type.STRING }
        },
        required: ["overview", "topSectors", "recentTrends", "lastUpdated"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
