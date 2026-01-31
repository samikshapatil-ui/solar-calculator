
import React, { useState } from 'react';
import SolarForm from './components/SolarForm';
import AIResponse from './components/AIResponse';
import { saveLeadToWordPress } from './services/wordpressService';
import { getSolarAIAdvice } from './services/geminiService';
import { SolarInputData, AppState } from './types';

interface ExtendedAppState extends AppState {
  lastSubmittedData: SolarInputData | null;
  resetKey: number;
  isAiLoading: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<ExtendedAppState>({
    loading: false,
    isAiLoading: false,
    error: null,
    data: null,
    aiResponse: null,
    showSuccessMessage: false,
    lastSubmittedData: null,
    resetKey: 0
  });

  const handleFormSubmit = async (solarData: SolarInputData) => {
    // 1. Start Loading
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      showSuccessMessage: false,
      aiResponse: null,
      lastSubmittedData: solarData
    }));
    
    // 2. Save to WordPress First
    const wpResult = await saveLeadToWordPress(solarData);
    
    if (!wpResult.success) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `WordPress Error: ${wpResult.error || "Check your URL configuration."}`
      }));
      return;
    }

    // 3. If WP Save Success, get AI Advice
    setState(prev => ({ ...prev, loading: false, isAiLoading: true, showSuccessMessage: true }));
    
    try {
      const aiAdvice = await getSolarAIAdvice(solarData);
      setState(prev => ({
        ...prev,
        isAiLoading: false,
        aiResponse: aiAdvice
      }));
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setState(prev => ({
        ...prev,
        isAiLoading: false,
        error: "Lead saved to WordPress, but AI Analysis failed. (API Key might be missing or rate-limited)."
      }));
    }
  };

  const handleRetryAi = async () => {
    if (!state.lastSubmittedData) return;
    setState(prev => ({ ...prev, isAiLoading: true, error: null }));
    try {
      const aiAdvice = await getSolarAIAdvice(state.lastSubmittedData);
      setState(prev => ({ ...prev, isAiLoading: false, aiResponse: aiAdvice }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAiLoading: false, error: err.message }));
    }
  };

  const resetForm = () => {
    setState(prev => ({
      ...prev,
      showSuccessMessage: false,
      aiResponse: null,
      error: null,
      resetKey: prev.resetKey + 1
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-12 relative px-4">
      {/* ERROR NOTIFICATION */}
      {state.error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl border border-red-500 flex items-center gap-4">
            <i className="fa-solid fa-circle-exclamation text-xl"></i>
            <p className="text-xs font-bold flex-1">{state.error}</p>
            <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="opacity-70 hover:opacity-100">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block bg-[#1e3a5f] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Vidyut Nation • Solar Intelligence
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Solar AI Advisor</h1>
          <p className="text-slate-500 text-sm font-medium italic">Professional Rooftop Assessment & Lead Management</p>
        </header>

        <div className="space-y-10">
          {/* FORM SECTION */}
          {!state.aiResponse && (
            <div className="relative">
              <SolarForm 
                key={state.resetKey} 
                onSubmit={handleFormSubmit} 
                isLoading={state.loading || state.isAiLoading} 
              />
              
              {(state.loading || state.isAiLoading) && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-300">
                  <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h4 className="text-2xl font-black text-slate-800">
                    {state.loading ? "Saving to WordPress..." : "Analyzing with AI..."}
                  </h4>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    {state.loading 
                      ? "Securely registering your lead at gbim.info/vidyutnation" 
                      : "Consulting regional solar policies and weather data for your assessment."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI RESPONSE SECTION */}
          {state.aiResponse && (
            <div className="space-y-8">
              <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-check text-xl"></i>
                   </div>
                   <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Success</p>
                      <h4 className="font-bold">Lead Saved & Analysis Complete</h4>
                   </div>
                </div>
                <button 
                  onClick={resetForm}
                  className="bg-white text-emerald-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  New Assessment
                </button>
              </div>

              <AIResponse 
                response={state.aiResponse} 
                error={null} 
              />
              
              <div className="text-center">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  <i className="fa-solid fa-print"></i>
                  Print this report
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-20 py-8 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Vidyut Nation • Powered by Gemini Pro 3
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
