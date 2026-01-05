
import React from 'react';
import { RiskLevel } from '../types';

interface RiskSelectorProps {
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
}

const RiskSelector: React.FC<RiskSelectorProps> = ({ value, onChange }) => {
  const levels = [
    { 
      id: RiskLevel.CONSERVATIVE, 
      label: 'Conservative', 
      tag: 'Stability First',
      desc: 'Focus: Dividends & Capital Preservation',
      activeColor: 'bg-emerald-600 text-white ring-emerald-500/30',
      inactiveColor: 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: RiskLevel.MODERATE, 
      label: 'Moderate', 
      tag: 'Core Growth',
      desc: 'Focus: Balanced Index Tracking',
      activeColor: 'bg-blue-600 text-white ring-blue-500/30',
      inactiveColor: 'bg-white text-slate-600 border-slate-200 hover:border-blue-200 hover:bg-blue-50/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    { 
      id: RiskLevel.AGGRESSIVE, 
      label: 'Aggressive', 
      tag: 'High Alpha',
      desc: 'Focus: Thematic & Sector Growth',
      activeColor: 'bg-orange-600 text-white ring-orange-500/30',
      inactiveColor: 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:bg-orange-50/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const isActive = value === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
              isActive 
                ? `${level.activeColor} border-transparent ring-4 shadow-xl -translate-y-0.5` 
                : `${level.inactiveColor} shadow-sm`
            }`}
          >
            <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
              {level.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-black uppercase tracking-tighter text-sm leading-none">{level.label}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {level.tag}
                </span>
              </div>
              <p className={`text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                {level.desc}
              </p>
            </div>
            {isActive && (
              <div className="self-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RiskSelector;
