
import React, { useState, useEffect } from 'react';
import { RiskLevel, AnalysisResult, ETFRecommendation, KnowledgeSnippet, FTMarketIntelligence } from './types';
import { analyzeETFs, analyzeIntelligence } from './services/geminiService';
import RiskSelector from './components/RiskSelector';

type DisplayMetric = '1Y' | 'Policy' | 'TER';
type AppTab = 'intel' | 'portfolio';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('intel');
  const [query, setQuery] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeSnippet[]>([]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.MODERATE);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [intelLoading, setIntelLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [intelResult, setIntelResult] = useState<FTMarketIntelligence | null>(null);
  const [selectedETF, setSelectedETF] = useState<ETFRecommendation | null>(null);
  const [metric, setMetric] = useState<DisplayMetric>('1Y');

  useEffect(() => {
    const sKnowledge = localStorage.getItem('equity_hub_knowledge');
    if (sKnowledge) setKnowledgeBase(JSON.parse(sKnowledge));
  }, []);

  const saveKnowledge = (kb: KnowledgeSnippet[]) => {
    setKnowledgeBase(kb);
    localStorage.setItem('equity_hub_knowledge', JSON.stringify(kb));
  };

  const handleProcessIntel = async () => {
    if (!pastedText.trim()) return;
    setIntelLoading(true);
    setActiveTab('intel'); // Automatically switch to intel tab when processing
    try {
      const intel = await analyzeIntelligence(pastedText);
      setIntelResult(intel);

      const newSnippet: KnowledgeSnippet = {
        id: crypto.randomUUID(),
        content: pastedText,
        timestamp: Date.now(),
        sourceType: 'Manual'
      };
      saveKnowledge([newSnippet, ...knowledgeBase]);
      setPastedText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIntelLoading(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    setLoading(true);
    setActiveTab('portfolio'); // Automatically switch to portfolio tab
    try {
      const data = await analyzeETFs(query || 'Long-term diversified', riskLevel, knowledgeBase, deepAnalysis);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValue = (etf: any) => {
    switch (metric) {
      case '1Y': return { val: etf.historicalReturns?.find((r: any) => r.period === '1Y')?.value || 'N/A', label: '1Y RETURN' };
      case 'Policy': return { val: etf.dividendYield, label: 'POLICY' };
      case 'TER': return { val: etf.expenseRatio, label: 'EXPENSE' };
      default: return { val: etf.historicalReturns?.[0]?.value || 'N/A', label: 'ROI' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 pb-20">
      {/* Detail Modal */}
      {selectedETF && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-y-auto p-12 relative animate-in zoom-in duration-200">
             <button onClick={() => setSelectedETF(null)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
               <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black">{selectedETF.ticker.slice(0,3)}</div>
                <div>
                   <h2 className="text-5xl font-black tracking-tighter text-slate-900">{selectedETF.ticker}</h2>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-1">{selectedETF.name}</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                   <h4 className="text-[10px] font-black text-blue-600 uppercase mb-4 tracking-widest">Investment Rationale</h4>
                   <p className="text-lg font-bold text-slate-700 leading-relaxed">{selectedETF.reasoning}</p>
                </div>
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector Exposure</h4>
                   <div className="space-y-4">
                      {selectedETF.sectorExposure?.map((s, i) => (
                        <div key={i}>
                           <div className="flex justify-between text-xs font-black text-slate-600 mb-1"><span>{s.sector}</span><span>{s.weight}</span></div>
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: s.weight }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 font-black">
           <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">EH</div>
           <h1 className="text-xl tracking-tight uppercase">Equity Hub <span className="text-blue-600">Quant</span></h1>
        </div>
        <div className="flex items-center gap-6">
           {/* Tab Switcher Integrated in Nav or separate - let's make it a prominent UI element below */}
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              System Live
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: PERSISTENT HUB & INPUTS */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
           {/* STEP 1: Knowledge Hub Tile */}
           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <span className="w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                    Intelligence Hub
                 </h2>
                 <button onClick={() => saveKnowledge([])} className="text-[9px] font-black text-rose-500 uppercase hover:underline">Clear Hub</button>
              </div>
              <textarea 
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste FT newsletter content or private market data..."
                  className="w-full h-40 bg-slate-50 p-6 rounded-3xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-slate-100 placeholder:text-slate-300"
              />
              <div className="grid grid-cols-1 gap-3 mt-4">
                <button 
                    onClick={handleProcessIntel}
                    disabled={intelLoading || !pastedText.trim()}
                    className={`w-full py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-lg ${
                        intelLoading || !pastedText.trim() ? 'bg-slate-200 cursor-not-allowed shadow-none' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100 hover:-translate-y-0.5'
                    }`}
                >
                    {intelLoading ? 'Processing Intel...' : 'Analyze Market Intel'}
                </button>
              </div>
              <div className="mt-6 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {knowledgeBase.length === 0 && <p className="text-[10px] text-slate-300 font-bold uppercase text-center py-4">Knowledge Hub Empty</p>}
                  {knowledgeBase.map(k => (
                      <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className="truncate w-32">{k.content}</span>
                          <span>{new Date(k.timestamp).toLocaleDateString()}</span>
                      </div>
                  ))}
              </div>
           </section>

           {/* Parameters Tile */}
           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Strategy Engine</h2>
              <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Investment Query</label>
                    <input 
                      type="text" 
                      value={query} 
                      onChange={e => setQuery(e.target.value)} 
                      placeholder="e.g. AI & Tech, Clean Energy..." 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <RiskSelector value={riskLevel} onChange={setRiskLevel} />
                  <button 
                    onClick={handleGeneratePortfolio}
                    disabled={loading}
                    className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white transition-all shadow-xl ${
                        loading ? 'bg-slate-300 animate-pulse' : 'bg-slate-900 hover:bg-black shadow-slate-200 hover:-translate-y-0.5'
                    }`}
                  >
                    {loading ? 'Building Portfolio...' : 'Generate Full Strategy'}
                  </button>
              </div>
           </section>
        </aside>

        {/* RIGHT COLUMN: TABBED ANALYTICS */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
           
           {/* Tab Bar */}
           <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm mb-4">
              <button 
                onClick={() => setActiveTab('intel')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'intel' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">2</span>
                Market Intelligence
                {intelResult && <div className="w-1.5 h-1.5 rounded-full bg-white ml-1"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'portfolio' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">3</span>
                Master Portfolio
                {result && <div className="w-1.5 h-1.5 rounded-full bg-white ml-1"></div>}
              </button>
           </div>

           {/* Tab Content: Market Intelligence */}
           {activeTab === 'intel' && (
             <section className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm min-h-[500px] animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-xl font-black uppercase tracking-tight text-slate-400">Intelligence Desk Analysis</h2>
                   {intelLoading && <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase animate-pulse">Processing Sources...</div>}
                </div>

                {!intelResult && !intelLoading && (
                    <div className="flex flex-col items-center justify-center text-center py-24">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Market Analysis Waiting</h3>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                          Paste your newsletter content in the Intelligence Hub on the left to extract key takeaways and thematic ETF suggestions.
                        </p>
                    </div>
                )}

                {intelResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="p-8 bg-[#fffcfc] border border-rose-100 rounded-[2.5rem] relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 left-0 w-2 h-full bg-rose-600"></div>
                                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Extracted Sentiment</h4>
                                <div className="text-5xl font-black text-rose-950 uppercase tracking-tighter mb-4">{intelResult.marketSentiment}</div>
                                <p className="text-sm font-bold text-rose-800/80 leading-relaxed italic border-l-2 border-rose-200 pl-6">"{intelResult.sentimentReasoning}"</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Takeaways</h4>
                                {intelResult.topTakeaways.map((t, i) => (
                                    <div key={i} className="flex gap-4 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <span className="text-rose-500 font-black shrink-0">0{i+1}</span>
                                        <span>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct ETF Recommendations</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {intelResult.strategicRecommendations?.map((etf, i) => (
                                    <div key={i} onClick={() => setSelectedETF(etf as any)} className="p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex justify-between items-center shadow-sm">
                                        <div className="flex-1">
                                            <div className="text-2xl font-black text-slate-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{etf.ticker}</div>
                                            <p className="text-[10px] font-black text-slate-400 leading-none mt-2 line-clamp-1">{etf.name}</p>
                                        </div>
                                        <div className="text-right">
                                           <span className="bg-rose-50 text-rose-600 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">Intel Match</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Hot Sectors</h4>
                               <div className="flex flex-wrap gap-3">
                                  {intelResult.trendingSectors.map((s, i) => (
                                      <span key={i} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-2xl uppercase shadow-sm">
                                          {s.name} <span className={s.impact === 'Positive' ? 'text-emerald-500' : 'text-rose-400'}>{s.impact === 'Positive' ? '↑' : '↓'}</span>
                                      </span>
                                  ))}
                               </div>
                            </div>
                        </div>
                    </div>
                )}
             </section>
           )}

           {/* Tab Content: Master Portfolio */}
           {activeTab === 'portfolio' && (
             <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                {!result && !loading && (
                    <div className="h-[500px] bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Portfolio Generator Ready</h3>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                          Setup your strategy parameters on the left and click "Generate" to construct your optimized 6-ETF long-term portfolio.
                        </p>
                    </div>
                )}

                {loading && (
                    <div className="h-[500px] bg-white rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center p-12 animate-pulse">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                           <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Synthesizing Alpha...</h3>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">Cross-referencing Intelligence Hub with global markets</p>
                    </div>
                )}

                {result && !loading && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="flex-1 space-y-4 relative z-10">
                                <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Balanced Strategy: {riskLevel}</h3>
                                <p className="text-slate-400 text-sm font-bold leading-relaxed italic border-l-2 border-blue-600 pl-8 py-2">"{result.alignmentReasoning}"</p>
                            </div>
                            <div className="text-center shrink-0 relative z-10 px-8 py-6 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10">
                                <div className="text-7xl font-black text-blue-500 tracking-tighter tabular-nums leading-none">{result.alignmentScore}<span className="text-2xl">%</span></div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Intelligence Sync</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                           <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Portfolio Constituents</h4>
                           <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
                               {(['1Y', 'Policy', 'TER'] as const).map(m => (
                                   <button key={m} onClick={() => setMetric(m)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all ${metric === m ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                                       {m === 'TER' ? 'EXPENSE' : m === 'Policy' ? 'DIVIDEND' : '1Y ROI'}
                                   </button>
                               ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {result.recommendations.map((etf, i) => {
                                const mData = getMetricValue(etf);
                                return (
                                    <div key={i} onClick={() => setSelectedETF(etf)} className="bg-white p-10 rounded-[3rem] border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-sm">#{i+1}</div>
                                            <div className="text-right">
                                                <div className="text-4xl font-black text-blue-600 tabular-nums leading-none tracking-tighter">{etf.allocation}%</div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Weight</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-none mb-2">{etf.ticker}</h3>
                                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8 line-clamp-1">{etf.name}</p>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-xl font-black text-slate-900 tabular-nums leading-none mb-1">{mData.val}</div>
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{mData.label}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest ${etf.riskRating === 'Low' ? 'bg-emerald-500' : etf.riskRating === 'Medium' ? 'bg-blue-500' : 'bg-orange-500'}`}>{etf.riskRating}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
             </section>
           )}
        </div>

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
