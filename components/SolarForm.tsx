
import React, { useState } from 'react';
import { SolarInputData } from '../types';

interface SolarFormProps {
  onSubmit: (data: SolarInputData) => void;
  isLoading: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  location?: string;
  category?: string;
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", 
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const SolarForm: React.FC<SolarFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SolarInputData>({
    systemSize: 5.5,
    monthlyGeneration: 650,
    annualGeneration: 7800,
    location: '',
    category: '' as any,
    currency: 'INR',
    unitCost: 8,
    rooftopAreaValue: 1000,
    rooftopAreaUnit: 'Sq. Feet',
    usableAreaPercentage: 100,
    name: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "10 digits required";
    if (!formData.location) newErrors.location = "Select a location";
    if (!formData.category) newErrors.category = "Select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (name === 'name') sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
    else if (name === 'phone') sanitizedValue = value.replace(/\D/g, '').slice(0, 10);

    setFormData(prev => ({
      ...prev,
      [name]: (['unitCost', 'rooftopAreaValue', 'usableAreaPercentage'].includes(name)) 
        ? parseFloat(sanitizedValue as string) || 0
        : sanitizedValue
    }));
  };

  const labelStyle = "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block";
  const inputBaseStyle = "w-full px-4 py-2.5 rounded-lg border outline-none text-slate-700 bg-white transition-all text-sm";
  const getBorderStyle = (hasError?: boolean) => hasError 
    ? "border-red-400 focus:border-red-500 bg-red-50/20" 
    : "border-slate-200 focus:border-blue-400";

  return (
    <form onSubmit={(e) => { e.preventDefault(); if(validate()) onSubmit(formData); }} className="w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 text-left">
      
      {/* Basic Details */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <i className="fa-solid fa-solar-panel text-orange-500"></i>
          Basic Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelStyle}>Location</label>
            <select name="location" value={formData.location} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle(!!errors.location)}`}>
              <option value="" disabled>Select Location</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelStyle}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle(!!errors.category)}`}>
              <option value="" disabled>Select Category</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelStyle}>Electricity Cost (Rs/kWh)</label>
            <input type="number" name="unitCost" value={formData.unitCost} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} />
          </div>
        </div>
      </div>

      {/* Rooftop */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <i className="fa-solid fa-house-chimney text-blue-500"></i>
          Rooftop
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>Area</label>
            <input type="number" name="rooftopAreaValue" value={formData.rooftopAreaValue || ''} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} />
          </div>
          <div>
            <label className={labelStyle}>Unit</label>
            <select name="rooftopAreaUnit" value={formData.rooftopAreaUnit} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`}>
              <option value="Sq. Feet">Sq. Feet</option>
              <option value="Sq. Meter">Sq. Meter</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Usable (%)</label>
            <input type="number" name="usableAreaPercentage" value={formData.usableAreaPercentage} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <i className="fa-solid fa-address-card text-emerald-500"></i>
          Contact Info
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className={labelStyle}>Full Name</label>
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle(!!errors.name)}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Phone</label>
              <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle(!!errors.phone)}`} maxLength={10} />
            </div>
            <div>
              <label className={labelStyle}>Email</label>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
};

export default SolarForm;
