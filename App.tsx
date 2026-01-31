
import React, { useState } from 'react';
import SolarForm from './components/SolarForm';
import { saveLeadToWordPress } from './services/wordpressService';
import { SolarInputData, AppState } from './types';

interface ExtendedAppState extends AppState {
  lastSubmittedData: SolarInputData | null;
  resetKey: number;
}

const App: React.FC = () => {
  const [state, setState] = useState<ExtendedAppState>({
    loading: false,
    error: null,
    data: null,
    aiResponse: null,
    showSuccessMessage: false,
    lastSubmittedData: null,
    resetKey: 0
  });

  const handleFormSubmit = async (solarData: SolarInputData) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      showSuccessMessage: false,
      lastSubmittedData: solarData
    }));
    
    const result = await saveLeadToWordPress(solarData);
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        loading: false,
        showSuccessMessage: true,
        error: null
      }));
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error || "Submission failed. Please check your connection.",
        showSuccessMessage: false
      }));
    }
  };

  const resetForm = () => {
    setState(prev => ({
      ...prev,
      showSuccessMessage: false,
      error: null,
      resetKey: prev.resetKey + 1
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-16 relative px-4">
      {/* SUCCESS MODAL */}
      {state.showSuccessMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check text-4xl"></i>
             </div>
             <h4 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Application Received!</h4>
             <p className="text-slate-600 text-lg mb-8 leading-relaxed">
               Thank you, <span className="font-bold text-slate-900">{state.lastSubmittedData?.name}</span>. 
               One of our solar engineers will contact you shortly.
             </p>
             <button 
               onClick={resetForm}
               className="w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg"
             >
               Got it!
             </button>
          </div>
        </div>
      )}

      {/* ERROR NOTIFICATION */}
      {state.error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl border border-red-500 flex items-center gap-4">
            <i className="fa-solid fa-circle-xmark text-xl"></i>
            <p className="text-xs font-bold flex-1">{state.error}</p>
            <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="opacity-70">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-[42px] font-black text-[#1e293b] tracking-tight mb-2">
            Solar Calculator
          </h1>
        </header>

        <div className="relative">
          <SolarForm 
            key={state.resetKey} 
            onSubmit={handleFormSubmit} 
            isLoading={state.loading} 
          />
          
          {state.loading && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 border border-blue-100 shadow-sm">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
              </div>
              <h4 className="text-2xl font-black text-slate-800">Saving Details...</h4>
            </div>
          )}
        </div>

        <footer className="mt-20 py-8 text-center">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em]">
            Vidyut Nation • Smart Solar Management
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
