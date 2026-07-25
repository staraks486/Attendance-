import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserCheck, Lock, ArrowRight, Building2, MapPin, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  allUsers: User[];
  onLogin: (user: User) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ allUsers, onLogin, onClose, isOpen }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    allUsers.find((u) => u.role === 'employee')?.id || allUsers[0]?.id
  );
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter((u) =>
    selectedRole === 'manager' ? u.role === 'manager' : u.role === 'employee'
  );

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const firstUser = allUsers.find((u) => u.role === role);
    if (firstUser) {
      setSelectedUserId(firstUser.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find((u) => u.id === selectedUserId);
    if (!user) {
      setError('Please select a valid user account.');
      return;
    }
    setError(null);
    onLogin(user);
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">GeoClock Portal Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            Indian Enterprise Attendance & Payroll Management System
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleChange('employee')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                selectedRole === 'employee'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Staff Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('manager')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                selectedRole === 'manager'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Manager Login</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* User Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Select Account ({selectedRole === 'manager' ? 'Manager' : 'Staff'})</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active Directory</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle} ({u.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Password / PIN</span>
                <span className="text-[10px] text-slate-500">Default: 123456</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-xs text-rose-400 text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                selectedRole === 'manager'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <span>Login to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider text-center">
              Quick 1-Click Demo Login
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'manager' && (
                          <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.2 rounded font-mono border border-indigo-500/30">
                            MANAGER
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{u.jobTitle} • ₹{u.monthlySalary?.toLocaleString('en-IN')}/mo</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
