import React from 'react';
import { MapPin, Shield, User as UserIcon, Clock, ChevronDown, CheckCircle2, AlertTriangle, RefreshCw, LogIn, Users, Sliders } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isGpsActive: boolean;
  gpsError: string | null;
  onRefreshGps: () => void;
  currentTime: Date;
  onOpenLoginModal: () => void;
  onOpenStaffDirectory?: () => void;
  onOpenSettings?: () => void;
  companyName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeRole,
  onChangeRole,
  isGpsActive,
  gpsError,
  onRefreshGps,
  currentTime,
  onOpenLoginModal,
  onOpenStaffDirectory,
  onOpenSettings,
  companyName = 'Apex Retail & Logistics India Pvt. Ltd.',
}) => {
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 backdrop-blur-md bg-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <MapPin className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">GeoClock</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 hidden xs:inline-flex items-center gap-1">
                🇮🇳 INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[200px]">{companyName}</p>
          </div>
        </div>

        {/* GPS Status & Live Time */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-slate-200">{formattedTime}</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">IST (UTC+5:30)</span>
            <span className="text-xs text-slate-400 font-sans">({formattedDate})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshGps}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                gpsError
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                  : isGpsActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Click to recalibrate GPS location"
            >
              {gpsError ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPS Issue</span>
                </>
              ) : isGpsActive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>GPS Active</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Locate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Role & User Switcher */}
        <div className="flex items-center space-x-3">
          {/* Staff Directory for Manager */}
          {activeRole === 'manager' && onOpenStaffDirectory && (
            <button
              onClick={onOpenStaffDirectory}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Staff Roster</span>
            </button>
          )}

          {/* Settings Trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Open App Control Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Settings</span>
            </button>
          )}

          {/* Login Portal Trigger */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch / Login</span>
          </button>

          {/* Mode Switcher Pills */}
          <div className="bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-700/80 shrink-0">
            <button
              onClick={() => onChangeRole('admin')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden xs:inline">Admin</span>
            </button>
            <button
              onClick={() => onChangeRole('manager')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeRole === 'manager'
                  ? 'bg-indigo-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Manager</span>
            </button>
            <button
              onClick={() => onChangeRole('employee')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeRole === 'employee'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Staff</span>
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 cursor-pointer transition-colors">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{currentUser.department}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-2 hidden group-hover:block z-50">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Switch Account</p>
                <p className="text-[11px] text-slate-400">Click any user to view their workspace</p>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onChangeRole(user.role);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                      currentUser.id === user.id
                        ? 'bg-slate-700/80 text-emerald-400 font-semibold'
                        : 'hover:bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.jobTitle}</p>
                      </div>
                    </div>
                    {currentUser.id === user.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
