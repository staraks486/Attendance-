import React, { useState } from 'react';
import { User, LeaveRequest, LeaveType } from '../types';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Send, X, Shield } from 'lucide-react';

interface LeaveModalProps {
  currentUser: User;
  allLeaves: LeaveRequest[];
  onApplyLeave: (newLeave: Omit<LeaveRequest, 'id' | 'appliedOn'>) => void;
  onUpdateLeaveStatus?: (leaveId: string, status: 'approved' | 'rejected', comment?: string) => void;
  onClose: () => void;
  isManagerView?: boolean;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  currentUser,
  allLeaves,
  onApplyLeave,
  onUpdateLeaveStatus,
  onClose,
  isManagerView = false,
}) => {
  const [showApplyForm, setShowApplyForm] = useState(!isManagerView);

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const [managerComment, setManagerComment] = useState('');
  const [commentingLeaveId, setCommentingLeaveId] = useState<string | null>(null);

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onApplyLeave({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      department: currentUser.department,
      jobTitle: currentUser.jobTitle,
      leaveType,
      startDate,
      endDate,
      totalDays: diffDays,
      reason: reason.trim(),
      status: 'pending',
    });

    setReason('');
    setShowApplyForm(false);
  };

  const filteredLeaves = isManagerView
    ? allLeaves
    : allLeaves.filter((l) => l.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isManagerView ? 'Leave Request Approval Portal' : 'Apply & Track Leave Requests'}
              </h2>
              <p className="text-xs text-slate-400">
                {isManagerView
                  ? 'Review, approve, or reject employee leave applications'
                  : 'Submit official leave applications to HR and check status'}
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!isManagerView && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showApplyForm ? 'View My Leaves' : 'New Leave Application'}</span>
              </button>
            </div>
          )}

          {/* Form for Staff */}
          {showApplyForm && !isManagerView && (
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-4">
              <div className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Submit New Leave Application</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Leave Type *</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Casual Leave">Casual Leave (CL)</option>
                    <option value="Sick Leave">Sick Leave (SL)</option>
                    <option value="Earned Leave">Earned / Privilege Leave (EL)</option>
                    <option value="Unpaid Leave">Unpaid Leave (LWP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg">
                <span>Duration Requested:</span>
                <span className="font-bold text-emerald-400">{diffDays} Day(s)</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attending family function / Medical appointment in Bengaluru..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}

          {/* List of Leaves */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isManagerView ? 'All Employee Leave Applications' : 'My Leave Application History'}
            </h3>

            {filteredLeaves.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No leave applications recorded yet.
              </div>
            ) : (
              filteredLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={leave.userAvatar}
                        alt={leave.userName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-white">{leave.userName}</div>
                        <div className="text-[10px] text-slate-400">
                          {leave.jobTitle} • {leave.department}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                        leave.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : leave.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {leave.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {leave.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-400" />}
                      {leave.status === 'pending' && <AlertCircle className="w-3 h-3 text-amber-400" />}
                      <span>{leave.status}</span>
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>
                        <strong className="text-emerald-400">{leave.leaveType}</strong> ({leave.totalDays} day/s)
                      </span>
                      <span className="text-slate-400 font-mono">
                        {leave.startDate} to {leave.endDate}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] italic">"{leave.reason}"</p>
                    {leave.managerComment && (
                      <p className="text-indigo-300 text-[11px] pt-1 border-t border-slate-800">
                        💬 <strong>Manager Note:</strong> {leave.managerComment}
                      </p>
                    )}
                  </div>

                  {/* Manager Approval controls */}
                  {isManagerView && leave.status === 'pending' && onUpdateLeaveStatus && (
                    <div className="pt-2 flex flex-col space-y-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Add manager response comment (optional)..."
                        value={commentingLeaveId === leave.id ? managerComment : ''}
                        onChange={(e) => {
                          setCommentingLeaveId(leave.id);
                          setManagerComment(e.target.value);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onUpdateLeaveStatus(leave.id, 'rejected', managerComment)}
                          className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onUpdateLeaveStatus(leave.id, 'approved', managerComment)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Approve Leave
                        </button>
                      </div>
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
