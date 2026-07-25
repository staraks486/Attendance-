import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Radio,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { AttendanceRecord, User, WorkLocation } from '../types';
import { formatTimeOnly } from '../utils/geo';

interface ActivityFeedProps {
  records: AttendanceRecord[];
  allUsers: User[];
  workLocations: WorkLocation[];
  onForceClockOut?: (recordId: string) => void;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  jobTitle: string;
  action: 'CLOCK_IN' | 'CLOCK_OUT' | 'ON_BREAK' | 'LATE_IN';
  timestamp: Date;
  locationName: string;
  isGeofenced: boolean;
  distanceMeters: number;
  accuracyText: string;
  isNew?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  allUsers,
  workLocations,
  onForceClockOut,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  // Generate initial feed events from existing records
  const [feedEvents, setFeedEvents] = useState<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = [];
    records.forEach((r) => {
      // Create Clock In event
      const clockInDate = new Date();
      if (r.clockInTime) {
        if (r.clockInTime.includes('T')) {
          const d = new Date(r.clockInTime);
          if (!isNaN(d.getTime())) clockInDate.setTime(d.getTime());
        }
      }

      const isLate = r.flags.includes('late');
      events.push({
        id: `evt-in-${r.id}`,
        userId: r.userId,
        userName: r.userName,
        userAvatar: r.userAvatar,
        department: r.department,
        jobTitle: r.jobTitle,
        action: isLate ? 'LATE_IN' : 'CLOCK_IN',
        timestamp: clockInDate,
        locationName: r.clockInLocationName || 'Office HQ',
        isGeofenced: r.isGeofenced,
        distanceMeters: r.distanceToGeofenceMeters || 12,
        accuracyText: r.isGeofenced ? '±4m GPS' : '±18m Wi-Fi',
      });

      // If clock out exists
      if (r.clockOutTime) {
        const clockOutDate = new Date();
        if (r.clockOutTime.includes('T')) {
          const d = new Date(r.clockOutTime);
          if (!isNaN(d.getTime())) clockOutDate.setTime(d.getTime());
        }
        events.push({
          id: `evt-out-${r.id}`,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          department: r.department,
          jobTitle: r.jobTitle,
          action: 'CLOCK_OUT',
          timestamp: clockOutDate,
          locationName: r.clockOutLocationName || r.clockInLocationName || 'Office HQ',
          isGeofenced: r.isGeofenced,
          distanceMeters: r.distanceToGeofenceMeters || 10,
          accuracyText: '±6m GPS',
        });
      }

      // If on break
      if (r.status === 'on_break') {
        events.push({
          id: `evt-break-${r.id}`,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          department: r.department,
          jobTitle: r.jobTitle,
          action: 'ON_BREAK',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          locationName: r.clockInLocationName || 'Office Breakroom',
          isGeofenced: true,
          distanceMeters: 5,
          accuracyText: '±3m Beacon',
        });
      }
    });

    // Sort newest first
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

  // Keep second-by-second ticker for relative time displays ("3s ago")
  useEffect(() => {
    const ticker = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  // Auto-refresh simulation loop every 6 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefreshed(new Date());

      // 40% chance to generate a live simulated event from random user
      if (Math.random() < 0.45 && allUsers.length > 0) {
        const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
        const randomLoc = workLocations[Math.floor(Math.random() * workLocations.length)] || {
          name: 'North Office Hub',
        };
        const actions: ('CLOCK_IN' | 'CLOCK_OUT' | 'ON_BREAK')[] = ['CLOCK_IN', 'CLOCK_OUT', 'ON_BREAK'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const isGeo = Math.random() > 0.2;

        const newEvt: ActivityEvent = {
          id: `live-evt-${Date.now()}`,
          userId: randomUser.id,
          userName: randomUser.name,
          userAvatar: randomUser.avatar,
          department: randomUser.department,
          jobTitle: randomUser.jobTitle,
          action,
          timestamp: new Date(),
          locationName: isGeo ? randomLoc.name : 'Client Offsite (Remote)',
          isGeofenced: isGeo,
          distanceMeters: isGeo ? Math.floor(Math.random() * 25) + 2 : Math.floor(Math.random() * 150) + 50,
          accuracyText: isGeo ? `±${Math.floor(Math.random() * 5) + 2}m GPS` : `±${Math.floor(Math.random() * 15) + 10}m IP`,
          isNew: true,
        };

        setFeedEvents((prev) => [newEvt, ...prev.slice(0, 49)]); // keep top 50
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, allUsers, workLocations]);

  // Sync with incoming records from props
  useEffect(() => {
    setLastRefreshed(new Date());
  }, [records]);

  const handleManualRefresh = () => {
    setLastRefreshed(new Date());
  };

  const formatRelativeTime = (date: Date) => {
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    return `${diffHrs}h ago`;
  };

  const departmentsList = useMemo(() => {
    const set = new Set(feedEvents.map((e) => e.department));
    return ['ALL', ...Array.from(set)];
  }, [feedEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return feedEvents.filter((e) => {
      const matchesSearch =
        e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === 'ALL' || e.action === actionFilter;
      const matchesDept = departmentFilter === 'ALL' || e.department === departmentFilter;

      return matchesSearch && matchesAction && matchesDept;
    });
  }, [feedEvents, searchQuery, actionFilter, departmentFilter]);

  const handleExportCSV = () => {
    const headers = ['Employee,Action,Timestamp,Location,Geofenced,Accuracy,Department'];
    const rows = filteredEvents.map((e) =>
      `"${e.userName}","${e.action}","${e.timestamp.toISOString()}","${e.locationName}",${e.isGeofenced},"${e.accuracyText}","${e.department}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `realtime_activity_feed_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col">
      {/* Real-time Header Controls */}
      <div className="p-3.5 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${autoRefresh ? 'bg-emerald-400 opacity-75' : 'bg-slate-300'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            </span>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 uppercase">
              Real-Time Activity Feed
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-600" /> Auto-Syncing
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded px-2.5 py-1">
            <span className="text-[11px] font-medium">Auto-Refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoRefresh ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRefresh ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
            title="Force refresh feed"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline text-[11px]">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto bg-white border border-slate-200 rounded px-2.5 py-1">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter employee, location, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full md:w-56 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-slate-500">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="CLOCK_IN">Clock In</option>
              <option value="CLOCK_OUT">Clock Out</option>
              <option value="ON_BREAK">On Break</option>
              <option value="LATE_IN">Late Arrival</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-slate-500">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Depts' : d}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] text-slate-400 font-mono ml-auto">
            Updated {formatTimeOnly(lastRefreshed.toISOString())}
          </span>
        </div>
      </div>

      {/* Activity Table Feed */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Location & Zone</th>
              <th className="py-2.5 px-3">GPS Accuracy</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 italic font-medium">
                  No activity events match your current filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => (
                <tr
                  key={evt.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    evt.isNew ? 'bg-indigo-50/40 animate-pulse' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={evt.userAvatar}
                        alt={evt.userName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{evt.userName}</div>
                        <div className="text-[10px] text-slate-500">{evt.jobTitle} • {evt.department}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    {evt.action === 'CLOCK_IN' && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span> CLOCK IN
                      </span>
                    )}
                    {evt.action === 'CLOCK_OUT' && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> CLOCK OUT
                      </span>
                    )}
                    {evt.action === 'ON_BREAK' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span> ON BREAK
                      </span>
                    )}
                    {evt.action === 'LATE_IN' && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 rounded text-[10px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span> LATE IN
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-mono">
                    <div className="font-bold text-slate-800 text-xs">
                      {formatTimeOnly(evt.timestamp.toISOString())}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold">
                      {formatRelativeTime(evt.timestamp)}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 max-w-[180px] truncate">
                    <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.locationName}</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                      {evt.accuracyText}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {evt.isGeofenced ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Zone
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Offsite Remote
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            GPS Engine Online
          </span>
          <span>Showing {filteredEvents.length} events</span>
        </div>
        <div className="font-semibold text-slate-600">
          Sync Status: Healthy • Real-Time Stream Active
        </div>
      </div>
    </div>
  );
};
