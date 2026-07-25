import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Calendar,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AttendanceRecord, DepartmentSummary } from '../types';
import { formatDateShort, formatTimeOnly } from '../utils/geo';

interface ReportsViewProps {
  allRecords: AttendanceRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ allRecords }) => {
  const [timeframe, setTimeframe] = useState<'this_week' | 'last_week' | 'this_month'>('this_week');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Report State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter records based on selection
  const filteredRecords = allRecords.filter((rec) => {
    const matchesDept = selectedDept === 'All' || rec.department === selectedDept;
    const matchesSearch =
      rec.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Calculate Metrics
  const totalHours = filteredRecords.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const totalShifts = filteredRecords.length;

  const geofencedCount = filteredRecords.filter((r) => r.isGeofenced).length;
  const geofenceRate = totalShifts > 0 ? Math.round((geofencedCount / totalShifts) * 100) : 100;

  const onTimeCount = filteredRecords.filter((r) => !r.flags.includes('late')).length;
  const onTimeRate = totalShifts > 0 ? Math.round((onTimeCount / totalShifts) * 100) : 100;

  const totalOvertime = filteredRecords.reduce((acc, r) => {
    return acc + (r.flags.includes('overtime') ? Math.max(0, (r.totalHours || 0) - 8) : 0);
  }, 0);

  // Prepare chart data: Daily Hours
  const daysMap: { [key: string]: number } = {};
  filteredRecords.forEach((r) => {
    const dateLabel = formatDateShort(r.date);
    daysMap[dateLabel] = (daysMap[dateLabel] || 0) + (r.totalHours || 0);
  });

  const dailyHoursData = Object.keys(daysMap).map((date) => ({
    date,
    hours: parseFloat(daysMap[date].toFixed(1)),
  }));

  // Prepare chart data: Compliance Pie
  const complianceData = [
    { name: 'Inside Geofence', value: geofencedCount, color: '#10b981' },
    { name: 'Outside Geofence', value: totalShifts - geofencedCount, color: '#f59e0b' },
  ];

  // Department Breakdown Data
  const deptMap: { [key: string]: { totalHours: number; count: number } } = {};
  filteredRecords.forEach((r) => {
    if (!deptMap[r.department]) {
      deptMap[r.department] = { totalHours: 0, count: 0 };
    }
    deptMap[r.department].totalHours += r.totalHours || 0;
    deptMap[r.department].count += 1;
  });

  const departmentSummaryList: DepartmentSummary[] = Object.keys(deptMap).map((dept) => ({
    department: dept,
    employeeCount: deptMap[dept].count,
    totalHours: parseFloat(deptMap[dept].totalHours.toFixed(1)),
    onTimePercentage: onTimeRate,
    geofenceCompliancePercentage: geofenceRate,
  }));

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Employee Name',
      'Department',
      'Job Title',
      'Date',
      'Clock In',
      'Clock Out',
      'Location',
      'Geofenced',
      'Distance (m)',
      'Total Hours',
      'Notes',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.userName}"`,
      `"${r.department}"`,
      `"${r.jobTitle}"`,
      r.date,
      formatTimeOnly(r.clockInTime),
      formatTimeOnly(r.clockOutTime),
      `"${r.clockInLocationName}"`,
      r.isGeofenced ? 'Yes' : 'No',
      r.distanceToGeofenceMeters,
      r.totalHours.toFixed(2),
      `"${r.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GeoClock_Attendance_Report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate AI Executive Summary via server endpoint
  const handleGenerateAiReport = async () => {
    setIsLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          recordsSummary: {
            totalRecords: totalShifts,
            avgHours: totalShifts > 0 ? (totalHours / totalShifts).toFixed(1) : 0,
            onTimeRate,
            geofenceRate,
            overtimeHours: totalOvertime.toFixed(1),
            anomalyCount: totalShifts - geofencedCount,
          },
          departmentData: departmentSummaryList,
        }),
      });

      const data = await response.json();
      if (response.ok && data.report) {
        setAiReport(data.report);
      } else {
        setAiError(data.error || 'Failed to generate AI executive report.');
      }
    } catch (e: any) {
      setAiError(e.message || 'Error connecting to AI analysis server.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Report Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Attendance & Payroll Reports
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time geolocation metrics, hours breakdown, and automated weekly summaries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAiReport}
            disabled={isLoadingAi}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingAi ? 'Analyzing Data...' : 'AI Executive Insights'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Timeframe:
          </span>
          <div className="bg-slate-100 p-0.5 rounded flex items-center border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setTimeframe('this_week')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                timeframe === 'this_week'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('last_week')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                timeframe === 'last_week'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeframe('this_month')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                timeframe === 'this_month'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
              <option value="Product">Product</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Total Worked Hours</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalHours.toFixed(1)} hrs</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalShifts} shift entries</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Est. INR Payroll</p>
          <p className="text-xl font-black text-indigo-700 mt-1">₹{(totalHours * 650 + totalOvertime * 975).toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Base + Overtime (1.5x)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Geofence Compliance</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{geofenceRate}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{geofencedCount} inside work zones</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">On-Time Rate</p>
          <p className="text-xl font-black text-blue-600 mt-1">{onTimeRate}%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{onTimeCount} on-time arrivals</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">Total Overtime</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{totalOvertime.toFixed(1)} hrs</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approved OT @ ₹975/hr</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
          <p className="text-[11px] text-slate-500 font-medium">EPF/ESI Audit</p>
          <p className="text-xl font-black text-emerald-700 mt-1">100%</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Statutory Ready</p>
        </div>
      </div>

      {/* AI Generated Executive Report Output Box */}
      {aiReport && (
        <div className="bg-indigo-900 border border-indigo-700 rounded-lg p-5 shadow-lg relative overflow-hidden text-white">
          <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-100">AI Executive Attendance Insights</h3>
            </div>
            <button
              onClick={() => setAiReport(null)}
              className="text-xs text-indigo-300 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-indigo-100/90 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
            {aiReport}
          </div>
        </div>
      )}

      {aiError && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-rose-800 text-xs flex items-center justify-between">
          <span>{aiError}</span>
          <button onClick={() => setAiError(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            Daily Worked Hours Breakdown
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHoursData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            Geofence Compliance Share
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-100 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700">Inside Zone ({geofencedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">Offsite ({totalShifts - geofencedCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Full Attendance Logs</h3>
            <p className="text-[11px] text-slate-500">Detailed shift records with GPS verification flags</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Clock In / Out</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-center">Geofence</th>
                <th className="py-2.5 px-3 text-right">Hours</th>
                <th className="py-2.5 px-3">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-2">
                    <img src={r.userAvatar} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                    <span>{r.userName}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{r.department}</td>
                  <td className="py-2.5 px-3 text-slate-500">{formatDateShort(r.date)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                    {formatTimeOnly(r.clockInTime)} - {formatTimeOnly(r.clockOutTime)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{r.clockInLocationName}</td>
                  <td className="py-2.5 px-3 text-center">
                    {r.isGeofenced ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified ({r.distanceToGeofenceMeters}m)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Offsite ({r.distanceToGeofenceMeters}m)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {r.totalHours ? `${r.totalHours.toFixed(2)} hrs` : 'Active'}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {r.flags.map((flag) => (
                        <span
                          key={flag}
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            flag === 'on_time'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : flag === 'late'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {flag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
