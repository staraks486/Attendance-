import React, { useState } from 'react';
import {
  User,
  AttendanceRecord,
  LeaveRequest,
  LateNotice,
  WorkLocation,
  SalarySlip,
  Coordinates,
} from '../types';
import {
  User as UserIcon,
  Clock,
  Calendar,
  IndianRupee,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Plus,
  Send,
  Printer,
  ChevronLeft,
  Briefcase,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { MapView } from './MapView';
import { formatDateShort, formatTimeOnly } from '../utils/geo';

interface StaffProfilePageProps {
  staff: User;
  allRecords: AttendanceRecord[];
  allLeaves: LeaveRequest[];
  allLateNotices: LateNotice[];
  workLocations: WorkLocation[];
  salarySlips: SalarySlip[];
  onBack?: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onClockInStaff?: (location: WorkLocation, notes: string) => void;
  onClockOutStaff?: (recordId: string, notes: string) => void;
  onUpdateLeaveStatus?: (leaveId: string, status: 'approved' | 'rejected', comment?: string) => void;
  onApplyLeaveForStaff?: (leave: Omit<LeaveRequest, 'id' | 'appliedOn'>) => void;
  onSaveSalarySlip?: (slip: SalarySlip) => void;
  isManagerView?: boolean;
}

export const StaffProfilePage: React.FC<StaffProfilePageProps> = ({
  staff,
  allRecords,
  allLeaves,
  allLateNotices,
  workLocations,
  salarySlips,
  onBack,
  onUpdateUser,
  onClockInStaff,
  onClockOutStaff,
  onUpdateLeaveStatus,
  onApplyLeaveForStaff,
  onSaveSalarySlip,
  isManagerView = true,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'weekoff' | 'salary' | 'checkin'>('attendance');

  // Filter records for this specific staff
  const staffRecords = allRecords.filter((r) => r.userId === staff.id);
  const staffLeaves = allLeaves.filter((l) => l.userId === staff.id);
  const staffLateNotices = allLateNotices.filter((n) => n.userId === staff.id);
  const staffSlips = salarySlips.filter((s) => s.userId === staff.id);

  const activeRecord = staffRecords.find((r) => r.status !== 'clocked_out');
  const targetLocation = workLocations.find((l) => l.id === staff.assignedWorkLocationId) || workLocations[0];

  // Stats calculation
  const totalHoursWorked = staffRecords.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const totalShifts = staffRecords.length;
  const geofencedShifts = staffRecords.filter((r) => r.isGeofenced).length;
  const geofenceCompliance = totalShifts > 0 ? Math.round((geofencedShifts / totalShifts) * 100) : 100;
  const onTimeShifts = staffRecords.filter((r) => !r.flags.includes('late')).length;
  const onTimeRate = totalShifts > 0 ? Math.round((onTimeShifts / totalShifts) * 100) : 100;

  // Week Off Editing state
  const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [editingWeekOff, setEditingWeekOff] = useState(false);
  const [selectedOffDays, setSelectedOffDays] = useState<string[]>(staff.weeklyOffDays || ['Sunday', 'Saturday']);
  const [selectedShift, setSelectedShift] = useState(staff.shiftTiming || '09:00 AM - 06:00 PM IST');

  // Salary & Details Editing state
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState<number>(staff.monthlySalary || 60000);
  const [bankAccInput, setBankAccInput] = useState<string>(staff.bankAccountNo || '918230048123');
  const [ifscInput, setIfscInput] = useState<string>(staff.ifscCode || 'HDFC0001234');
  const [panInput, setPanInput] = useState<string>(staff.panNo || 'ABCDE1234F');

  // Manual Check-In Modal state
  const [showManualCheckInModal, setShowManualCheckInModal] = useState(false);
  const [manualNotes, setManualNotes] = useState('');
  const [manualLocId, setManualLocId] = useState(targetLocation.id);

  // Leave Modal state
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave'>('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');

  // Selected Payslip view modal
  const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);

  // Save Week Off updates
  const handleSaveWeekOff = () => {
    onUpdateUser({
      ...staff,
      weeklyOffDays: selectedOffDays,
      shiftTiming: selectedShift,
    });
    setEditingWeekOff(false);
  };

  // Save Salary updates
  const handleSaveSalaryDetails = () => {
    const daily = Math.round(salaryInput / 26);
    onUpdateUser({
      ...staff,
      monthlySalary: salaryInput,
      dailyRate: daily,
      bankAccountNo: bankAccInput,
      ifscCode: ifscInput,
      panNo: panInput,
    });
    setEditingSalary(false);
  };

  // Submit Manual Check-In
  const handleExecuteManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = workLocations.find((l) => l.id === manualLocId) || targetLocation;
    if (onClockInStaff) {
      onClockInStaff(loc, manualNotes || 'Admin manual check-in log');
    }
    setShowManualCheckInModal(false);
    setManualNotes('');
  };

  // Submit Leave Request
  const handleExecuteApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (onApplyLeaveForStaff) {
      onApplyLeaveForStaff({
        userId: staff.id,
        userName: staff.name,
        userAvatar: staff.avatar,
        department: staff.department,
        jobTitle: staff.jobTitle,
        leaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        totalDays,
        reason: leaveReason,
        status: isManagerView ? 'approved' : 'pending',
      });
    }

    setShowApplyLeaveModal(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start md:items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer border border-slate-700"
                title="Back to Directory"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img
              src={staff.avatar}
              alt={staff.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50 shadow-md shrink-0"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">{staff.name}</h1>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-500/20">
                  {staff.employeeCode || `EMP-${staff.id.replace('usr-', '100')}`}
                </span>
                <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded border border-indigo-500/20 uppercase">
                  {staff.role}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span className="font-semibold">{staff.jobTitle}</span>
                <span>•</span>
                <span className="text-slate-400">{staff.department}</span>
                <span>•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  {targetLocation.name}
                </span>
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{staff.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeRecord ? (
              <button
                onClick={() => onClockOutStaff && onClockOutStaff(activeRecord.id, 'Admin clock out')}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Clock Out Staff</span>
              </button>
            ) : (
              <button
                onClick={() => setShowManualCheckInModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Check In Staff</span>
              </button>
            )}

            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Grant / Apply Leave</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block font-medium">Monthly Salary</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
              ₹{(staff.monthlySalary || 60000).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block font-medium">Weekly Off Days</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
              {(staff.weeklyOffDays || ['Sunday', 'Saturday']).join(', ')}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block font-medium">Total Hours Worked</span>
            <span className="text-xs font-bold text-indigo-400 font-mono mt-0.5 block">
              {totalHoursWorked.toFixed(1)} hrs
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block font-medium">Geofence Compliance</span>
            <span className="text-xs font-bold text-teal-400 mt-0.5 block">{geofenceCompliance}%</span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block font-medium">Shift Timings</span>
            <span className="text-[11px] font-bold text-slate-300 mt-0.5 block truncate font-mono">
              {staff.shiftTiming || '09:00 AM - 06:00 PM'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance & Clock Logs ({staffRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leaves'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave & Absence ({staffLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('weekoff')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'weekoff'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Week Off & Shift Roster</span>
        </button>

        <button
          onClick={() => setActiveTab('salary')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'salary'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Salary & Payslips</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'checkin'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>GPS Check-In Radar</span>
        </button>
      </div>

      {/* Tab 1: Attendance Logs */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Individual Attendance Timeline
              </h3>
              <p className="text-xs text-slate-400">All clock-in/out timestamps, verified GPS coordinates, and geofence compliance</p>
            </div>

            <button
              onClick={() => setShowManualCheckInModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Manual Check-In</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Location Zone</th>
                  <th className="py-3 px-4 text-center">Geofence Status</th>
                  <th className="py-3 px-4 text-right">Hours Worked</th>
                  <th className="py-3 px-4">Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      No attendance records found for {staff.name}. Click 'Log Manual Check-In' above to add a shift entry.
                    </td>
                  </tr>
                ) : (
                  staffRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {formatDateShort(record.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-400">
                        {formatTimeOnly(record.clockInTime)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-300">
                        {formatTimeOnly(record.clockOutTime)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <span className="font-medium text-slate-200">{record.clockInLocationName}</span>
                        {record.verifiedLocationAddress && (
                          <p className="text-[10px] text-slate-500 truncate">{record.verifiedLocationAddress}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {record.isGeofenced ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Inside ({record.distanceToGeofenceMeters}m)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Outside ({record.distanceToGeofenceMeters}m)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : 'Active Shift'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate italic text-[11px]">
                        {record.notes || '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Leaves & Absences */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Leave Quota Balances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Casual Leave (CL)</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {12 - staffLeaves.filter((l) => l.leaveType === 'Casual Leave' && l.status === 'approved').reduce((s, l) => s + l.totalDays, 0)} / 12 Days
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Annual entitlement</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Sick Leave (SL)</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {10 - staffLeaves.filter((l) => l.leaveType === 'Sick Leave' && l.status === 'approved').reduce((s, l) => s + l.totalDays, 0)} / 10 Days
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Annual entitlement</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Earned Leave (EL)</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {15 - staffLeaves.filter((l) => l.leaveType === 'Earned Leave' && l.status === 'approved').reduce((s, l) => s + l.totalDays, 0)} / 15 Days
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Privilege leave balance</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Leave History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Leave Request History ({staff.name})
                </h3>
                <p className="text-xs text-slate-400">Manage, approve or reject leave applications for this staff member</p>
              </div>

              <button
                onClick={() => setShowApplyLeaveModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Grant Leave</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Start Date</th>
                    <th className="py-3 px-4">End Date</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {staffLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                        No leave applications submitted by {staff.name}.
                      </td>
                    </tr>
                  ) : (
                    staffLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-emerald-400">{leave.leaveType}</td>
                        <td className="py-3.5 px-4 text-slate-200">{leave.startDate}</td>
                        <td className="py-3.5 px-4 text-slate-200">{leave.endDate}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">{leave.totalDays} days</td>
                        <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">"{leave.reason}"</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              leave.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : leave.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {leave.status === 'pending' && onUpdateLeaveStatus ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onUpdateLeaveStatus(leave.id, 'rejected')}
                                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold rounded transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => onUpdateLeaveStatus(leave.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold rounded transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[10px]">{leave.managerComment || 'Finalized'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Week Off & Shift Roster Schedule */}
      {activeTab === 'weekoff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Week Off & Shift Roster Configuration
              </h3>
              <p className="text-xs text-slate-400">Define assigned week off days and working shift timing for {staff.name}</p>
            </div>

            {!editingWeekOff ? (
              <button
                onClick={() => setEditingWeekOff(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Roster Schedule</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingWeekOff(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeekOff}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Schedule</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Week Off Days Selection */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Assigned Weekly Off Days
              </label>
              <p className="text-xs text-slate-400">
                Staff member will be marked on official 'Week Off' on selected days without penalty.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {ALL_DAYS.map((day) => {
                  const isOff = selectedOffDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={!editingWeekOff}
                      onClick={() => {
                        if (isOff) {
                          setSelectedOffDays(selectedOffDays.filter((d) => d !== day));
                        } else {
                          setSelectedOffDays([...selectedOffDays, day]);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        isOff
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{day}</span>
                      {isOff && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shift Timing Selection */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                Shift Schedule & Working Hours
              </label>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Shift Timing</label>
                {editingWeekOff ? (
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="09:00 AM - 06:00 PM IST">General Shift (09:00 AM - 06:00 PM IST)</option>
                    <option value="09:30 AM - 06:30 PM IST">Operations Shift (09:30 AM - 06:30 PM IST)</option>
                    <option value="08:00 AM - 05:00 PM IST">Early Morning Shift (08:00 AM - 05:00 PM IST)</option>
                    <option value="02:00 PM - 11:00 PM IST">Evening Shift (02:00 PM - 11:00 PM IST)</option>
                    <option value="10:00 PM - 07:00 AM IST">Night Shift (10:00 PM - 07:00 AM IST)</option>
                  </select>
                ) : (
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs font-bold text-emerald-400">
                    {staff.shiftTiming || '09:00 AM - 06:00 PM IST'}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <span>Target Hours / Day:</span>
                  <span className="font-mono font-bold text-white">9.0 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Threshold:</span>
                  <span className="font-mono font-bold text-indigo-400">&gt; 8.0 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Grace Period for Late Clock In:</span>
                  <span className="font-mono font-bold text-amber-400">15 Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Salary & Monthly Payslips */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  Salary Compensation & Bank Account
                </h3>
                <p className="text-xs text-slate-400">Base salary, daily wages, bank credentials, and tax identifiers for {staff.name}</p>
              </div>

              {!editingSalary ? (
                <button
                  onClick={() => setEditingSalary(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Update Salary Details</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingSalary(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSalaryDetails}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Monthly Gross Base</span>
                {editingSalary ? (
                  <input
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-sm text-emerald-400 font-bold font-mono focus:outline-none"
                  />
                ) : (
                  <p className="text-xl font-bold text-emerald-400 font-mono">
                    ₹{(staff.monthlySalary || 60000).toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Calculated Daily Rate</span>
                <p className="text-xl font-bold text-indigo-400 font-mono">
                  ₹{Math.round((staff.monthlySalary || 60000) / 26).toLocaleString('en-IN')} / day
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Bank Account No.</span>
                {editingSalary ? (
                  <input
                    type="text"
                    value={bankAccInput}
                    onChange={(e) => setBankAccInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-200 font-mono mt-1">
                    {staff.bankAccountNo || '918230048123'}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">IFSC & PAN</span>
                {editingSalary ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={ifscInput}
                      onChange={(e) => setIfscInput(e.target.value)}
                      placeholder="IFSC"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
                    />
                    <input
                      type="text"
                      value={panInput}
                      onChange={(e) => setPanInput(e.target.value)}
                      placeholder="PAN"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-300 font-mono mt-1">
                    IFSC: {staff.ifscCode || 'HDFC0001234'} • PAN: {staff.panNo || 'ABCDE1234F'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Generated Salary Slips Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              Monthly Payslips & Salary History ({staff.name})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Pay Period</th>
                    <th className="py-3 px-4 text-center">Attended Days</th>
                    <th className="py-3 px-4 text-right">Earned Base</th>
                    <th className="py-3 px-4 text-right">Overtime Pay</th>
                    <th className="py-3 px-4 text-right">EPF & ESI Deductions</th>
                    <th className="py-3 px-4 text-right font-bold">Net Salary</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {staffSlips.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                        No official salary slips generated yet for {staff.name}. Use the Monthly Payroll tab to compute and issue slips.
                      </td>
                    </tr>
                  ) : (
                    staffSlips.map((slip) => (
                      <tr key={slip.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{slip.monthName}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{slip.daysPresent} / {slip.workingDaysInMonth} days</td>
                        <td className="py-3.5 px-4 text-right font-mono">₹{slip.earnedBaseSalary.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400">+₹{slip.overtimePay.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-400">-₹{(slip.epfDeduction + slip.esiDeduction).toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">₹{slip.netSalary.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {slip.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setViewingSlip(slip)}
                            className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <FileText className="w-3 h-3" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: GPS Check-In Radar */}
      {activeTab === 'checkin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                GPS Verification Radar & Office Target
              </h3>
              <p className="text-xs text-slate-400">Target Office Campus: {targetLocation.name} ({targetLocation.address})</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold">Geofence Radius: {targetLocation.radiusMeters}m</span>
          </div>

          <MapView
            userCoords={staffRecords[0]?.clockInCoords || { lat: targetLocation.lat, lng: targetLocation.lng, accuracy: 10 }}
            selectedLocation={targetLocation}
            allLocations={workLocations}
            height="450px"
          />
        </div>
      )}

      {/* Manual Check-In Modal */}
      {showManualCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Log Check-In for {staff.name}
              </h3>
              <button
                onClick={() => setShowManualCheckInModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteManualCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Work Zone Location</label>
                <select
                  value={manualLocId}
                  onChange={(e) => setManualLocId(e.target.value)}
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
                <label className="text-slate-300 font-bold block mb-1">Remarks / Shift Notes</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Onsite client duty or manager approval"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualCheckInModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                >
                  Confirm Clock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant / Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Grant / Apply Leave for {staff.name}
              </h3>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Reason for Leave</label>
                <textarea
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the reason for leave application..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold"
                >
                  Confirm & Grant Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Official Salary Slip — GeoClock Technologies</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setViewingSlip(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-xs">
              <div className="border-b border-slate-300 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    GeoClock Technologies India Pvt. Ltd.
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Manyata Tech Park, Nagavara, Bengaluru, KA 560045
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded text-xs border border-slate-300">
                    PAYSLIP: {viewingSlip.monthName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Employee Name:</span> {viewingSlip.userName}</p>
                  <p><span className="font-bold text-slate-700">Designation:</span> {viewingSlip.jobTitle}</p>
                  <p><span className="font-bold text-slate-700">Department:</span> {viewingSlip.department}</p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Working Days:</span> {viewingSlip.workingDaysInMonth} days</p>
                  <p><span className="font-bold text-slate-700">Days Attended:</span> {viewingSlip.daysPresent} days</p>
                  <p><span className="font-bold text-slate-700">Paid Leave:</span> {viewingSlip.daysPaidLeave} days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border border-slate-300 rounded-lg overflow-hidden">
                <div className="border-r border-slate-300">
                  <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800 uppercase tracking-wider text-[10px]">
                    Earnings
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Earned Base Salary</span>
                      <span className="font-mono font-bold">₹{viewingSlip.earnedBaseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overtime Pay</span>
                      <span className="font-mono font-bold text-emerald-700">+₹{viewingSlip.overtimePay.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800 uppercase tracking-wider text-[10px]">
                    Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">EPF & ESI</span>
                      <span className="font-mono text-rose-700">-₹{(viewingSlip.epfDeduction + viewingSlip.esiDeduction).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Late Penalty</span>
                      <span className="font-mono text-rose-700">-₹{viewingSlip.lateDeductions.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">NET PAYABLE</p>
                  <p className="text-[10px] text-emerald-700">Directly Credited to Bank Account</p>
                </div>
                <p className="text-2xl font-black text-emerald-700 font-mono">
                  ₹{viewingSlip.netSalary.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
