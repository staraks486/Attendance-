import React, { useState, useEffect } from 'react';
import {
  User,
  WorkLocation,
  AttendanceRecord,
  StoreSale,
  StorePurchase,
  AppSettings,
} from '../types';
import {
  ShieldCheck,
  Building2,
  Users,
  UserCheck,
  Plus,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Briefcase,
  Lock,
  ArrowRight,
  Sliders,
  Copy,
  Check,
  LogIn,
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  Activity,
  ArrowUpRight,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { MapView } from './MapView';
import { SettingsView } from './SettingsView';

interface AdminDashboardProps {
  adminUser?: User;
  allUsers: User[];
  workLocations: WorkLocation[];
  attendanceRecords: AttendanceRecord[];
  storeSales: StoreSale[];
  storePurchases: StorePurchase[];
  appSettings?: AppSettings;
  onSaveSettings?: (newSettings: AppSettings) => void;
  onResetData?: () => void;
  externalTab?: string;
  onTabChange?: (tab: string) => void;
  onAddStore?: (newStore: Omit<WorkLocation, 'id'>) => void;
  onDeleteStore?: (storeId: string) => void;
  onAddLocation?: (newLoc: Omit<WorkLocation, 'id'>) => void;
  onUpdateLocation?: (updatedLoc: WorkLocation) => void;
  onDeleteLocation?: (locId: string) => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onSelectUserToLogin?: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  allUsers,
  workLocations,
  attendanceRecords,
  storeSales,
  storePurchases,
  appSettings,
  onSaveSettings,
  onResetData,
  externalTab,
  onTabChange,
  onAddStore,
  onDeleteStore,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSelectUserToLogin,
}) => {
  const handleAddStoreCall = onAddStore || onAddLocation;
  const handleDeleteStoreCall = onDeleteStore || onDeleteLocation;
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'managers' | 'employees' | 'credentials' | 'settings'>('overview');

  useEffect(() => {
    if (externalTab && ['overview', 'stores', 'managers', 'employees', 'credentials', 'settings'].includes(externalTab)) {
      setActiveTab(externalTab as any);
    }
  }, [externalTab]);
  const [searchQuery, setSearchQuery] = useState('');

  // Password visibility map
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditCredentialsModal, setShowEditCredentialsModal] = useState<User | null>(null);

  // New Store Form State
  const [storeName, setStoreName] = useState('');
  const [storeAddr, setStoreAddr] = useState('');
  const [storeLat, setStoreLat] = useState('12.9716');
  const [storeLng, setStoreLng] = useState('77.5946');
  const [storeRadius, setStoreRadius] = useState('200');

  // New Manager / Employee Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userStoreId, setUserStoreId] = useState(workLocations[0]?.id || '');
  const [userDept, setUserDept] = useState('Store Operations');
  const [userJobTitle, setUserJobTitle] = useState('Store General Manager');
  const [userSalary, setUserSalary] = useState('90000');

  // Credentials Edit Form State
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // Hierarchy Data Categorization
  const managers = allUsers.filter((u) => u.role === 'manager');
  const employees = allUsers.filter((u) => u.role === 'employee');
  const admins = allUsers.filter((u) => u.role === 'admin');

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Store Creation
  const handleCreateStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeAddr) return;

    if (handleAddStoreCall) {
      handleAddStoreCall({
        name: storeName,
        address: storeAddr,
        lat: parseFloat(storeLat) || 12.9716,
        lng: parseFloat(storeLng) || 77.5946,
        radiusMeters: parseInt(storeRadius) || 200,
      });
    }

    setShowAddStoreModal(false);
    setStoreName('');
    setStoreAddr('');
  };

  // Submit Manager Creation
  const handleCreateManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userUsername || !userPassword) return;

    const salary = parseFloat(userSalary) || 90000;
    const dailyRate = Math.round(salary / 26);

    onAddUser({
      employeeCode: `MGR-${Math.floor(1000 + Math.random() * 9000)}`,
      username: userUsername,
      password: userPassword,
      name: userName,
      email: userEmail,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 100)}?w=150&auto=format&fit=crop&q=80`,
      role: 'manager',
      department: userDept || 'Store Operations',
      jobTitle: userJobTitle || 'Store General Manager',
      assignedWorkLocationId: userStoreId || workLocations[0]?.id || 'loc-1',
      monthlySalary: salary,
      dailyRate: dailyRate,
      weeklyOffDays: ['Sunday'],
      shiftTiming: '09:00 AM - 06:00 PM IST',
      casualLeaveQuota: 12,
      sickLeaveQuota: 10,
      earnedLeaveQuota: 15,
    });

    setShowAddManagerModal(false);
    setUserName('');
    setUserEmail('');
    setUserUsername('');
    setUserPassword('');
  };

  // Submit Employee Creation
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userUsername || !userPassword) return;

    const salary = parseFloat(userSalary) || 60000;
    const dailyRate = Math.round(salary / 26);

    onAddUser({
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      username: userUsername,
      password: userPassword,
      name: userName,
      email: userEmail,
      avatar: `https://images.unsplash.com/photo-${1500648767791 + Math.floor(Math.random() * 100)}?w=150&auto=format&fit=crop&q=80`,
      role: 'employee',
      department: userDept || 'Store Sales',
      jobTitle: userJobTitle || 'Store Executive',
      assignedWorkLocationId: userStoreId || workLocations[0]?.id || 'loc-1',
      monthlySalary: salary,
      dailyRate: dailyRate,
      weeklyOffDays: ['Sunday', 'Saturday'],
      shiftTiming: '09:00 AM - 06:00 PM IST',
      casualLeaveQuota: 12,
      sickLeaveQuota: 10,
      earnedLeaveQuota: 15,
    });

    setShowAddEmployeeModal(false);
    setUserName('');
    setUserEmail('');
    setUserUsername('');
    setUserPassword('');
  };

  // Update Credentials
  const handleUpdateCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditCredentialsModal) return;

    onUpdateUser({
      ...showEditCredentialsModal,
      username: editUsername,
      password: editPassword,
    });

    setShowEditCredentialsModal(null);
  };

  // Financial Summary Across System
  const totalSalesRevenue = storeSales.reduce((acc, s) => acc + s.amount, 0);
  const totalPurchasesCost = storePurchases.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Corporate Admin Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 text-indigo-400 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Corporate Portal</h1>
                <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded border border-indigo-500/30 uppercase">
                  System Executive
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Full authority to create/delete stores, appoint managers, manage employees, and issue login credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddStoreModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Create New Store</span>
            </button>

            <button
              onClick={() => {
                setUserStoreId(workLocations[0]?.id || '');
                setUserDept('Store Operations');
                setUserJobTitle('Store General Manager');
                setUserSalary('95000');
                setShowAddManagerModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Create Store Manager</span>
            </button>

            <button
              onClick={() => {
                setUserStoreId(workLocations[0]?.id || '');
                setUserDept('Store Sales');
                setUserJobTitle('Store Executive');
                setUserSalary('60000');
                setShowAddEmployeeModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Create Employee</span>
            </button>
          </div>
        </div>

        {/* System Hierarchy Stats Grid */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Active Stores</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-emerald-400 font-mono">{workLocations.length}</span>
              <span className="text-[10px] text-slate-500">Retail Locations</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Store Managers</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-indigo-400 font-mono">{managers.length}</span>
              <span className="text-[10px] text-slate-500">Appointed Leads</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Store Employees</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-amber-400 font-mono">{employees.length}</span>
              <span className="text-[10px] text-slate-500">Staff Members</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Total Store Sales</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400 font-mono">₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Total Purchases</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-400 font-mono">₹{totalPurchasesCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-950" />
          <span>Multi-Store Activity Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'stores' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Stores ({workLocations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('managers')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'managers' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Managers ({managers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'employees' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employees ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'credentials' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Credentials Vault ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Settings</span>
        </button>
      </div>

      {/* TAB 5: Application Settings */}
      {activeTab === 'settings' && appSettings && onSaveSettings && onResetData && (
        <SettingsView
          settings={appSettings}
          onSaveSettings={onSaveSettings}
          onResetData={onResetData}
          activeRole="admin"
        />
      )}

      {/* TAB 0: Multi-Store Live Operations & Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Real-Time KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Store Revenue</span>
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Across {storeSales.length} total customer sales</span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Store Expenses</span>
                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">₹{totalPurchasesCost.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Receipt className="w-3 h-3 text-rose-400" />
                <span>Across {storePurchases.length} supplier orders</span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Net Operating Margin</span>
                <div className={`p-1.5 rounded-lg ${totalSalesRevenue - totalPurchasesCost >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-2xl font-bold font-mono ${totalSalesRevenue - totalPurchasesCost >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{(totalSalesRevenue - totalPurchasesCost).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Combined store gross margin
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Clocked-In Staff Now</span>
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-400 font-mono">
                  {attendanceRecords.filter(r => r.status === 'clocked-in').length}
                </span>
                <span className="text-xs text-slate-400">/ {allUsers.length} Users</span>
              </div>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live radar active</span>
              </p>
            </div>
          </div>

          {/* Store Outlets Real-Time Performance Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>All Store Outlets Real-Time Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitor live operational status, appointed store managers, clocked-in staff, and financial performance by store.
                </p>
              </div>

              <button
                onClick={() => setShowAddStoreModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workLocations.map((loc) => {
                const storeManager = managers.find((m) => m.assignedWorkLocationId === loc.id);
                const storeStaff = allUsers.filter((u) => u.assignedWorkLocationId === loc.id);
                const activeClockedInStaff = storeStaff.filter((u) =>
                  attendanceRecords.some((r) => r.userId === u.id && r.status === 'clocked-in')
                );

                const storeSalesTotal = storeSales
                  .filter((s) => s.storeLocationId === loc.id)
                  .reduce((sum, s) => sum + s.amount, 0);

                const storePurchasesTotal = storePurchases
                  .filter((p) => p.storeLocationId === loc.id)
                  .reduce((sum, p) => sum + p.amount, 0);

                const storeNetProfit = storeSalesTotal - storePurchasesTotal;

                return (
                  <div
                    key={loc.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all relative overflow-hidden group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Store Outlet
                        </span>
                        <h4 className="text-base font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                          {loc.name}
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{loc.address}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 block">Radius</span>
                        <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {loc.radiusMeters}m
                        </span>
                      </div>
                    </div>

                    {/* Manager & Staff Row */}
                    <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {storeManager ? (
                          <>
                            <img
                              src={storeManager.avatar}
                              alt={storeManager.name}
                              className="w-7 h-7 rounded-full object-cover border border-indigo-500/30"
                            />
                            <div>
                              <span className="text-[10px] text-slate-400 block leading-tight">Store Manager</span>
                              <span className="font-semibold text-white text-xs truncate max-w-[110px] block">
                                {storeManager.name}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            <span>No Manager Assigned</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Live Staff</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {activeClockedInStaff.length} / {storeStaff.length} On Duty
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Sales</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">₹{storeSalesTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Expenses</span>
                        <span className="text-xs font-mono font-bold text-rose-400">₹{storePurchasesTotal.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Net</span>
                        <span className={`text-xs font-mono font-bold ${storeNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{storeNetProfit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    {storeManager && (
                      <button
                        onClick={() => onSelectUserToLogin?.(storeManager)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Test & Login as {storeManager.name.split(' ')[0]} (Manager)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Activity Radar & Cross-Store Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Attendance Radar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">Live Multi-Store Clock-In Feed</h3>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  REAL-TIME GPS
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {attendanceRecords
                  .filter((r) => r.status === 'clocked-in')
                  .map((rec) => {
                    const staffUser = allUsers.find((u) => u.id === rec.userId);
                    const storeLoc = workLocations.find((l) => l.id === rec.workLocationId);

                    return (
                      <div
                        key={rec.id}
                        className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={staffUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={staffUser?.name}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-500/30 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{staffUser?.name || 'Unknown Staff'}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
                                {staffUser?.employeeCode}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-emerald-400" />
                              <span>{storeLoc?.name || 'Assigned Store'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>GPS Verified</span>
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            In: {rec.clockInTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {attendanceRecords.filter((r) => r.status === 'clocked-in').length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No active staff currently clocked in across stores.
                  </div>
                )}
              </div>
            </div>

            {/* Live Cross-Store Transactions Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Recent Cross-Store Transactions</h3>
                </div>
                <span className="bg-indigo-500/10 text-indigo-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                  LEDGER FEED
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {storeSales.slice(0, 6).map((sale) => {
                  const storeLoc = workLocations.find((l) => l.id === sale.storeLocationId);
                  return (
                    <div
                      key={sale.id}
                      className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{sale.customerName}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {sale.paymentMethod}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {storeLoc?.name} • {sale.itemsDescription}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-400 text-sm font-mono block">
                          +₹{sale.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {sale.invoiceNumber}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Stores Management */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setShowAddStoreModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Store Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workLocations
              .filter(
                (loc) =>
                  loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  loc.address.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((loc) => {
                const assignedManager = managers.find((m) => m.assignedWorkLocationId === loc.id);
                const storeEmployees = employees.filter((e) => e.assignedWorkLocationId === loc.id);
                const storeSalesList = storeSales.filter((s) => s.storeId === loc.id);
                const totalRevenue = storeSalesList.reduce((acc, s) => acc + s.amount, 0);

                return (
                  <div key={loc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all relative">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-sm font-bold text-white">{loc.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{loc.address}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteStoreCall?.(loc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer border border-slate-700 hover:border-rose-500/30"
                        title="Delete Store Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointed Manager</span>
                        {assignedManager ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <img src={assignedManager.avatar} alt={assignedManager.name} className="w-6 h-6 rounded-full object-cover border border-emerald-500/40" />
                            <div>
                              <p className="text-xs font-bold text-white truncate">{assignedManager.name}</p>
                              <p className="text-[9px] text-indigo-400 font-mono">@{assignedManager.username}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-semibold italic text-[11px] block mt-1">No Manager Appointed</span>
                        )}
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Staff & Revenue</span>
                        <div className="mt-1">
                          <p className="text-xs font-bold text-white">{storeEmployees.length} Employees</p>
                          <p className="text-[10px] text-emerald-400 font-mono font-bold">₹{totalRevenue.toLocaleString('en-IN')} Sales</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Geofence Radius: <strong className="text-emerald-400">{loc.radiusMeters}m</strong></span>
                      <span>Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: Store Managers Management */}
      {activeTab === 'managers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-300">
              Appoint Store Managers, view their assigned store locations, and manage their login credentials.
            </p>

            <button
              onClick={() => {
                setUserStoreId(workLocations[0]?.id || '');
                setUserDept('Store Operations');
                setUserJobTitle('Store General Manager');
                setUserSalary('95000');
                setShowAddManagerModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Appoint Store Manager</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Store Manager</th>
                  <th className="py-3 px-4">Appointed Store</th>
                  <th className="py-3 px-4">Username & Password</th>
                  <th className="py-3 px-4 text-right">Monthly Salary</th>
                  <th className="py-3 px-4 text-center">Test Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {managers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No store managers created yet. Click 'Appoint Store Manager' to create one.
                    </td>
                  </tr>
                ) : (
                  managers.map((mgr) => {
                    const store = workLocations.find((l) => l.id === mgr.assignedWorkLocationId);
                    const isPassVisible = !!showPasswordMap[mgr.id];

                    return (
                      <tr key={mgr.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img src={mgr.avatar} alt={mgr.name} className="w-9 h-9 rounded-full object-cover border border-emerald-500/40" />
                            <div>
                              <p className="font-bold text-white text-xs">{mgr.name}</p>
                              <p className="text-[10px] text-slate-400">{mgr.email}</p>
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">
                                {mgr.employeeCode || mgr.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-200">
                          {store ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                              {store.name}
                            </span>
                          ) : (
                            <span className="text-amber-400 italic">Unassigned Store</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-0.5">
                            <div className="text-indigo-300 font-bold">User: {mgr.username || mgr.email.split('@')[0]}</div>
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <span>Pass: {isPassVisible ? mgr.password || 'manager123' : '••••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(mgr.id)}
                                className="text-slate-500 hover:text-slate-300 ml-1"
                              >
                                {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ₹{(mgr.monthlySalary || 90000).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onSelectUserToLogin?.(mgr)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Switch & Login</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditUsername(mgr.username || mgr.email.split('@')[0]);
                              setEditPassword(mgr.password || 'manager123');
                              setShowEditCredentialsModal(mgr);
                            }}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded cursor-pointer"
                            title="Edit Credentials"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(mgr.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded cursor-pointer ml-1"
                            title="Remove Store Manager"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Store Employees Management */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-300">
              Create and manage all store employees, assign them to store locations, and configure their passwords.
            </p>

            <button
              onClick={() => {
                setUserStoreId(workLocations[0]?.id || '');
                setUserDept('Store Sales');
                setUserJobTitle('Store Executive');
                setUserSalary('60000');
                setShowAddEmployeeModal(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Store Employee</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Assigned Store</th>
                  <th className="py-3 px-4">Login Username & Password</th>
                  <th className="py-3 px-4 text-right">Monthly Salary</th>
                  <th className="py-3 px-4 text-center">Test Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No store employees created yet. Click 'Create Store Employee' to add one.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const store = workLocations.find((l) => l.id === emp.assignedWorkLocationId);
                    const isPassVisible = !!showPasswordMap[emp.id];

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover border border-indigo-500/40" />
                            <div>
                              <p className="font-bold text-white text-xs">{emp.name}</p>
                              <p className="text-[10px] text-slate-400">{emp.jobTitle} • {emp.department}</p>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {emp.employeeCode || emp.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-200">
                          {store ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                              {store.name}
                            </span>
                          ) : (
                            <span className="text-amber-400 italic">Unassigned Store</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-0.5">
                            <div className="text-emerald-300 font-bold">User: {emp.username || emp.email.split('@')[0]}</div>
                            <div className="flex items-center gap-1.5 text-amber-400">
                              <span>Pass: {isPassVisible ? emp.password || 'emp123' : '••••••••'}</span>
                              <button
                                onClick={() => togglePasswordVisibility(emp.id)}
                                className="text-slate-500 hover:text-slate-300 ml-1"
                              >
                                {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ₹{(emp.monthlySalary || 60000).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onSelectUserToLogin?.(emp)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Switch & Login</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditUsername(emp.username || emp.email.split('@')[0]);
                              setEditPassword(emp.password || 'emp123');
                              setShowEditCredentialsModal(emp);
                            }}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 rounded cursor-pointer"
                            title="Edit Credentials"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(emp.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded cursor-pointer ml-1"
                            title="Remove Store Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Credentials Vault */}
      {activeTab === 'credentials' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> System Credentials Vault & Authentication Ledger
              </h3>
              <p className="text-xs text-slate-400">
                All created accounts across Super Admin, Store Managers, and Employees. Test login directly as any user.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Assigned Store</th>
                  <th className="py-3 px-4">Username / Email</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {allUsers.map((u) => {
                  const store = workLocations.find((l) => l.id === u.assignedWorkLocationId);
                  const isPassVisible = !!showPasswordMap[u.id];

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                          <div>
                            <p className="font-bold text-white text-xs">{u.name}</p>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                  : u.role === 'manager'
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {u.role === 'admin' ? (
                          <span className="text-purple-400 font-bold">All System Stores</span>
                        ) : store ? (
                          <span>{store.name}</span>
                        ) : (
                          <span className="text-amber-400">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {u.username || u.email.split('@')[0]}
                      </td>

                      <td className="py-3.5 px-4 text-amber-400 font-bold">
                        <div className="flex items-center gap-2">
                          <span>{isPassVisible ? u.password || 'pass123' : '••••••••'}</span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleCopyCredentials(`${u.username || u.email.split('@')[0]} / ${u.password || 'pass123'}`, u.id)}
                            className="text-slate-500 hover:text-emerald-400 ml-1"
                            title="Copy credentials"
                          >
                            {copiedId === u.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => onSelectUserToLogin?.(u)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 mx-auto shadow-xs"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Log In As {u.name.split(' ')[0]}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW STORE MODAL */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-400" /> Create New Store Location
            </h3>

            <form onSubmit={handleCreateStoreSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Store / Campus Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Cybercity Store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viman Nagar, Pune, MH 411014"
                  value={storeAddr}
                  onChange={(e) => setStoreAddr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Latitude</label>
                  <input
                    type="text"
                    required
                    value={storeLat}
                    onChange={(e) => setStoreLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Longitude</label>
                  <input
                    type="text"
                    required
                    value={storeLng}
                    onChange={(e) => setStoreLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Geofence Radius (Meters)</label>
                <input
                  type="number"
                  required
                  value={storeRadius}
                  onChange={(e) => setStoreRadius(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MANAGER MODAL */}
      {showAddManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-400" /> Appoint Store Manager
            </h3>

            <form onSubmit={handleCreateManagerSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Manager Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Joshi"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@geoclock.in"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-500/30 space-y-3">
                <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Set Manager Login Credentials
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. vikram.mgr"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Password</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. manager123"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Appointed Store Location</label>
                  <select
                    value={userStoreId}
                    onChange={(e) => setUserStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  >
                    {workLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monthly Salary (INR)</label>
                  <input
                    type="number"
                    required
                    value={userSalary}
                    onChange={(e) => setUserSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddManagerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                >
                  Appoint Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-emerald-400" /> Create Store Employee
            </h3>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Employee Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@geoclock.in"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/30 space-y-3">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Set Employee Login Credentials
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. rahul.emp"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Password</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. emp123"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Assigned Store Location</label>
                  <select
                    value={userStoreId}
                    onChange={(e) => setUserStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  >
                    {workLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Monthly Base Salary (INR)</label>
                  <input
                    type="number"
                    required
                    value={userSalary}
                    onChange={(e) => setUserSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CREDENTIALS MODAL */}
      {showEditCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="w-5 h-5 text-amber-400" /> Edit Credentials: {showEditCredentialsModal.name}
            </h3>

            <form onSubmit={handleUpdateCredentialsSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-bold font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditCredentialsModal(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
