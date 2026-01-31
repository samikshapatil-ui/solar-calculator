
import React, { useState } from 'react';
import SolarForm from './components/SolarForm';
import AIResponse from './components/AIResponse';
import { getSolarAIAdvice } from './services/geminiService';
import { saveLeadToWordPress } from './services/wordpressService';
import { SolarInputData, AppState, AIAdviceResponse } from './types';

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

  // Technical Calculation Fallback (Industry Standards for India)
  const calculateStaticAdvice = (data: SolarInputData): AIAdviceResponse => {
    const areaSqFt = data.rooftopAreaUnit === 'Sq. Feet' ? data.rooftopAreaValue : data.rooftopAreaValue * 10.764;
    const usableArea = areaSqFt * (data.usableAreaPercentage / 100);
    
    // Standard: 1kWp needs ~100 sq ft
    const capacityKW = Math.floor(usableArea / 100 * 10) / 10;
    const dailyGen = capacityKW * 4.2; // Avg daily units in India
    const monthlyGen = Math.round(dailyGen * 30);
    const monthlySavings = Math.round(monthlyGen * data.unitCost);
    const co2Saved = Math.round(capacityKW * 1.5); 

    return {
      summary: `Based on your ${data.rooftopAreaValue} ${data.rooftopAreaUnit} rooftop in ${data.location}, your property can support a ${capacityKW}kWp Solar Power Plant. This system is estimated to generate approximately ${monthlyGen} units (kWh) per month, saving you roughly ₹${monthlySavings.toLocaleString()} on your electricity bills.`,
      benefits: [
        `High yield potential: ~${monthlyGen} kWh monthly generation.`,
        `Direct bill reduction of approx ₹${monthlySavings.toLocaleString()} monthly.`,
        `Offset ${co2Saved} Metric Tons of CO2 emissions annually.`,
        `Eligible for state-specific solar subsidies and net-metering.`
      ],
      environmental_impact: `Transitioning to solar is equivalent to planting ${Math.round(co2Saved * 45)} trees every year, significantly reducing your carbon footprint in ${data.location}.`,
      recommendations: [
        `Install high-efficiency Monocrystalline modules to maximize output from your available ${data.usableAreaPercentage}% usable area.`,
        `Opt for a Net-Metering connection to earn credits for surplus power exported back to the grid.`,
        `Ensure structural stability of the rooftop for the hot-dip galvanized mounting structures.`
      ]
    };
  };

  const handleFormSubmit = async (solarData: SolarInputData) => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      showSuccessMessage: false,
      lastSubmittedData: solarData,
      aiResponse: null 
    }));
    
    try {
      // 1. Save Lead to WordPress
      const leadSaved = await saveLeadToWordPress(solarData);
      
      // 2. Determine Analysis Mode (AI or Calculator)
      let advice: AIAdviceResponse;
      const apiKey = process.env.API_KEY;
      
      if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY' && apiKey.length > 10) {
        try {
          advice = await getSolarAIAdvice(solarData);
        } catch (aiErr: any) {
          console.warn("AI Analysis failed or limited, using technical calculator fallback.");
          advice = calculateStaticAdvice(solarData);
        }
      } else {
        advice = calculateStaticAdvice(solarData);
      }
      
      setState(prev => ({
        ...prev,
        aiResponse: advice,
        showSuccessMessage: leadSaved,
        error: null
      }));

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || "Submission failed. Please check your connection.",
        showSuccessMessage: false
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const resetForm = () => {
    setState(prev => ({
      ...prev,
      aiResponse: null,
      error: null,
      resetKey: prev.resetKey + 1
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-12 relative px-4">
      {/* SUCCESS POPUP */}
      {state.showSuccessMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-check text-3xl"></i>
             </div>
             <h4 className="text-3xl font-black text-slate-800 mb-3">Lead Saved!</h4>
             <p className="text-slate-600 text-lg mb-8 leading-relaxed">
               Your technical assessment is ready below. Our engineers in {state.lastSubmittedData?.location} will review your application soon.
             </p>
             <button 
               onClick={() => setState(prev => ({...prev, showSuccessMessage: false}))}
               className="w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold py-4 rounded-xl transition-all shadow-lg"
             >
               View Report
             </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight italic">Solar Advisor</h1>
          <p className="text-slate-500 text-xl font-medium">Headless Solar Analytics & Lead Registry</p>
        </header>

        {!state.aiResponse ? (
          <div className="relative">
            <SolarForm key={state.resetKey} onSubmit={handleFormSubmit} isLoading={state.loading} />
            {state.loading && (
              <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-10">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h4 className="text-2xl font-black text-slate-800 mb-2">Analyzing Rooftop...</h4>
                <p className="text-slate-500 font-medium">Securing your application to the central registry.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center mb-8">
               <button onClick={resetForm} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors">
                <i className="fa-solid fa-arrow-left"></i> Back to Form
              </button>
              <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                Technical Report Generated
              </div>
            </div>

            <AIResponse response={state.aiResponse} error={state.error} />

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
               <button onClick={() => window.print()} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3">
                 <i className="fa-solid fa-print"></i> Download PDF
               </button>
               <button onClick={resetForm} className="bg-[#1e3a5f] hover:bg-[#162a45] text-white px-8 py-4 rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-3">
                 <i className="fa-solid fa-plus"></i> New Assessment
               </button>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center text-slate-400 text-sm font-medium border-t border-slate-200 pt-10">
          <p>© 2024 Solar Tech Advisor. Data transmitted securely via REST API.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
