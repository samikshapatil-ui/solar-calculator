
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
      // 1. Save Lead to WordPress ONLY
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
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <i className="fa-solid fa-check text-4xl"></i>
             </div>
             <h4 className="text-3xl font-black text-slate-800 mb-3">Application Received!</h4>
             <p className="text-slate-600 text-lg mb-8 leading-relaxed">
               Thank you, <span className="font-bold text-slate-800">{state.lastSubmittedData?.name}</span>. 
               Your rooftop data for <span className="font-bold text-slate-800">{state.lastSubmittedData?.location}</span> has been successfully registered. 
               Our solar experts will contact you shortly.
             </p>
             <button 
               onClick={resetForm}
               className="w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg"
             >
               Done
             </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight italic">Solar Advisor</h1>
          <p className="text-slate-500 text-xl font-medium">Professional Rooftop Analysis & Lead Registry</p>
        </header>

        <div className="relative">
          <SolarForm 
            key={state.resetKey} 
            onSubmit={handleFormSubmit} 
            isLoading={state.loading} 
          />
          
          {state.loading && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h4 className="text-2xl font-black text-slate-800 mb-2">Saving Application...</h4>
              <p className="text-slate-500 font-medium">Securing your data to our central solar registry.</p>
            </div>
          )}
        </div>

        <footer className="mt-20 text-center text-slate-400 text-sm font-medium border-t border-slate-200 pt-10">
          <p>© 2024 Solar Tech Advisor. Leads are processed securely via WordPress REST API.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
