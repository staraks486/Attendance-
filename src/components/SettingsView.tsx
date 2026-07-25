import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  IndianRupee,
  Bell,
  Database,
  Save,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  ShieldCheck,
  Clock,
  Sliders,
  AlertTriangle,
  Mail,
  Phone,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AppSettings, DEFAULT_APP_SETTINGS, UserRole } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
  activeRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  activeRole,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeSection, setActiveSection] = useState<'company' | 'geofence' | 'payroll' | 'notifications' | 'data'>('company');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Compute mock localStorage stats
  const getStorageStats = () => {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    const kb = (totalBytes / 1024).toFixed(2);
    return {
      sizeKb: kb,
      itemsCount: localStorage.length,
    };
  };

  const storageStats = getStorageStats();

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Export system backup JSON
  const handleExportBackup = () => {
    const backupData = {
      settings: formData,
      users: JSON.parse(localStorage.getItem('geoclock_users') || '[]'),
      locations: JSON.parse(localStorage.getItem('geoclock_locations') || '[]'),
      attendance: JSON.parse(localStorage.getItem('geoclock_attendance') || '[]'),
      leaves: JSON.parse(localStorage.getItem('geoclock_leaves') || '[]'),
      lateNotices: JSON.parse(localStorage.getItem('geoclock_late_notices') || '[]'),
      salarySlips: JSON.parse(localStorage.getItem('geoclock_salary_slips') || '[]'),
      sales: JSON.parse(localStorage.getItem('geoclock_sales') || '[]'),
      purchases: JSON.parse(localStorage.getItem('geoclock_purchases') || '[]'),
      exportDate: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GeoClock_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import system backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) {
          onSaveSettings(parsed.settings);
          setFormData(parsed.settings);
        }
        if (parsed.users) localStorage.setItem('geoclock_users', JSON.stringify(parsed.users));
        if (parsed.locations) localStorage.setItem('geoclock_locations', JSON.stringify(parsed.locations));
        if (parsed.attendance) localStorage.setItem('geoclock_attendance', JSON.stringify(parsed.attendance));
        if (parsed.leaves) localStorage.setItem('geoclock_leaves', JSON.stringify(parsed.leaves));
        if (parsed.lateNotices) localStorage.setItem('geoclock_late_notices', JSON.stringify(parsed.lateNotices));
        if (parsed.salarySlips) localStorage.setItem('geoclock_salary_slips', JSON.stringify(parsed.salarySlips));
        if (parsed.sales) localStorage.setItem('geoclock_sales', JSON.stringify(parsed.sales));
        if (parsed.purchases) localStorage.setItem('geoclock_purchases', JSON.stringify(parsed.purchases));

        alert('Backup imported successfully! Reloading application data...');
        window.location.reload();
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid GeoClock JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Save Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>System Settings Updated & Persisted Successfully!</span>
        </div>
      )}

      {/* Header Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Sliders className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Application & Control Settings
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure company profile, geofencing rules, payroll deductions, notification channels, and data storage.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar / Tabs */}
        <div className="lg:col-span-1 space-y-1 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-lg h-fit">
          <button
            onClick={() => setActiveSection('company')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activeSection === 'company'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('geofence')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activeSection === 'geofence'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Geofence & Attendance</span>
          </button>

          <button
            onClick={() => setActiveSection('payroll')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activeSection === 'payroll'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            <span>Payroll & Tax Policy</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activeSection === 'notifications'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveSection('data')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activeSection === 'data'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Backup & Data Reset</span>
          </button>
        </div>

        {/* Content Form Area */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. COMPANY PROFILE */}
            {activeSection === 'company' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Company Details & Legal Info
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Printed on payslips, invoices, reports, and employee attendance logs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Company Legal Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Apex Retail India Pvt Ltd"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      GSTIN / Business Registration ID
                    </label>
                    <input
                      type="text"
                      value={formData.companyGstin}
                      onChange={(e) => handleInputChange('companyGstin', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                      placeholder="e.g. 29AABCA1234F1ZB"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Headquarters Address
                    </label>
                    <input
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                      placeholder="Complete address with PIN code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official HR Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={formData.companyEmail}
                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        placeholder="hr@company.in"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Helpline Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={formData.companyPhone}
                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.currencySymbol}
                      onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                      placeholder="₹"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Currency ISO Code
                    </label>
                    <input
                      type="text"
                      value={formData.currencyCode}
                      onChange={(e) => handleInputChange('currencyCode', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      placeholder="INR"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. GEOFENCE & ATTENDANCE RULES */}
            {activeSection === 'geofence' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    GPS Geofencing & Shift Policy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define location tolerance radius, grace periods, and mobile clock-in permissions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">
                        Default Geofence Radius (Meters)
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {formData.defaultGeofenceRadius} meters
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="1000"
                      step="10"
                      value={formData.defaultGeofenceRadius}
                      onChange={(e) => handleInputChange('defaultGeofenceRadius', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Strict (30m)</span>
                      <span>Standard Store (200m)</span>
                      <span>Campus Wide (1000m)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Late Arrival Grace Period (Minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.lateGracePeriodMins}
                      onChange={(e) => handleInputChange('lateGracePeriodMins', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Arrival within grace period is marked 'On Time'</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Half-Day Threshold (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.halfDayThresholdHours}
                      onChange={(e) => handleInputChange('halfDayThresholdHours', parseInt(e.target.value) || 4)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Shift Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.shiftStartDefault}
                      onChange={(e) => handleInputChange('shiftStartDefault', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Shift End Time
                    </label>
                    <input
                      type="time"
                      value={formData.shiftEndDefault}
                      onChange={(e) => handleInputChange('shiftEndDefault', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="sm:col-span-2 space-y-3 pt-2">
                    <label className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Strict Geofence Enforcement</span>
                        <span className="text-[11px] text-slate-400 block">
                          If enabled, staff cannot clock in when outside the store boundary.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.strictGeofencing}
                        onChange={(e) => handleInputChange('strictGeofencing', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Allow Self Mobile Clock-In</span>
                        <span className="text-[11px] text-slate-400 block">
                          Employees can punch attendance from their own mobile web browsers.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowSelfClockIn}
                        onChange={(e) => handleInputChange('allowSelfClockIn', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Mandatory Live Selfie Check-In</span>
                        <span className="text-[11px] text-slate-400 block">
                          Require a photo capture upon punching attendance for verification.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.requireSelfieVerification}
                        onChange={(e) => handleInputChange('requireSelfieVerification', e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAYROLL & TAX POLICY */}
            {activeSection === 'payroll' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    Indian Payroll & Statutory Deductions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure statutory EPF %, ESI %, Professional Tax, and overtime multipliers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Monthly Salary Payday
                    </label>
                    <select
                      value={formData.paydayOfMonth}
                      onChange={(e) => handleInputChange('paydayOfMonth', parseInt(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value={1}>1st of every month</option>
                      <option value={5}>5th of every month</option>
                      <option value={7}>7th of every month</option>
                      <option value={10}>10th of every month</option>
                      <option value={30}>Last day of month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Provident Fund (EPF) Employee Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.pfRatePercent}
                      onChange={(e) => handleInputChange('pfRatePercent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Standard statutory rate is 12%</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ESI Contribution Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.esiRatePercent}
                      onChange={(e) => handleInputChange('esiRatePercent', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Standard employee rate is 0.75%</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Professional Tax (Flat Monthly ₹)
                    </label>
                    <input
                      type="number"
                      value={formData.professionalTaxAmount}
                      onChange={(e) => handleInputChange('professionalTaxAmount', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Flat deduction (e.g. ₹200 in Karnataka)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      HRA Allowance (% of Basic)
                    </label>
                    <input
                      type="number"
                      value={formData.hraPercent}
                      onChange={(e) => handleInputChange('hraPercent', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Overtime Hourly Rate (₹ / hour)
                    </label>
                    <input
                      type="number"
                      value={formData.overtimeHourlyRate}
                      onChange={(e) => handleInputChange('overtimeHourlyRate', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. ALERTS & WHATSAPP */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    Automated Notifications & WhatsApp Broadcasts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure triggers for instant SMS/WhatsApp alerts to store managers & HR.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">WhatsApp Shift Bulletins</span>
                      <span className="text-[11px] text-slate-400 block">
                        Send automated shift reminders and clock-in confirmation via WhatsApp Web link.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableWhatsappAlerts}
                      onChange={(e) => handleInputChange('enableWhatsappAlerts', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Email Notifications for HR</span>
                      <span className="text-[11px] text-slate-400 block">
                        Receive instant email copy for leave applications and expense vouchers.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableEmailAlerts}
                      onChange={(e) => handleInputChange('enableEmailAlerts', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Notify Store Manager on Late Clock-In</span>
                      <span className="text-[11px] text-slate-400 block">
                        Flag late punches directly on manager dashboard with instant alert badge.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifyOnLateArrival}
                      onChange={(e) => handleInputChange('notifyOnLateArrival', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Notify Manager on Leave Requests</span>
                      <span className="text-[11px] text-slate-400 block">
                        Prompt store manager for instant approval when staff submits leave.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifyOnLeaveRequest}
                      onChange={(e) => handleInputChange('notifyOnLeaveRequest', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 5. BACKUP & DATA RESET */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Data Management, Backup & System Storage
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Export full database, restore system backup JSON, or reset to default demo dataset.
                  </p>
                </div>

                {/* Storage usage stats */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Local Database Consumption</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">{storageStats.sizeKb} KB</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {storageStats.itemsCount} stored keys in persistent browser cache
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Export Backup JSON</span>
                    </button>

                    <label className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>Import JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-rose-950/30 border border-rose-500/30 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Danger Zone - Factory Reset</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Resetting will clear custom stores, added staff accounts, attendance records, and store expenses, restoring original demo data.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmModal(true)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Application to Factory Defaults</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action Bar at bottom of active section */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Changes take effect immediately across all user devices.</span>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Reset All Application Data?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will reset all attendance punches, sales, expenses, and store locations back to default initial state. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirmModal(false);
                  onResetData();
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
