
import React from 'react';
import { AIAdviceResponse } from '../types';

interface AIResponseProps {
  response: AIAdviceResponse | null;
  error: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const AIResponse: React.FC<AIResponseProps> = ({ response, error, onRetry, isRetrying }) => {
  if (error) {
    let displayError = error;
    if (error.includes('{') || error.includes('[') || error.includes('code": 429')) {
      displayError = "The AI service is currently busy due to high demand (free tier limit reached).";
    }

    return (
      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-8 rounded-2xl flex flex-col gap-4 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-start gap-5">
          <div className="mt-1">
            <i className="fa-solid fa-circle-exclamation text-2xl text-orange-500"></i>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1 text-orange-900">Project Notice</h4>
            <p className="text-sm font-semibold mb-2 leading-relaxed">{displayError}</p>
            <p className="text-xs opacity-75">Your data was saved successfully. You can try clicking the button below in a minute to generate the summary again.</p>
          </div>
        </div>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            disabled={isRetrying}
            className="mt-2 w-full md:w-auto self-start bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            <i className={isRetrying ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-arrows-rotate"}></i>
            {isRetrying ? "Retrying..." : "Retry AI Analysis"}
          </button>
        )}
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left">
        <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
          <i className="fa-solid fa-chart-line text-blue-500"></i>
          Technical Assessment
        </h3>
        <p className="text-slate-600 leading-relaxed text-lg">
          {response.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <i className="fa-solid fa-award text-emerald-500"></i>
            Key Benefits
          </h3>
          <ul className="space-y-4">
            {response.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-600 leading-tight">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xl shrink-0 mt-0.5"></i>
                <span className="text-[15px] font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#f0fdf4] p-8 rounded-2xl shadow-sm border border-emerald-100 flex flex-col relative overflow-hidden">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 relative z-10">
            <i className="fa-solid fa-leaf text-emerald-600"></i>
            Eco Impact
          </h3>
          <div className="flex gap-6 items-center relative z-10">
            <div className="shrink-0">
              <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-emerald-600 border border-emerald-50">
                <i className="fa-solid fa-seedling text-3xl"></i>
              </div>
            </div>
            <p className="text-slate-700 text-lg font-medium italic leading-relaxed">
              "{response.environmental_impact}"
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
             <i className="fa-solid fa-leaf text-[180px] text-emerald-900 rotate-12"></i>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl text-left">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <i className="fa-solid fa-lightbulb text-yellow-400"></i>
          Expert Recommendations
        </h3>
        <div className="space-y-4">
          {response.recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/10 text-slate-200">
              <span className="font-bold text-yellow-400 mr-2">{idx + 1}.</span> {rec}
            </div>
          ))}
        </div>
      </div>

      {response.sources && response.sources.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-globe"></i>
            Real-World Data Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {response.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-2"
              >
                {source.title}
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResponse;
