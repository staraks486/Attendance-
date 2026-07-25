import React from 'react';
import {
  Clock,
  Calendar,
  FileText,
  User as UserIcon,
  Activity,
  ShoppingBag,
  Package,
  Users,
  Building2,
  Shield,
  LogIn,
  IndianRupee,
  Receipt,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface MobileBottomNavProps {
  currentUser: User;
  activeRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenLoginModal: () => void;
  onOpenLeaveModal?: () => void;
  onOpenPayslipModal?: () => void;
  onOpenLateModal?: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  clockedIn: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentUser,
  activeRole,
  onChangeRole,
  onOpenLoginModal,
  onOpenLeaveModal,
  onOpenPayslipModal,
  onOpenLateModal,
  activeTab,
  onSelectTab,
  clockedIn,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1.5 shadow-2xl pb-safe">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {/* EMPLOYEE MOBILE TABS */}
        {activeRole === 'employee' && (
          <>
            <button
              onClick={() => onSelectTab?.('clock')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'clock' || !activeTab
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Clock className="w-5 h-5" />
                {clockedIn && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">Clock In</span>
            </button>

            <button
              onClick={onOpenLeaveModal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] mt-0.5 font-medium">Leaves</span>
            </button>

            <button
              onClick={onOpenPayslipModal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5 text-indigo-400" />
              <span className="text-[10px] mt-0.5 font-medium">Payslip</span>
            </button>

            <button
              onClick={onOpenLoginModal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/50"
              />
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[50px]">Switch</span>
            </button>
          </>
        )}

        {/* MANAGER MOBILE TABS */}
        {activeRole === 'manager' && (
          <>
            <button
              onClick={() => onSelectTab?.('live')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'live' || !activeTab
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Radar</span>
            </button>

            <button
              onClick={() => onSelectTab?.('sales')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Sales</span>
            </button>

            <button
              onClick={() => onSelectTab?.('purchases')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'purchases'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Expenses</span>
            </button>

            <button
              onClick={() => onSelectTab?.('payroll')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'payroll'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IndianRupee className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Payroll</span>
            </button>

            <button
              onClick={() => onSelectTab?.('settings')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Settings</span>
            </button>

            <button
              onClick={onOpenLoginModal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/50"
              />
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[50px]">Switch</span>
            </button>
          </>
        )}

        {/* ADMIN MOBILE TABS */}
        {activeRole === 'admin' && (
          <>
            <button
              onClick={() => onSelectTab?.('overview')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview' || !activeTab
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Radar</span>
            </button>

            <button
              onClick={() => onSelectTab?.('stores')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'stores'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Stores</span>
            </button>

            <button
              onClick={() => onSelectTab?.('employees')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'employees'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Staff</span>
            </button>

            <button
              onClick={() => onSelectTab?.('settings')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">Settings</span>
            </button>

            <button
              onClick={onOpenLoginModal}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-purple-500/50"
              />
              <span className="text-[10px] mt-0.5 font-medium truncate max-w-[50px]">Switch</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
