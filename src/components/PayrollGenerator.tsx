import React, { useState } from 'react';
import { User, AttendanceRecord, LeaveRequest, SalarySlip } from '../types';
import {
  IndianRupee,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  X,
  Building2,
  Calendar,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PayrollGeneratorProps {
  allUsers: User[];
  allRecords: AttendanceRecord[];
  allLeaves: LeaveRequest[];
  salarySlips: SalarySlip[];
  onSaveSalarySlip: (slip: SalarySlip) => void;
}

export const PayrollGenerator: React.FC<PayrollGeneratorProps> = ({
  allUsers,
  allRecords,
  allLeaves,
  salarySlips,
  onSaveSalarySlip,
}) => {
  const [selectedMonthYear, setSelectedMonthYear] = useState('2026-07');
  const [activePayslipModal, setActivePayslipModal] = useState<SalarySlip | null>(null);

  const staffList = allUsers.filter((u) => u.role === 'employee' || u.role === 'manager');

  // Helper to calculate monthly metrics for a staff member
  const computeStaffPayroll = (user: User) => {
    const [yearStr, monthStr] = selectedMonthYear.split('-');
    const baseMonthly = user.monthlySalary || 50000;
    const workingDays = 26; // Standard Indian enterprise working days per month

    // Filter attendance records for selected month
    const userMonthRecords = allRecords.filter((r) => {
      if (r.userId !== user.id) return false;
      const rDate = new Date(r.date);
      return (
        rDate.getFullYear() === parseInt(yearStr, 10) &&
        rDate.getMonth() + 1 === parseInt(monthStr, 10)
      );
    });

    // Days present (unique dates attended)
    const uniqueDatesPresent = new Set(userMonthRecords.map((r) => r.date));
    const daysPresentCount = uniqueDatesPresent.size;

    // Filter approved leaves for selected month
    const userMonthLeaves = allLeaves.filter((l) => {
      if (l.userId !== user.id || l.status !== 'approved') return false;
      const lDate = new Date(l.startDate);
      return (
        lDate.getFullYear() === parseInt(yearStr, 10) &&
        lDate.getMonth() + 1 === parseInt(monthStr, 10)
      );
    });

    const daysPaidLeave = userMonthLeaves.reduce((acc, curr) => acc + (curr.totalDays || 1), 0);
    const totalPaidDays = Math.min(workingDays, daysPresentCount + daysPaidLeave);
    const absentDays = Math.max(0, workingDays - totalPaidDays);

    // Calculate total overtime hours worked
    const overtimeHours = userMonthRecords.reduce((acc, curr) => {
      return acc + (curr.totalHours > 8 ? curr.totalHours - 8 : 0);
    }, 0);

    // Hourly rate = (Base Monthly / (26 * 8))
    const hourlyRate = baseMonthly / (26 * 8);
    const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5); // 1.5x Overtime rate

    // Late arrival deductions
    const lateCount = userMonthRecords.filter((r) => r.flags.includes('late')).length;
    const lateDeductions = lateCount * 250; // ₹250 penalty per unexcused late arrival

    // Base salary earned
    const earnedBaseSalary = Math.round((baseMonthly / workingDays) * totalPaidDays);

    // Statutory deductions
    const epfDeduction = Math.min(1800, Math.round(earnedBaseSalary * 0.12)); // EPF 12% max 1800
    const esiDeduction = earnedBaseSalary < 21000 ? Math.round(earnedBaseSalary * 0.0075) : 0; // ESI 0.75%

    const netSalary = Math.max(
      0,
      earnedBaseSalary + overtimePay - lateDeductions - epfDeduction - esiDeduction
    );

    // Existing saved slip check
    const existingSlip = salarySlips.find(
      (s) => s.userId === user.id && s.monthYear === selectedMonthYear
    );

    return {
      userId: user.id,
      userName: user.name,
      department: user.department,
      jobTitle: user.jobTitle,
      monthYear: selectedMonthYear,
      monthName: `${new Date(selectedMonthYear + '-01').toLocaleString('default', {
        month: 'long',
      })} ${yearStr}`,
      workingDaysInMonth: workingDays,
      daysPresent: daysPresentCount,
      daysPaidLeave,
      absentDays,
      baseMonthlySalary: baseMonthly,
      earnedBaseSalary,
      overtimeHours: parseFloat(overtimeHours.toFixed(1)),
      overtimePay,
      lateDeductions,
      epfDeduction,
      esiDeduction,
      netSalary,
      status: existingSlip ? existingSlip.status : ('draft' as const),
      generatedAt: existingSlip ? existingSlip.generatedAt : new Date().toISOString(),
      bankAccountNo: user.bankAccountNo || '918230048123',
      ifscCode: user.ifscCode || 'HDFC0001234',
      panNo: user.panNo || 'ABCDE1234F',
    };
  };

  const handleGenerateAll = () => {
    staffList.forEach((user) => {
      const computed = computeStaffPayroll(user);
      onSaveSalarySlip({
        ...computed,
        id: `sal-${user.id}-${selectedMonthYear}`,
        status: 'generated',
      });
    });
  };

  const handleToggleStatus = (user: User) => {
    const computed = computeStaffPayroll(user);
    const existing = salarySlips.find(
      (s) => s.userId === user.id && s.monthYear === selectedMonthYear
    );
    const nextStatus =
      !existing || existing.status === 'draft'
        ? 'generated'
        : existing.status === 'generated'
        ? 'paid'
        : 'draft';

    onSaveSalarySlip({
      ...computed,
      id: existing?.id || `sal-${user.id}-${selectedMonthYear}`,
      status: nextStatus,
      generatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Monthly Salary & Payroll Calculator</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                INR ₹ PAYROLL
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-calculate salaries based on attendance, approved leaves, overtime & EPF/ESI statutory rules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="month"
              value={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleGenerateAll}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Generate All Salary Slips</span>
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Staff Monthly Salary Summary ({selectedMonthYear})
          </h3>
          <span className="text-xs text-slate-400">Total Staff: {staffList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Base Salary</th>
                <th className="py-3 px-4 text-center">Days Present</th>
                <th className="py-3 px-4 text-center">Paid Leaves</th>
                <th className="py-3 px-4 text-center">Overtime (hrs)</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {staffList.map((user) => {
                const payroll = computeStaffPayroll(user);
                const existingSlip = salarySlips.find(
                  (s) => s.userId === user.id && s.monthYear === selectedMonthYear
                );
                const currentStatus = existingSlip ? existingSlip.status : payroll.status;

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-200">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.jobTitle}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      ₹{payroll.baseMonthlySalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">{payroll.daysPresent}</span> / {payroll.workingDaysInMonth}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-indigo-400">
                      {payroll.daysPaidLeave} days
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      {payroll.overtimeHours > 0 ? (
                        <span className="text-amber-400 font-bold">+{payroll.overtimeHours}h</span>
                      ) : (
                        <span className="text-slate-500">0h</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                      -₹{(payroll.lateDeductions + payroll.epfDeduction + payroll.esiDeduction).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-emerald-400">
                      ₹{payroll.netSalary.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          currentStatus === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : currentStatus === 'generated'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {currentStatus === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {currentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-all cursor-pointer"
                        >
                          {currentStatus === 'draft'
                            ? 'Generate'
                            : currentStatus === 'generated'
                            ? 'Mark Paid'
                            : 'Reset Draft'}
                        </button>

                        <button
                          onClick={() =>
                            setActivePayslipModal({
                              ...payroll,
                              id: existingSlip?.id || `sal-${user.id}-${selectedMonthYear}`,
                              status: currentStatus,
                            })
                          }
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Payslip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip View Modal */}
      {activePayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Payslip Header Bar */}
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
                  <span>Print Payslip</span>
                </button>
                <button
                  onClick={() => setActivePayslipModal(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-8 space-y-6 text-xs" id="printable-payslip">
              {/* Company Banner */}
              <div className="border-b border-slate-300 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-black text-slate-900 tracking-tight">
                    GeoClock Technologies India Pvt. Ltd.
                  </h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Manyata Tech Park, Nagavara, Bengaluru, Karnataka 560045
                  </p>
                  <p className="text-[11px] text-slate-500">CIN: U72200KA2024PTC189234 | EPF Code: BG/BNG/0049212</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded text-xs border border-slate-300">
                    PAYSLIP: {activePayslipModal.monthName}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">ID: {activePayslipModal.id}</p>
                </div>
              </div>

              {/* Employee & Bank Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Employee Name:</span> {activePayslipModal.userName}</p>
                  <p><span className="font-bold text-slate-700">Designation:</span> {activePayslipModal.jobTitle}</p>
                  <p><span className="font-bold text-slate-700">Department:</span> {activePayslipModal.department}</p>
                  <p><span className="font-bold text-slate-700">PAN Number:</span> <span className="font-mono">{activePayslipModal.panNo}</span></p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Total Working Days:</span> {activePayslipModal.workingDaysInMonth} days</p>
                  <p><span className="font-bold text-slate-700">Days Attended:</span> {activePayslipModal.daysPresent} days</p>
                  <p><span className="font-bold text-slate-700">Approved Paid Leave:</span> {activePayslipModal.daysPaidLeave} days</p>
                  <p><span className="font-bold text-slate-700">Bank A/C / IFSC:</span> <span className="font-mono">{activePayslipModal.bankAccountNo} ({activePayslipModal.ifscCode})</span></p>
                </div>
              </div>

              {/* Earnings & Deductions Breakup Table */}
              <div className="grid grid-cols-2 gap-0 border border-slate-300 rounded-lg overflow-hidden">
                {/* Earnings Column */}
                <div className="border-r border-slate-300">
                  <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800 uppercase tracking-wider text-[10px]">
                    Earnings Component
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base Salary Earned</span>
                      <span className="font-mono font-bold">₹{activePayslipModal.earnedBaseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overtime Pay ({activePayslipModal.overtimeHours} hrs)</span>
                      <span className="font-mono font-bold text-emerald-700">+₹{activePayslipModal.overtimePay.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings</span>
                      <span className="font-mono">₹{(activePayslipModal.earnedBaseSalary + activePayslipModal.overtimePay).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div>
                  <div className="bg-slate-100 font-bold px-3 py-2 border-b border-slate-300 text-slate-800 uppercase tracking-wider text-[10px]">
                    Statutory Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employee EPF (12%)</span>
                      <span className="font-mono text-rose-700">-₹{activePayslipModal.epfDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ESI Statutory Deduction</span>
                      <span className="font-mono text-rose-700">-₹{activePayslipModal.esiDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Late Arrival Penalty</span>
                      <span className="font-mono text-rose-700">-₹{activePayslipModal.lateDeductions.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-700">
                        -₹{(activePayslipModal.epfDeduction + activePayslipModal.esiDeduction + activePayslipModal.lateDeductions).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">NET PAYABLE AMOUNT</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Direct Deposit to Bank Account</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-700 font-mono">
                    ₹{activePayslipModal.netSalary.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">Generated By:</p>
                  <p>GeoClock HR Automated Payroll System</p>
                </div>
                <div className="text-right border-t border-slate-400 pt-1 px-4">
                  <p className="font-bold text-slate-900">Authorized HR Manager Signature</p>
                  <p>GeoClock India HR Ops</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
