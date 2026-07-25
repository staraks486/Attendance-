import React from 'react';
import { Clock, CheckCircle2, MapPin, Calendar, AlertTriangle, ShieldCheck, FileText, Send, AlertCircle, IndianRupee } from 'lucide-react';
import { User, WorkLocation, Coordinates, AttendanceRecord } from '../types';
import { ClockWidget } from './ClockWidget';
import { MapView } from './MapView';
import { formatTimeOnly, formatDateShort } from '../utils/geo';

interface EmployeeDashboardProps {
  currentUser: User;
  workLocations: WorkLocation[];
  userCoords: Coordinates | null;
  gpsError: string | null;
  onRequestGps: () => void;
  activeRecord: AttendanceRecord | null;
  userRecords: AttendanceRecord[];
  onClockIn: (location: WorkLocation, notes: string, coords: Coordinates, address: string) => void;
  onClockOut: (notes: string, coords: Coordinates, address: string) => void;
  onToggleBreak: () => void;
  onOpenLeaveModal?: () => void;
  onOpenLateNoticeModal?: () => void;
  onOpenPayslipModal?: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  workLocations,
  userCoords,
  gpsError,
  onRequestGps,
  activeRecord,
  userRecords,
  onClockIn,
  onClockOut,
  onToggleBreak,
  onOpenLeaveModal,
  onOpenLateNoticeModal,
  onOpenPayslipModal,
}) => {
  // Calculate employee summary metrics
  const totalHours = userRecords.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const totalShifts = userRecords.length;
  const geofencedShifts = userRecords.filter((r) => r.isGeofenced).length;
  const geofenceRate = totalShifts > 0 ? Math.round((geofencedShifts / totalShifts) * 100) : 100;
  const onTimeShifts = userRecords.filter((r) => !r.flags.includes('late')).length;
  const onTimeRate = totalShifts > 0 ? Math.round((onTimeShifts / totalShifts) * 100) : 100;

  const targetLocation =
    workLocations.find((l) => l.id === currentUser.assignedWorkLocationId) || workLocations[0];

  return (
    <div className="space-y-6">
      {/* Staff Self-Service Quick Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/40"
          />
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Namaste, {currentUser.name}</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                {currentUser.jobTitle}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{currentUser.department} • Assigned to {targetLocation.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onOpenLeaveModal && (
            <button
              onClick={onOpenLeaveModal}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apply Leave</span>
            </button>
          )}

          {onOpenLateNoticeModal && (
            <button
              onClick={onOpenLateNoticeModal}
              className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Inform Late</span>
            </button>
          )}

          {onOpenPayslipModal && (
            <button
              onClick={onOpenPayslipModal}
              className="flex-1 sm:flex-none bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>My Payslip</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-emerald-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Weekly Hours</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{totalHours.toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-600 shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Monthly Salary</p>
            <p className="text-lg font-bold text-indigo-700 mt-0.5">₹{(currentUser.monthlySalary || 50000).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-teal-50 border border-teal-100 rounded text-teal-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Geofence Compliance</p>
            <p className="text-lg font-bold text-teal-700 mt-0.5">{geofenceRate}%</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded text-blue-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">IST On-Time Rate</p>
            <p className="text-lg font-bold text-blue-700 mt-0.5">{onTimeRate}%</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center space-x-3 shadow-2xs">
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded text-amber-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Next Holiday</p>
            <p className="text-xs font-bold text-amber-800 mt-0.5">Independence Day (Aug 15)</p>
          </div>
        </div>
      </div>

      {/* Clock Widget + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <ClockWidget
            currentUser={currentUser}
            workLocations={workLocations}
            userCoords={userCoords}
            gpsError={gpsError}
            onRequestGps={onRequestGps}
            activeRecord={activeRecord}
            onClockIn={onClockIn}
            onClockOut={onClockOut}
            onToggleBreak={onToggleBreak}
          />
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Live GPS Location Radar</h3>
            </div>
            <span className="text-xs text-slate-400">Target: {targetLocation.name}</span>
          </div>

          <MapView
            userCoords={userCoords}
            selectedLocation={targetLocation}
            allLocations={workLocations}
            height="420px"
          />
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              My Attendance Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Your verified GPS clock-in and clock-out logs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Work Location</th>
                <th className="py-3 px-4 text-center">Geofence</th>
                <th className="py-3 px-4 text-right">Total Hours</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {userRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No attendance records found yet. Use the Clock In widget above to start your shift!
                  </td>
                </tr>
              ) : (
                userRecords.map((record) => (
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
                      {record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : 'In Progress'}
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
    </div>
  );
};
