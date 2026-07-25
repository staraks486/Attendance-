import React, { useState } from 'react';
import { User, LateNotice } from '../types';
import { Clock, AlertTriangle, CheckCircle2, Send, X, ShieldAlert } from 'lucide-react';

interface LateNoticeModalProps {
  currentUser: User;
  allLateNotices: LateNotice[];
  onSubmitNotice: (newNotice: Omit<LateNotice, 'id' | 'submittedAt'>) => void;
  onAcknowledgeNotice?: (noticeId: string) => void;
  onClose: () => void;
  isManagerView?: boolean;
}

export const LateNoticeModal: React.FC<LateNoticeModalProps> = ({
  currentUser,
  allLateNotices,
  onSubmitNotice,
  onAcknowledgeNotice,
  onClose,
  isManagerView = false,
}) => {
  const [showForm, setShowForm] = useState(!isManagerView);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedTime, setExpectedTime] = useState('10:30 AM');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onSubmitNotice({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      department: currentUser.department,
      date,
      expectedTime,
      reason: reason.trim(),
      status: 'pending',
    });

    setReason('');
    setShowForm(false);
  };

  const filteredNotices = isManagerView
    ? allLateNotices
    : allLateNotices.filter((n) => n.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isManagerView ? 'Late Arrival Notifications Feed' : 'Inform Manager of Late Arrival'}
              </h2>
              <p className="text-xs text-slate-400">
                {isManagerView
                  ? 'Real-time delay notices submitted by staff members'
                  : 'Notify HR & manager about unexpected traffic or personal delays'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {!isManagerView && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showForm ? 'View My Notices' : 'Inform Late Arrival'}</span>
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && !isManagerView && (
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-4">
              <div className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Late Arrival Information Notice</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Expected Arrival Time *</label>
                  <input
                    type="text"
                    required
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                    placeholder="e.g. 10:15 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Reason for Delay *</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Waterlogging near Silk Board junction / Train delay / Vehicle breakdown..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 cursor-pointer"
                >
                  Send Notice to Manager
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isManagerView ? 'Submitted Late Notices' : 'My Delay Notices'}
            </h3>

            {filteredNotices.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No late notices reported.
              </div>
            ) : (
              filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={notice.userAvatar}
                        alt={notice.userName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{notice.userName}</div>
                        <div className="text-[10px] text-slate-400">{notice.department}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        notice.status === 'acknowledged'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {notice.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>Date: {notice.date}</span>
                      <span className="text-amber-400">Expected: {notice.expectedTime}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] italic">"{notice.reason}"</p>
                  </div>

                  {isManagerView && notice.status === 'pending' && onAcknowledgeNotice && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onAcknowledgeNotice(notice.id)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge Notice</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
