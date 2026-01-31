
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
    
    // Name validation
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Only alphabets and spaces are allowed";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Location validation
    if (!formData.location) {
      newErrors.location = "Please select a location";
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (name === 'name') {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
    } else if (name === 'phone') {
      sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
    } else if (name === 'location') {
      if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
    } else if (name === 'category') {
      if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: (['unitCost', 'rooftopAreaValue', 'usableAreaPercentage'].includes(name)) 
        ? parseFloat(sanitizedValue as string) || 0
        : sanitizedValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const labelStyle = "text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block";
  const inputBaseStyle = "w-full px-4 py-3 rounded-lg border outline-none text-slate-700 bg-white transition-all text-sm";
  const getBorderStyle = (hasError?: boolean) => hasError 
    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30" 
    : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white p-10 md:p-14 rounded-3xl shadow-2xl border border-slate-100 text-left">
      
      {/* Step 1 */}
      <div className="mb-12">
        <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4 mb-8">
          <i className="fa-solid fa-solar-panel text-orange-500"></i>
          Step 1: Basic Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelStyle}>State / Location</label>
            <select 
              name="location" 
              value={formData.location} 
              onChange={handleChange} 
              className={`${inputBaseStyle} ${getBorderStyle(!!errors.location)}`} 
              required
            >
              <option value="" disabled>Select State</option>
              {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            {errors.location && (
              <p className="text-red-600 text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {errors.location}
              </p>
            )}
          </div>
          <div>
            <label className={labelStyle}>User Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className={`${inputBaseStyle} ${getBorderStyle(!!errors.category)}`}
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
            {errors.category && (
              <p className="text-red-600 text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {errors.category}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelStyle}>Avg. Electricity Unit Cost (Rs. / kWh)</label>
            <input type="number" name="unitCost" value={formData.unitCost} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} required />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="mb-12">
        <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4 mb-8">
          <i className="fa-solid fa-house-chimney text-blue-500"></i>
          Step 2: Rooftop Assessment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelStyle}>Total Roof Area</label>
            <input type="number" name="rooftopAreaValue" value={formData.rooftopAreaValue || ''} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} required />
          </div>
          <div>
            <label className={labelStyle}>Unit Selector</label>
            <select name="rooftopAreaUnit" value={formData.rooftopAreaUnit} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`}>
              <option value="Sq. Feet">Sq. Feet</option>
              <option value="Sq. Meter">Sq. Meter</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Usable (%)</label>
            <input type="number" name="usableAreaPercentage" value={formData.usableAreaPercentage} onChange={handleChange} className={`${inputBaseStyle} ${getBorderStyle()}`} required />
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="mb-12">
        <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4 mb-8">
          <i className="fa-solid fa-address-card text-emerald-500"></i>
          Step 3: Contact Info
        </h3>
        
        <div className="space-y-8">
          <div>
            <label className={labelStyle}>Full Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your name (Alphabets only)" 
              value={formData.name} 
              onChange={handleChange} 
              className={`${inputBaseStyle} ${getBorderStyle(!!errors.name)}`} 
              required 
            />
            {errors.name && (
              <p className="text-red-600 text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <label className={labelStyle}>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="10 Digits" 
                value={formData.phone} 
                onChange={handleChange} 
                className={`${inputBaseStyle} ${getBorderStyle(!!errors.phone)}`} 
                required 
                maxLength={10} 
              />
              {errors.phone && (
                <p className="text-red-600 text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyle}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="example@email.com" 
                value={formData.email} 
                onChange={handleChange} 
                className={`${inputBaseStyle} ${getBorderStyle()}`} 
                required 
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full bg-[#1e3a5f] hover:bg-[#162a45] text-white font-black text-2xl py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
      >
        <i className={isLoading ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-paper-plane"}></i>
        {isLoading ? 'Processing Submission...' : 'Submit Application Now'}
      </button>
    </form>
  );
};

export default SolarForm;
