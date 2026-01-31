
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
    
    try {
      const leadSaved = await saveLeadToWordPress(solarData);
      
      if (leadSaved) {
        setState(prev => ({
          ...prev,
          showSuccessMessage: true,
          error: null
        }));
      } else {
        throw new Error("Could not connect to the registration server. Please try again.");
      }

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || "Submission failed. Please check your internet connection.",
        showSuccessMessage: false
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
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
    <div className="min-h-screen bg-slate-50 pb-20 pt-12 relative px-4">
      {/* ERROR TOAST */}
      {state.error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-red-500">
            <i className="fa-solid fa-circle-xmark text-xl"></i>
            <p className="font-bold flex-1 text-sm">{state.error}</p>
            <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="opacity-70 hover:opacity-100">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {state.showSuccessMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check text-3xl"></i>
             </div>
             <h4 className="text-2xl font-black text-slate-800 mb-3">Submission Success!</h4>
             <p className="text-slate-600 mb-8 leading-relaxed">
               Thank you, <span className="font-bold text-slate-800">{state.lastSubmittedData?.name}</span>. 
               Your data for <span className="font-bold text-slate-800">{state.lastSubmittedData?.location}</span> has been registered.
             </p>
             <button 
               onClick={resetForm}
               className="w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold py-4 rounded-xl transition-all shadow-lg"
             >
               Done
             </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-4">Solar Calculator</h1>
        </header>

        <div className="relative">
          <SolarForm 
            key={state.resetKey} 
            onSubmit={handleFormSubmit} 
            isLoading={state.loading} 
          />
          
          {state.loading && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-10">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h4 className="text-xl font-bold text-slate-800">Saving Application...</h4>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs font-medium">
          <p>© 2024 Solar Tech Advisor. Leads are processed securely via WordPress REST API.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
