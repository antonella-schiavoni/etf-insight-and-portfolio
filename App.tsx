
import React, { useState, useEffect } from 'react';
import { RiskLevel, AnalysisResult, MarketPulse } from './types';
import { analyzeETFs, getMarketPulse } from './services/geminiService';
import RiskSelector from './components/RiskSelector';
import PortfolioChart from './components/PortfolioChart';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.MODERATE);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [europeanFocus, setEuropeanFocus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [marketPulse, setMarketPulse] = useState<MarketPulse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPulse();
  }, []);

  const fetchPulse = async () => {
    setPulseLoading(true);
    try {
      const pulse = await getMarketPulse();
      setMarketPulse(pulse);
    } catch (err) {
      console.error("Failed to fetch market pulse", err);
    } finally {
      setPulseLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeETFs(
        query || 'High-profitability growth ETFs', 
        riskLevel, 
        emailContent,
        deepAnalysis,
        europeanFocus
      );
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError('Market grounding failed. We tried indexing TradingView and JustETF results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-slate-800 leading-none">EQUITY HUB</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-bold mt-1">Intelligence Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={fetchPulse}
               disabled={pulseLoading}
               className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200 hover:bg-white transition-all group"
             >
                <div className={`w-2 h-2 rounded-full ${pulseLoading ? 'bg-orange-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">
                  {pulseLoading ? 'Sourcing Returns...' : 'Market Pulse Live'}
                </span>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Section: Market Pulse / Monthly Trends */}
        <section className="mb-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">Monthly Market Pulse</h2>
                  <p className="text-sm text-slate-500 font-medium italic">Grounded Analysis via <a href="https://es.tradingview.com/markets/etfs/funds-highest-returns/" target="_blank" rel="noreferrer" className="text-blue-600 underline">TradingView Returns</a> & JustETF</p>
                </div>
                {marketPulse && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grounded Data As Of</div>
                    <div className="text-sm font-black text-slate-700">{marketPulse.lastUpdated}</div>
                  </div>
                )}
              </div>

              {pulseLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-20 bg-slate-50 rounded"></div>
                </div>
              ) : marketPulse ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <p className="text-slate-600 leading-relaxed font-medium mb-6 text-lg italic border-l-4 border-blue-500 pl-6">
                      "{marketPulse.overview}"
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {marketPulse.recentTrends.map((trend, i) => (
                        <div key={i} className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg shadow-slate-200">
                          {trend}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-4 bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Top 10 Sectors (Performance)</h4>
                      <a 
                        href="https://es.tradingview.com/markets/etfs/funds-highest-returns/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[8px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest"
                      >
                        [Source: TradingView]
                      </a>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2">
                      {marketPulse.topSectors.map((sector, i) => (
                        <li key={i} className="flex items-center group">
                          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-[8px] font-black mr-3 shrink-0">{i+1}</div>
                          <a 
                            href={sector.url || "#"} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs font-bold text-slate-700 hover:text-blue-600 truncate group-hover:underline"
                          >
                            {sector.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Connect to fetch latest market intelligence
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Strategy Settings</h2>
                <a 
                  href="https://es.tradingview.com/markets/etfs/funds-highest-returns/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  View TradingView Returns
                </a>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Focus for Profitability</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Technology, Renewables..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Knowledge Ingestion</label>
                  <textarea
                    rows={4}
                    placeholder="Paste data for specific analysis..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-800">Thinking Mode</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gemini 3 Pro Logic</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={deepAnalysis}
                        onChange={() => setDeepAnalysis(!deepAnalysis)}
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-blue-800">Europe Focus</div>
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">AMS / Euronext Data</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={europeanFocus}
                        onChange={() => setEuropeanFocus(!europeanFocus)}
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Risk Tolerance</h2>
              <RiskSelector value={riskLevel} onChange={setRiskLevel} />
              
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`w-full py-5 mt-6 rounded-[1.5rem] font-black uppercase tracking-widest text-sm text-white shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  loading ? 'bg-slate-400 shadow-none cursor-wait' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-blue-200'
                }`}
              >
                {loading ? (
                   <span className="flex items-center gap-3">
                     <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>{deepAnalysis ? 'Deep Reasoning...' : 'Indexing Returns...'}</span>
                   </span>
                ) : (
                  <>
                    <span>Generate Portfolio (6 ETFs)</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </>
                )}
              </button>
            </section>
          </div>

          {/* Result Terminal */}
          <div className="lg:col-span-8 space-y-8">
            {!result && !loading && (
              <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-300">
                <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                   <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                   </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight italic">Portfolio Terminal</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-loose">
                  Connected to TradingView & JustETF Search Feed. Optimization focus: {europeanFocus ? "AMS / Euronext" : "Global Markets"}.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] text-red-800 flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div>
                  <h4 className="font-black text-xl mb-1">Retrieval Failed</h4>
                  <p className="text-sm font-bold opacity-70">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-6">
                <div className="bg-white rounded-[3rem] p-16 border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                   <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-8 border-slate-50 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <svg className={`w-8 h-8 text-blue-600 ${deepAnalysis ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                         </svg>
                      </div>
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                     {deepAnalysis ? "Performing Deep Logic" : "Indexing Market High-Returns"}
                   </h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                     Sourcing top performance from TradingView & technicals from JustETF
                   </p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Result Header */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                  <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]"></div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 relative z-10">
                    <div className="md:col-span-8">
                       <div className="flex items-center gap-3 mb-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${deepAnalysis ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300' : 'bg-blue-500/20 border-blue-400/30 text-blue-300'}`}>
                             {deepAnalysis ? 'Deep Analysis Strategy' : 'Returns-Grounded Strategy'}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{riskLevel} Profile</span>
                       </div>
                       <h2 className="text-4xl font-black mb-6 tracking-tight leading-none">High-Alpha Portfolio</h2>
                       <p className="text-slate-300 leading-relaxed font-bold text-lg opacity-80">
                         {result.summary}
                       </p>
                    </div>
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-white/5 rounded-[2.5rem] p-6 border border-white/5">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Asset Distribution</h4>
                       <PortfolioChart recommendations={result.recommendations} />
                    </div>
                  </div>
                </div>

                {/* Recommendations Stack - Tiles one behind the other */}
                <div className="flex flex-col gap-6">
                  {result.recommendations.map((etf, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        transform: `translateY(${i * 4}px)`, 
                        zIndex: result.recommendations.length - i,
                        boxShadow: `0 ${20 + i * 5}px ${50 + i * 10}px -12px rgba(0,0,0,0.1)` 
                      }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group relative w-full"
                    >
                       <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                               #{i+1}
                             </div>
                             <div>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{etf.ticker}</span>
                                <h3 className="font-bold text-slate-400 text-xs truncate uppercase tracking-widest">{etf.name}</h3>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-3xl font-black text-blue-600 tabular-nums leading-none">
                                {etf.allocation}<span className="text-sm font-bold">%</span>
                             </div>
                             {etf.recentPerformance && (
                               <div className="text-[10px] font-black text-emerald-500 uppercase mt-1 tracking-tighter">
                                 {etf.recentPerformance}
                               </div>
                             )}
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-2 mb-6">
                          <span className="text-[9px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{etf.category}</span>
                          <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                            etf.riskRating === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            etf.riskRating === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            'bg-orange-50 text-orange-600 border-orange-100'
                          }`}>
                            {etf.riskRating} Risk
                          </span>
                          {etf.exchange && (
                            <span className="text-[9px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                              {etf.exchange}
                            </span>
                          )}
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                         {etf.reasoning}
                       </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
                  <div className="lg:col-span-7 bg-blue-600 rounded-[3rem] p-10 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.5h7c-.47 4.34-2.85 8.16-7 9.49V11.5H5V6.3l7-3.11v8.31z"/></svg>
                    </div>
                    <h4 className="text-xl font-black mb-4 tracking-tight flex items-center gap-3">
                       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4"/></svg>
                       </div>
                       Grounded Risk Assessment
                    </h4>
                    <p className="text-blue-100 leading-relaxed font-bold italic text-lg opacity-90">
                      {result.riskAssessment}
                    </p>
                  </div>

                  <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">
                       Intelligence Feed Sources
                    </h4>
                    <div className="space-y-4">
                       {result.sources.slice(0, 6).map((source, i) => (
                         <a 
                           key={i} 
                           href={source.uri} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-between group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                         >
                            <span className="text-xs font-black text-slate-800 truncate max-w-[200px]">{source.title}</span>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                         </a>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Info Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 py-4 z-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Primary Data Feed: <a href="https://es.tradingview.com/markets/etfs/funds-highest-returns/" target="_blank" rel="noreferrer" className="text-blue-600">TradingView High-Returns</a>
           </p>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
             AI Data Terminal • Not Financial Advice • 6-ETF Balanced Strategy
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
