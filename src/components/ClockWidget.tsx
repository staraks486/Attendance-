import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Coffee,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { User, WorkLocation, Coordinates, AttendanceRecord, AttendanceStatus } from '../types';
import { checkGeofence, formatDuration, reverseGeocode } from '../utils/geo';

interface ClockWidgetProps {
  currentUser: User;
  workLocations: WorkLocation[];
  userCoords: Coordinates | null;
  gpsError: string | null;
  onRequestGps: () => void;
  activeRecord: AttendanceRecord | null;
  onClockIn: (location: WorkLocation, notes: string, coords: Coordinates, address: string) => void;
  onClockOut: (notes: string, coords: Coordinates, address: string) => void;
  onToggleBreak: () => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  currentUser,
  workLocations,
  userCoords,
  gpsError,
  onRequestGps,
  activeRecord,
  onClockIn,
  onClockOut,
  onToggleBreak,
}) => {
  // Selected target office
  const defaultLocation =
    workLocations.find((loc) => loc.id === currentUser.assignedWorkLocationId) ||
    workLocations[0];
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation>(defaultLocation);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check geofence status
  const geofenceResult = userCoords ? checkGeofence(userCoords, selectedLocation) : null;
  const isGeofenced = geofenceResult?.isInside ?? false;
  const distanceMeters = geofenceResult?.distanceMeters ?? 0;

  // Shift Timer hook
  useEffect(() => {
    if (!activeRecord || activeRecord.status === 'clocked_out') {
      setElapsedSeconds(0);
      return;
    }

    const clockInTimestamp = new Date(activeRecord.clockInTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diffSecs = Math.max(0, Math.floor((now - clockInTimestamp) / 1000));
      setElapsedSeconds(diffSecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  const handleClockInAction = async () => {
    if (!userCoords) {
      onRequestGps();
      return;
    }

    setIsSubmitting(true);
    try {
      const address = await reverseGeocode(userCoords.lat, userCoords.lng);
      onClockIn(selectedLocation, notes, userCoords, address);
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOutAction = async () => {
    if (!userCoords) {
      onRequestGps();
      return;
    }

    setIsSubmitting(true);
    try {
      const address = await reverseGeocode(userCoords.lat, userCoords.lng);
      onClockOut(notes, userCoords, address);
      setNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const status: AttendanceStatus = activeRecord ? activeRecord.status : 'clocked_out';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl text-slate-100 flex flex-col justify-between space-y-6">
      {/* Widget Header & User Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
          />
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{currentUser.name}</h2>
            <p className="text-xs text-slate-400">{currentUser.jobTitle}</p>
          </div>
        </div>

        {/* Current State Tag */}
        <div>
          {status === 'clocked_in' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
              Clocked In
            </span>
          )}
          {status === 'on_break' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Coffee className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              On Break
            </span>
          )}
          {status === 'clocked_out' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Clocked Out
            </span>
          )}
        </div>
      </div>

      {/* Target Work Location Selector */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Assigned Work Location
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Geofence Verified</span>
          </label>
          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const loc = workLocations.find((l) => l.id === e.target.value);
              if (loc) setSelectedLocation(loc);
            }}
            disabled={status !== 'clocked_out'}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 transition-all cursor-pointer"
          >
            {workLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.radiusMeters}m radius)
              </option>
            ))}
          </select>
        </div>

        {/* Indian Work Shift Selector */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500 text-left transition-all"
          >
            <div className="font-bold text-[11px] text-emerald-400">General Shift</div>
            <div className="text-[10px] text-slate-400">09:30 - 18:30 IST</div>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500 text-left transition-all"
          >
            <div className="font-bold text-[11px] text-indigo-400">APAC Shift</div>
            <div className="text-[10px] text-slate-400">06:00 - 15:00 IST</div>
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500 text-left transition-all"
          >
            <div className="font-bold text-[11px] text-amber-400">US Night Shift</div>
            <div className="text-[10px] text-slate-400">18:30 - 03:30 IST</div>
          </button>
        </div>
      </div>

      {/* Geofence Verification Status Card */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          !userCoords
            ? 'bg-slate-800/60 border-slate-700 text-slate-300'
            : isGeofenced
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            {!userCoords ? (
              <Navigation className="w-5 h-5 text-slate-400 shrink-0 animate-bounce" />
            ) : isGeofenced ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">
                {!userCoords
                  ? 'Awaiting Geolocation'
                  : isGeofenced
                  ? 'Inside Verified Work Zone'
                  : 'Outside Designated Geofence'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {!userCoords
                  ? gpsError || 'Please allow location permissions to compute distance.'
                  : isGeofenced
                  ? `You are ${distanceMeters}m from ${selectedLocation.name} (within ${selectedLocation.radiusMeters}m limit).`
                  : `You are ${distanceMeters}m away from ${selectedLocation.name}. Mandatory remote note required.`}
              </p>
            </div>
          </div>
          <button
            onClick={onRequestGps}
            className="text-[11px] font-semibold underline text-slate-400 hover:text-white shrink-0 ml-2"
          >
            Re-check GPS
          </button>
        </div>
      </div>

      {/* Timer Display (when clocked in) */}
      {status !== 'clocked_out' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Current Shift Duration
          </p>
          <div className="text-3xl font-mono font-extrabold text-emerald-400 tracking-wider">
            {formatDuration(elapsedSeconds)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clocked in at {new Date(activeRecord?.clockInTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Shift Note / Memo Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Shift Memo / Work Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            status === 'clocked_out'
              ? 'e.g. Starting sprint tasks or onsite client meeting...'
              : 'e.g. Shift tasks completed, heading out...'
          }
          className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
      </div>

      {/* Clock Action Buttons */}
      <div className="space-y-3 pt-2">
        {status === 'clocked_out' ? (
          <button
            onClick={handleClockInAction}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isSubmitting ? 'Verifying GPS...' : 'CLOCK IN NOW'}</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onToggleBreak}
              className={`font-bold text-sm py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                status === 'on_break'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>{status === 'on_break' ? 'End Break' : 'Take Break'}</span>
            </button>

            <button
              onClick={handleClockOutAction}
              disabled={isSubmitting}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>{isSubmitting ? 'Saving...' : 'CLOCK OUT'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
