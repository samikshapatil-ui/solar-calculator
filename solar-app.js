
import React, { useState } from 'https://esm.sh/react@19.2.3';
import ReactDOM from 'https://esm.sh/react-dom@19.2.3/client';
import htm from 'https://esm.sh/htm';

const html = htm.bind(React.createElement);

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Burundi", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const saveLeadToWP = async (data) => {
  const settings = window.wpApiSettings;
  if (!settings?.root) return true;
  try {
    const response = await fetch(`${settings.root}solar-ai/v1/save-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': settings.nonce },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (e) { return false; }
};

const SolarForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    location: '', category: '', unitCost: 8,
    rooftopAreaValue: 1000, rooftopAreaUnit: 'Sq. Feet', usableAreaPercentage: 100,
    name: '', phone: '', email: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!formData.name.trim()) e.name = "Full name is required";
    else if (formData.name.trim().length < 2) e.name = "Name too short";
    else if (!nameRegex.test(formData.name.trim())) e.name = "Alphabets only";

    if (!formData.phone || formData.phone.length !== 10) e.phone = "10-digit phone required";
    if (!formData.location) e.location = "Select location";
    if (!formData.category) e.category = "Select category";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let v = value;
    if (name === 'phone') v = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'name') v = value.replace(/[^A-Za-z\s]/g, '');
    setFormData(p => ({ ...p, [name]: type === 'number' ? parseFloat(v) || 0 : v }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const getStyle = (hasError) => `w-full px-4 py-3 rounded-xl border outline-none transition-all ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`;
  const errorMsg = (msg) => msg ? html`<p className="text-red-600 text-[10px] font-bold mt-1 flex items-center gap-1"><i className="fa-solid fa-triangle-exclamation"></i> ${msg}</p>` : null;

  return html`
    <form onSubmit=${(e) => { e.preventDefault(); if(validate()) onSubmit(formData); }} className="w-full bg-white p-10 md:p-14 rounded-3xl shadow-2xl border border-slate-100 text-left">
      <div className="mb-12">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-8"><i className="fa-solid fa-solar-panel text-orange-500"></i> Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Location</label>
          <select name="location" value=${formData.location} onChange=${handleChange} className=${getStyle(errors.location)}>
            <option value="" disabled>Select Location</option>
            ${INDIAN_STATES.map(s => html`<option key=${s} value=${s}>${s}</option>`)}
          </select>${errorMsg(errors.location)}</div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Category</label>
          <select name="category" value=${formData.category} onChange=${handleChange} className=${getStyle(errors.category)}>
            <option value="" disabled>Select Category</option>
            <option value="Residential">Residential</option><option value="Commercial">Commercial</option><option value="Industrial">Industrial</option>
          </select>${errorMsg(errors.category)}</div>
          <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Electricity Cost (Rs/kWh)</label><input type="number" name="unitCost" value=${formData.unitCost} onChange=${handleChange} className=${getStyle(false)} required /></div>
        </div>
      </div>
      <div className="mb-12">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-8"><i className="fa-solid fa-house-chimney text-blue-500"></i> Rooftop</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Area</label><input type="number" name="rooftopAreaValue" value=${formData.rooftopAreaValue} onChange=${handleChange} className=${getStyle(false)} required /></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Unit</label><select name="rooftopAreaUnit" value=${formData.rooftopAreaUnit} onChange=${handleChange} className=${getStyle(false)}><option value="Sq. Feet">Sq. Feet</option><option value="Sq. Meter">Sq. Meter</option></select></div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Usable (%)</label><input type="number" name="usableAreaPercentage" value=${formData.usableAreaPercentage} onChange=${handleChange} className=${getStyle(false)} required /></div>
        </div>
      </div>
      <div className="mb-12">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-8"><i className="fa-solid fa-address-card text-emerald-500"></i> Contact Info</h3>
        <div className="space-y-6">
          <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Full Name</label><input type="text" name="name" placeholder="Full Name" value=${formData.name} onChange=${handleChange} className=${getStyle(errors.name)} required />${errorMsg(errors.name)}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Phone</label><input type="tel" name="phone" placeholder="Phone" value=${formData.phone} onChange=${handleChange} className=${getStyle(errors.phone)} required maxLength="10" />${errorMsg(errors.phone)}</div>
            <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Email</label><input type="email" name="email" placeholder="Email" value=${formData.email} onChange=${handleChange} className=${getStyle(false)} required /></div>
          </div>
        </div>
      </div>
      <button disabled=${isLoading} className="w-full bg-[#1e3a5f] text-white text-[18px] py-3 rounded-2xl shadow-xl transition-all hover:bg-[#162a45] disabled:opacity-50">
        ${isLoading ? html`<i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...` : "Submit Application"}
      </button>
    </form>
  `;
};

const App = () => {
  const [state, setState] = useState({ loading: false, error: null, success: false, resetKey: 0 });

  const handleSubmit = async (data) => {
    setState(p => ({ ...p, loading: true, error: null, success: false }));
    const saved = await saveLeadToWP(data);
    if (saved) setState(p => ({ ...p, loading: false, error: null, success: true }));
    else setState(p => ({ ...p, loading: false, error: "Submission failed. Please try again.", success: false }));
  };

  const closeSuccess = () => {
    setState(p => ({ ...p, success: false, resetKey: p.resetKey + 1 }));
  };

  return html`
    <div className="min-h-screen pb-20 pt-12 px-6 relative">
      ${state.success && html`
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><i className="fa-solid fa-check text-4xl"></i></div>
             <h4 className="text-3xl font-black mb-4">Application Received!</h4>
             <p className="text-slate-600 text-lg mb-8">Your rooftop data has been submitted. One of our solar engineers will contact you shortly.</p>
             <button onClick=${closeSuccess} className="w-full bg-[#1e3a5f] text-white font-bold py-4 rounded-xl shadow-lg">Got it!</button>
          </div>
        </div>
      `}

      ${state.error && html`
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-6">
          <div className="bg-red-600 text-white p-4 rounded-xl shadow-xl flex items-center gap-4 border border-red-500">
            <i className="fa-solid fa-circle-xmark text-xl"></i>
            <p className="font-bold flex-1">${state.error}</p>
            <button onClick=${() => setState(p => ({ ...p, error: null }))} className="opacity-70"><i className="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      `}

      <div className="max-w-4xl mx-auto text-center">
        <header className="mb-5">
          <h1 className="text-4xl font-black text-slate-800 mb-1">Solar Calculator</h1>
        </header>

        <div className="relative">
          <${SolarForm} key=${state.resetKey} onSubmit=${handleSubmit} isLoading=${state.loading} />
          ${state.loading && html`
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 border border-blue-100"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>
              <h4 className="text-2xl font-black text-slate-800 mb-2">Saving Details...</h4>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};

const rootEl = document.getElementById('root');
if (rootEl) ReactDOM.createRoot(rootEl).render(html`<${App} />`);
