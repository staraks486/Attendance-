import React, { useState } from 'react';
import { Clock, Calendar, User as UserIcon, MapPin, X } from 'lucide-react';
import { User, WorkLocation, AttendanceRecord } from '../types';

interface AddShiftModalProps {
  allUsers: User[];
  workLocations: WorkLocation[];
  onClose: () => void;
  onSubmit: (shift: Omit<AttendanceRecord, 'id'>) => void;
}

export const AddShiftModal: React.FC<AddShiftModalProps> = ({
  allUsers,
  workLocations,
  onClose,
  onSubmit,
}) => {
  const [userId, setUserId] = useState(allUsers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clockInTime, setClockInTime] = useState('09:00');
  const [clockOutTime, setClockOutTime] = useState('17:00');
  const [locationId, setLocationId] = useState(workLocations[0]?.id || '');
  const [notes, setNotes] = useState('Manager override manual shift log');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = allUsers.find((u) => u.id === userId) || allUsers[0];
    const selectedLoc = workLocations.find((l) => l.id === locationId) || workLocations[0];

    const inDateStr = `${date}T${clockInTime}:00`;
    const outDateStr = `${date}T${clockOutTime}:00`;

    const inTimeMs = new Date(inDateStr).getTime();
    const outTimeMs = new Date(outDateStr).getTime();
    const durationHours = Math.max(0, (outTimeMs - inTimeMs) / (1000 * 60 * 60));

    onSubmit({
      userId: selectedUser.id,
      userName: selectedUser.name,
      userAvatar: selectedUser.avatar,
      department: selectedUser.department,
      jobTitle: selectedUser.jobTitle,
      date,
      clockInTime: new Date(inDateStr).toISOString(),
      clockOutTime: new Date(outDateStr).toISOString(),
      clockInCoords: { lat: selectedLoc.lat, lng: selectedLoc.lng, accuracy: 5 },
      clockOutCoords: { lat: selectedLoc.lat, lng: selectedLoc.lng, accuracy: 5 },
      clockInLocationName: selectedLoc.name,
      clockOutLocationName: selectedLoc.name,
      isGeofenced: true,
      distanceToGeofenceMeters: 0,
      status: 'clocked_out',
      totalHours: durationHours,
      breakMinutes: 30,
      notes,
      flags: ['on_time'],
      verifiedLocationAddress: selectedLoc.address,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Log Manual Shift Entry
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Select Employee</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department} - {u.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Shift Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Clock In Time</label>
              <input
                type="time"
                required
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Clock Out Time</label>
              <input
                type="time"
                required
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Work Location Zone</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {workLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Manager Override Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              Add Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
