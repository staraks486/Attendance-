import React, { useState } from 'react';
import { User, WorkLocation } from '../types';
import { Users, UserPlus, Trash2, X, Building2, CreditCard, IndianRupee, ShieldCheck } from 'lucide-react';

interface StaffDirectoryModalProps {
  allUsers: User[];
  workLocations: WorkLocation[];
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
}

export const StaffDirectoryModal: React.FC<StaffDirectoryModalProps> = ({
  allUsers,
  workLocations,
  onAddUser,
  onDeleteUser,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // New staff state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [assignedWorkLocationId, setAssignedWorkLocationId] = useState(workLocations[0]?.id || '');
  const [monthlySalary, setMonthlySalary] = useState('50000');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [panNo, setPanNo] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !jobTitle.trim()) return;

    const salaryNum = parseFloat(monthlySalary) || 50000;
    const dailyRateNum = Math.round(salaryNum / 26);

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      role,
      department,
      jobTitle: jobTitle.trim(),
      assignedWorkLocationId,
      monthlySalary: salaryNum,
      dailyRate: dailyRateNum,
      bankAccountNo: bankAccountNo || '9182' + Math.floor(10000000 + Math.random() * 90000000),
      ifscCode: ifscCode || 'HDFC0001234',
      panNo: panNo || 'ABCDE1234F',
    });

    // Reset form
    setName('');
    setEmail('');
    setJobTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Staff Management Directory</h2>
              <p className="text-xs text-slate-400">Add, remove, and manage employee profiles & salaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300">
              Total Staff Members: <span className="text-emerald-400">{allUsers.length}</span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel Add Staff' : 'Add New Staff Member'}</span>
            </button>
          </div>

          {/* Add Staff Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                <UserPlus className="w-4 h-4" />
                <span>New Staff Onboarding Form</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@geoclock.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'employee' | 'manager')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="employee">Staff / Employee</option>
                    <option value="manager">Manager / Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Finance">Finance</option>
                    <option value="People & Operations">People & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior QA Specialist"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Assigned Office Location *</label>
                  <select
                    value={assignedWorkLocationId}
                    onChange={(e) => setAssignedWorkLocationId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {workLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Monthly Base Salary (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="60000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Bank Account No.</label>
                  <input
                    type="text"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="e.g. 918230048123"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 cursor-pointer"
                >
                  Save & Add Staff Member
                </button>
              </div>
            </form>
          )}

          {/* Staff Roster List */}
          <div className="space-y-3">
            {allUsers.map((user) => {
              const loc = workLocations.find((l) => l.id === user.assignedWorkLocationId);

              return (
                <div
                  key={user.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{user.name}</span>
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
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.jobTitle} • <span className="text-slate-300">{user.department}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>📍 {loc?.name || 'Bengaluru HQ'}</span>
                        <span>✉️ {user.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        ₹{(user.monthlySalary || 50000).toLocaleString('en-IN')} / mo
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Daily Rate: ₹{(user.dailyRate || Math.round((user.monthlySalary || 50000) / 26)).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-400 font-bold">Confirm Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteUser(user.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(user.id)}
                        title="Delete Staff Member"
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
