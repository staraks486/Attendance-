import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  ShieldAlert,
  Search,
  Building,
  UserPlus,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  IndianRupee,
  ChevronRight,
  UserCheck,
  Eye,
  Sliders,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Package,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { AttendanceRecord, User, WorkLocation, LeaveRequest, LateNotice, SalarySlip, StoreSale, StorePurchase, AppSettings } from '../types';
import { MapView } from './MapView';
import { ActivityFeed } from './ActivityFeed';
import { PayrollGenerator } from './PayrollGenerator';
import { LeaveModal } from './LeaveModal';
import { LateNoticeModal } from './LateNoticeModal';
import { StaffDirectoryModal } from './StaffDirectoryModal';
import { StaffProfilePage } from './StaffProfilePage';
import { SettingsView } from './SettingsView';
import { formatTimeOnly } from '../utils/geo';

interface ManagerDashboardProps {
  currentUser?: User;
  allRecords: AttendanceRecord[];
  allUsers: User[];
  workLocations: WorkLocation[];
  allLeaves: LeaveRequest[];
  allLateNotices: LateNotice[];
  salarySlips: SalarySlip[];
  storeSales?: StoreSale[];
  storePurchases?: StorePurchase[];
  appSettings?: AppSettings;
  onSaveSettings?: (newSettings: AppSettings) => void;
  onResetData?: () => void;
  externalTab?: string;
  onTabChange?: (tab: string) => void;
  onAddLocation: (location: Omit<WorkLocation, 'id'>) => void;
  onForceClockOut: (recordId: string) => void;
  onAddManualShift: () => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected', comment?: string) => void;
  onApplyLeaveForStaff: (leave: Omit<LeaveRequest, 'id' | 'appliedOn'>) => void;
  onClockInStaff: (user: User, location: WorkLocation, notes: string) => void;
  onAcknowledgeLateNotice: (noticeId: string) => void;
  onSaveSalarySlip: (slip: SalarySlip) => void;
  onAddSale?: (sale: Omit<StoreSale, 'id' | 'timestamp'>) => void;
  onAddPurchase?: (purchase: Omit<StorePurchase, 'id' | 'timestamp'>) => void;
  onTogglePurchaseStatus?: (purchaseId: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  currentUser,
  allRecords,
  allUsers,
  workLocations,
  allLeaves,
  allLateNotices,
  salarySlips,
  storeSales = [],
  storePurchases = [],
  appSettings,
  onSaveSettings,
  onResetData,
  externalTab,
  onTabChange,
  onAddLocation,
  onForceClockOut,
  onAddManualShift,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateLeaveStatus,
  onApplyLeaveForStaff,
  onClockInStaff,
  onAcknowledgeLateNotice,
  onSaveSalarySlip,
  onAddSale,
  onAddPurchase,
  onTogglePurchaseStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'staff' | 'sales' | 'purchases' | 'payroll' | 'leaves' | 'locations' | 'settings'>('live');

  useEffect(() => {
    if (externalTab && ['live', 'staff', 'sales', 'purchases', 'payroll', 'leaves', 'locations', 'settings'].includes(externalTab)) {
      setActiveTab(externalTab as any);
    }
  }, [externalTab]);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Modals state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // New Store Sale Form State
  const [custName, setCustName] = useState('');
  const [saleAmount, setSaleAmount] = useState('4500');
  const [payMethod, setPayMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [itemCount, setItemCount] = useState('3');
  const [saleNotes, setSaleNotes] = useState('');

  // New Store Purchase Form State
  const [supplierName, setSupplierName] = useState('');
  const [purCategory, setPurCategory] = useState('Store Inventory');
  const [purAmount, setPurAmount] = useState('12500');
  const [purPayStatus, setPurPayStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [purNotes, setPurNotes] = useState('');

  // If a specific staff member is selected, show their unique profile page!
  const selectedStaff = allUsers.find((u) => u.id === selectedStaffId);

  if (selectedStaff) {
    return (
      <StaffProfilePage
        staff={selectedStaff}
        allRecords={allRecords}
        allLeaves={allLeaves}
        allLateNotices={allLateNotices}
        workLocations={workLocations}
        salarySlips={salarySlips}
        onBack={() => setSelectedStaffId(null)}
        onUpdateUser={onUpdateUser}
        onClockInStaff={(location, notes) => onClockInStaff(selectedStaff, location, notes)}
        onClockOutStaff={(recordId, notes) => onForceClockOut(recordId)}
        onUpdateLeaveStatus={onUpdateLeaveStatus}
        onApplyLeaveForStaff={onApplyLeaveForStaff}
        onSaveSalarySlip={onSaveSalarySlip}
        isManagerView={true}
      />
    );
  }

  // New location form state
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddr, setNewLocAddr] = useState('');
  const [newLocLat, setNewLocLat] = useState('13.0458');
  const [newLocLng, setNewLocLng] = useState('77.6200');
  const [newLocRadius, setNewLocRadius] = useState('200');

  // Filter records for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = allRecords.filter((r) => r.date === todayStr);

  // Stats calculation
  const clockedIn = todayRecords.filter((r) => r.status === 'clocked_in');
  const onBreak = todayRecords.filter((r) => r.status === 'on_break');
  const clockedOut = todayRecords.filter((r) => r.status === 'clocked_out');
  const outsideGeofence = todayRecords.filter((r) => !r.isGeofenced && r.status !== 'clocked_out');
  const lateArrivals = todayRecords.filter((r) => r.flags.includes('late'));
  const pendingLeaves = allLeaves.filter((l) => l.status === 'pending');
  const pendingLateNotices = allLateNotices.filter((n) => n.status === 'pending');

  // Departments list
  const departments = ['All', 'Engineering', 'Operations', 'Sales', 'Product', 'People & Operations'];

  // Filtered today records
  const filteredRecords = todayRecords.filter((r) => {
    const matchesDept = departmentFilter === 'All' || r.department === departmentFilter;
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clockInLocationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName || !newLocAddr) return;

    onAddLocation({
      name: newLocName,
      address: newLocAddr,
      lat: parseFloat(newLocLat) || 13.0458,
      lng: parseFloat(newLocLng) || 77.6200,
      radiusMeters: parseInt(newLocRadius, 10) || 200,
    });

    setNewLocName('');
    setNewLocAddr('');
    setShowLocationModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Real-Time Activity Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-emerald-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Onsite</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{clockedIn.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Staff Roster</p>
            <p className="text-2xl font-black text-indigo-700 mt-0.5">{allUsers.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded text-amber-700 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Pending Leave Approvals</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingLeaves.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded text-rose-700 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Geofence Flagged</p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{outsideGeofence.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-teal-50 border border-teal-100 rounded text-teal-700 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Monthly Payroll</p>
            <p className="text-sm font-black text-teal-800 mt-0.5">
              ₹{allUsers.reduce((sum, u) => sum + (u.monthlySalary || 50000), 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto w-full sm:w-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'live'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Radar
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sales'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Store Sales</span>
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'purchases'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Store Purchases</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'staff'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Directory ({allUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              activeTab === 'payroll'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Payroll</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 relative ${
              activeTab === 'leaves'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leaves ({pendingLeaves.length + pendingLateNotices.length})
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'locations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Work Zones ({workLocations.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add / Manage Staff</span>
          </button>

          <button
            onClick={onAddManualShift}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Log Shift</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && appSettings && onSaveSettings && onResetData && (
        <SettingsView
          settings={appSettings}
          onSaveSettings={onSaveSettings}
          onResetData={onResetData}
          activeRole="manager"
        />
      )}

      {/* Tab Content: Live Activity */}
      {activeTab === 'live' && (
        <div className="space-y-5">
          <ActivityFeed
            records={allRecords}
            allUsers={allUsers}
            workLocations={workLocations}
            onForceClockOut={onForceClockOut}
          />
        </div>
      )}

      {/* Tab Content: Store Sales */}
      {activeTab === 'sales' && (
        <div className="space-y-5">
          {/* Sales Header & KPI Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Store Sales & Revenue Ledger</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track store sales revenue, customer transactions, and payment methods (UPI, Cash, Card).
                </p>
              </div>

              <button
                onClick={() => setShowSaleModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Store Sale</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Total Store Sales</span>
                <p className="text-xl font-black text-emerald-800 font-mono">
                  ₹{storeSales.reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-indigo-700 font-bold uppercase">UPI Payments</span>
                <p className="text-xl font-black text-indigo-800 font-mono">
                  ₹{storeSales.filter(s => s.paymentMethod === 'UPI').reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-amber-700 font-bold uppercase">Card Payments</span>
                <p className="text-xl font-black text-amber-800 font-mono">
                  ₹{storeSales.filter(s => s.paymentMethod === 'Card').reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-slate-600 font-bold uppercase">Cash On Counter</span>
                <p className="text-xl font-black text-slate-800 font-mono">
                  ₹{storeSales.filter(s => s.paymentMethod === 'Cash').reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daily Sales Receipts Log</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Invoice & Date</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Store / Location</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No sales transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    storeSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{sale.invoiceNo}</span>
                          <span className="text-[10px] text-slate-400">{sale.date}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{sale.customerName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{sale.storeName}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            sale.paymentMethod === 'UPI' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            sale.paymentMethod === 'Card' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{sale.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">{sale.createdBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Store Purchases */}
      {activeTab === 'purchases' && (
        <div className="space-y-5">
          {/* Purchases Header & KPI Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Store Purchases & Inventory Expenses</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage supplier purchases, inventory re-orders, utilities, and store maintenance expenses.
                </p>
              </div>

              <button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log Store Purchase / Expense</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-slate-600 font-bold uppercase">Total Purchases Expense</span>
                <p className="text-xl font-black text-slate-800 font-mono">
                  ₹{storePurchases.reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Paid Invoices</span>
                <p className="text-xl font-black text-emerald-800 font-mono">
                  ₹{storePurchases.filter(p => p.paymentStatus === 'Paid').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-3.5 space-y-1">
                <span className="text-[10px] text-rose-700 font-bold uppercase">Pending Supplier Payables</span>
                <p className="text-xl font-black text-rose-800 font-mono">
                  ₹{storePurchases.filter(p => p.paymentStatus === 'Pending').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Purchases History Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Purchase Orders & Expenses History</h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">PO Number & Date</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storePurchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No purchase orders or expenses logged yet.
                      </td>
                    </tr>
                  ) : (
                    storePurchases.map((pur) => (
                      <tr key={pur.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{pur.purchaseNo}</span>
                          <span className="text-[10px] text-slate-400">{pur.date}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{pur.supplierName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{pur.itemCategory}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => onTogglePurchaseStatus && onTogglePurchaseStatus(pur.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                              pur.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {pur.paymentStatus}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          ₹{pur.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">{pur.createdBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Daily Staff Attendance Cards */}
      {activeTab === 'live' && (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Daily Staff Attendance Cards ({filteredRecords.length})
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <div className="flex items-center space-x-2 w-full sm:w-auto bg-slate-50 border border-slate-200 rounded px-2.5 py-1">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full sm:w-48 font-medium"
                  />
                </div>

                <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                  <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 shrink-0">
                    <Filter className="w-3 h-3 text-slate-400" /> Dept:
                  </span>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className={`bg-white border rounded-lg p-3.5 shadow-2xs transition-all hover:border-slate-300 ${
                    !record.isGeofenced && record.status !== 'clocked_out'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={record.userAvatar}
                        alt={record.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{record.userName}</h4>
                        <p className="text-[10px] text-slate-500">{record.jobTitle}</p>
                      </div>
                    </div>

                    <div>
                      {record.status === 'clocked_in' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Clocked In
                        </span>
                      )}
                      {record.status === 'on_break' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          On Break
                        </span>
                      )}
                      {record.status === 'clocked_out' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Clocked Out
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 text-[11px]">Location:</span>
                      <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">{record.clockInLocationName}</span>
                    </div>

                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 text-[11px]">Clock In Time:</span>
                      <span className="font-mono font-bold text-indigo-700 text-[11px]">{formatTimeOnly(record.clockInTime)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span className="text-slate-500 text-[11px]">Geofence:</span>
                      {record.isGeofenced ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Verified ({record.distanceToGeofenceMeters}m)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center gap-1 text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Offsite ({record.distanceToGeofenceMeters}m)
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[10px] text-slate-600 italic mt-1.5">
                        &quot;{record.notes}&quot;
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedStaffId(record.userId)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Staff Page</span>
                    </button>

                    {record.status !== 'clocked_out' && (
                      <button
                        onClick={() => onForceClockOut(record.id)}
                        className="text-[10px] font-bold text-rose-700 hover:text-rose-800 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors cursor-pointer"
                      >
                        Force Clock Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Tab Content: Staff Directory */}
      {activeTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Staff Directory & Salary Management
              </h3>
              <p className="text-xs text-slate-400">Managers can add new employees, delete profiles, or update monthly salary rates</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allUsers.map((user) => {
              const loc = workLocations.find((l) => l.id === user.assignedWorkLocationId);

              return (
                <div
                  key={user.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-white">{user.name}</h4>
                        <p className="text-[10px] text-slate-400">{user.jobTitle}</p>
                        <p className="text-[10px] text-slate-500">{user.department}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        user.role === 'manager'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-sans">Emp ID & Code:</span>
                      <span className="text-emerald-400 font-bold">{user.employeeCode || `EMP-${user.id.replace('usr-', '100')}`}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-sans">Monthly Base:</span>
                      <span className="text-emerald-400 font-bold">₹{(user.monthlySalary || 50000).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-slate-500 font-sans">Office Campus:</span>
                      <span className="text-slate-300">{loc?.name.split(' ')[0] || 'HQ'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-slate-500 font-sans">Week Off:</span>
                      <span className="text-amber-400 font-sans font-medium">{(user.weeklyOffDays || ['Sunday', 'Saturday']).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedStaffId(user.id)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Unique Staff Page</span>
                    </button>

                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 rounded border border-rose-500/20 transition-all cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Monthly Payroll Generator */}
      {activeTab === 'payroll' && (
        <PayrollGenerator
          allUsers={allUsers}
          allRecords={allRecords}
          allLeaves={allLeaves}
          salarySlips={salarySlips}
          onSaveSalarySlip={onSaveSalarySlip}
        />
      )}

      {/* Tab Content: Leaves & Late Notices Approvals */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Approvals */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Employee Leave Requests ({pendingLeaves.length} Pending)
            </h3>

            {allLeaves.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">No leave applications submitted.</p>
            ) : (
              allLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={leave.userAvatar}
                        alt={leave.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{leave.userName}</div>
                        <div className="text-[10px] text-slate-400">{leave.department}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        leave.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : leave.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span className="text-emerald-400">{leave.leaveType}</span>
                      <span>
                        {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                      </span>
                    </div>
                    <p className="text-slate-400 italic text-[11px]">"{leave.reason}"</p>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => onUpdateLeaveStatus(leave.id, 'rejected', 'Rejected by HR')}
                        className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onUpdateLeaveStatus(leave.id, 'approved', 'Approved by HR')}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Late Notice Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-amber-400" />
              Late Arrival Notices ({pendingLateNotices.length} Unacknowledged)
            </h3>

            {allLateNotices.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">No late arrival notices reported.</p>
            ) : (
              allLateNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={notice.userAvatar}
                        alt={notice.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{notice.userName}</div>
                        <div className="text-[10px] text-slate-400">{notice.department}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        notice.status === 'acknowledged'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {notice.status}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg space-y-1">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Date: {notice.date}</span>
                      <span className="text-amber-400">ETA: {notice.expectedTime}</span>
                    </div>
                    <p className="text-slate-400 italic text-[11px]">"{notice.reason}"</p>
                  </div>

                  {notice.status === 'pending' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onAcknowledgeLateNotice(notice.id)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Work Zones / Geofences */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {workLocations.map((loc) => (
            <div
              key={loc.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{loc.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{loc.address}</p>
                  </div>
                  {loc.isDefault && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                      HQ Default
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-medium text-[11px]">Coordinates:</span>
                    <p className="font-mono text-slate-800 font-bold text-[11px] mt-0.5">
                      {loc.lat.toFixed(4)}°, {loc.lng.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium text-[11px]">Geofence Radius:</span>
                    <p className="font-mono text-indigo-700 font-black text-[11px] mt-0.5">{loc.radiusMeters} meters</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
                <span className="text-slate-500 font-medium text-[11px]">Auto GPS Verification</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Zone
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" /> Add Office Work Zone
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Work Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Tech Park Zone"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kharadi, Pune, Maharashtra 411014"
                  value={newLocAddr}
                  onChange={(e) => setNewLocAddr(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">Latitude</label>
                  <input
                    type="text"
                    required
                    value={newLocLat}
                    onChange={(e) => setNewLocLat(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Longitude</label>
                  <input
                    type="text"
                    required
                    value={newLocLng}
                    onChange={(e) => setNewLocLng(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Geofence Radius (Meters)</label>
                <select
                  value={newLocRadius}
                  onChange={(e) => setNewLocRadius(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="100">100 meters (Strict Building)</option>
                  <option value="200">200 meters (Standard Campus)</option>
                  <option value="350">350 meters (Large Complex)</option>
                  <option value="500">500 meters (Field Radius)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold rounded text-xs hover:bg-indigo-700 shadow-2xs cursor-pointer"
                >
                  Save Work Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Directory Modal */}
      {showStaffModal && (
        <StaffDirectoryModal
          allUsers={allUsers}
          workLocations={workLocations}
          onAddUser={onAddUser}
          onDeleteUser={onDeleteUser}
          onClose={() => setShowStaffModal(false)}
        />
      )}

      {/* Log Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-5 h-5 text-emerald-600" /> Log New Store Sale
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!custName || !saleAmount || !onAddSale) return;
                const store = workLocations.find(l => l.id === currentUser?.assignedWorkLocationId) || workLocations[0];
                onAddSale({
                  storeId: store?.id || 'loc-1',
                  storeName: store?.name || 'HQ Store',
                  date: new Date().toISOString().split('T')[0],
                  invoiceNo: `INV-${Math.floor(8000 + Math.random() * 1900)}`,
                  customerName: custName,
                  amount: parseFloat(saleAmount) || 0,
                  paymentMethod: payMethod,
                  itemsCount: parseInt(itemCount) || 1,
                  notes: saleNotes || 'Store counter POS sale',
                  createdBy: currentUser?.name || 'Store Manager',
                });
                setShowSaleModal(false);
                setCustName('');
                setSaleNotes('');
              }}
              className="space-y-3.5 text-xs text-slate-700"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anish Kapoor"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Total Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="Card">Card / POS Terminal</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Number of Items Purchased</label>
                <input
                  type="number"
                  required
                  value={itemCount}
                  onChange={(e) => setItemCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Sale Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Retail hardware & scanner accessories"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaleModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-2xs"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Package className="w-5 h-5 text-indigo-600" /> Log Store Purchase / Expense
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!supplierName || !purAmount || !onAddPurchase) return;
                const store = workLocations.find(l => l.id === currentUser?.assignedWorkLocationId) || workLocations[0];
                onAddPurchase({
                  storeId: store?.id || 'loc-1',
                  storeName: store?.name || 'HQ Store',
                  date: new Date().toISOString().split('T')[0],
                  purchaseNo: `PO-${Math.floor(5000 + Math.random() * 4900)}`,
                  supplierName: supplierName,
                  itemCategory: purCategory,
                  amount: parseFloat(purAmount) || 0,
                  paymentStatus: purPayStatus,
                  notes: purNotes || 'Store inventory purchase order',
                  createdBy: currentUser?.name || 'Store Manager',
                });
                setShowPurchaseModal(false);
                setSupplierName('');
                setPurNotes('');
              }}
              className="space-y-3.5 text-xs text-slate-700"
            >
              <div>
                <label className="font-bold text-slate-800 block mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Retail Wholesale"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Expense Category</label>
                <select
                  value={purCategory}
                  onChange={(e) => setPurCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                >
                  <option value="Store Inventory">Store Inventory Stock</option>
                  <option value="Store Hardware & Utilities">Store Hardware & Utilities</option>
                  <option value="Safety & Maintenance">Safety & Facility Maintenance</option>
                  <option value="Marketing & POS Displays">Marketing & POS Displays</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Invoice Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={purAmount}
                    onChange={(e) => setPurAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Payment Status</label>
                  <select
                    value={purPayStatus}
                    onChange={(e) => setPurPayStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                  >
                    <option value="Paid">Paid Fully</option>
                    <option value="Pending">Payment Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Purchase Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt paper rolls & POS barcode scanners"
                  value={purNotes}
                  onChange={(e) => setPurNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-2xs"
                >
                  Save Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
