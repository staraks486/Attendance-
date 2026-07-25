import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_USERS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_LATE_NOTICES,
  INITIAL_SALARY_SLIPS,
  INITIAL_SALES,
  INITIAL_PURCHASES,
} from './data/mockData';
import {
  User,
  UserRole,
  WorkLocation,
  Coordinates,
  AttendanceRecord,
  AttendanceStatus,
  AnomalyFlag,
  LeaveRequest,
  LateNotice,
  SalarySlip,
  StoreSale,
  StorePurchase,
  AppSettings,
  DEFAULT_APP_SETTINGS,
} from './types';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportsView } from './components/ReportsView';
import { AddShiftModal } from './components/AddShiftModal';
import { LoginModal } from './components/LoginModal';
import { StaffDirectoryModal } from './components/StaffDirectoryModal';
import { LeaveModal } from './components/LeaveModal';
import { LateNoticeModal } from './components/LateNoticeModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { checkGeofence } from './utils/geo';
import { LayoutDashboard, FileText, Printer, Building2, X } from 'lucide-react';

export default function App() {
  // Staff Directory state
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('geoclock_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(allUsers[0]);
  const [activeRole, setActiveRole] = useState<UserRole>('employee');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');
  const [mobileActiveTab, setMobileActiveTab] = useState<string>('clock');

  const [workLocations, setWorkLocations] = useState<WorkLocation[]>(() => {
    const saved = localStorage.getItem('geoclock_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('geoclock_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Leave & Late notice state
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('geoclock_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [allLateNotices, setAllLateNotices] = useState<LateNotice[]>(() => {
    const saved = localStorage.getItem('geoclock_late_notices');
    return saved ? JSON.parse(saved) : INITIAL_LATE_NOTICES;
  });

  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(() => {
    const saved = localStorage.getItem('geoclock_salary_slips');
    return saved ? JSON.parse(saved) : INITIAL_SALARY_SLIPS;
  });

  // Sales & Purchases state
  const [storeSales, setStoreSales] = useState<StoreSale[]>(() => {
    const saved = localStorage.getItem('geoclock_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [storePurchases, setStorePurchases] = useState<StorePurchase[]>(() => {
    const saved = localStorage.getItem('geoclock_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  // App Control Settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('geoclock_settings');
    return saved ? JSON.parse(saved) : DEFAULT_APP_SETTINGS;
  });

  // GPS Geolocation state
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Modal Visibility states
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showStaffDirectoryModal, setShowStaffDirectoryModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLateNoticeModal, setShowLateNoticeModal] = useState(false);
  const [viewingStaffPayslip, setViewingStaffPayslip] = useState<SalarySlip | null>(null);

  // Live Time clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('geoclock_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('geoclock_locations', JSON.stringify(workLocations));
  }, [workLocations]);

  useEffect(() => {
    localStorage.setItem('geoclock_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('geoclock_leaves', JSON.stringify(allLeaves));
  }, [allLeaves]);

  useEffect(() => {
    localStorage.setItem('geoclock_late_notices', JSON.stringify(allLateNotices));
  }, [allLateNotices]);

  useEffect(() => {
    localStorage.setItem('geoclock_salary_slips', JSON.stringify(salarySlips));
  }, [salarySlips]);

  useEffect(() => {
    localStorage.setItem('geoclock_sales', JSON.stringify(storeSales));
  }, [storeSales]);

  useEffect(() => {
    localStorage.setItem('geoclock_purchases', JSON.stringify(storePurchases));
  }, [storePurchases]);

  useEffect(() => {
    localStorage.setItem('geoclock_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
  };

  const handleResetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Request HTML5 Geolocation with fallback
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation API is not supported by your browser.');
      setUserCoords({ lat: 13.0458, lng: 77.6200, accuracy: 15 });
      return;
    }

    setGpsError(null);
    setIsGpsActive(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 10,
        });
        setGpsError(null);
      },
      (error) => {
        console.warn('GPS position error:', error);
        setGpsError('Unable to lock current GPS. Using default Bengaluru HQ coordinates.');
        setUserCoords({ lat: 13.0458, lng: 77.6200, accuracy: 20 });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Active clock record for current user
  const activeRecord =
    attendanceRecords.find(
      (r) => r.userId === currentUser.id && r.status !== 'clocked_out'
    ) || null;

  const currentUserRecords = attendanceRecords.filter((r) => r.userId === currentUser.id);

  // Clock In Action
  const handleClockIn = (
    location: WorkLocation,
    notes: string,
    coords: Coordinates,
    address: string
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const { isInside, distanceMeters } = checkGeofence(coords, location);

    const flags: AnomalyFlag[] = [];
    if (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) {
      flags.push('late');
    } else {
      flags.push('on_time');
    }

    if (!isInside) {
      flags.push('outside_geofence');
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      department: currentUser.department,
      jobTitle: currentUser.jobTitle,
      date: dateStr,
      clockInTime: now.toISOString(),
      clockOutTime: null,
      clockInCoords: coords,
      clockInLocationName: location.name,
      isGeofenced: isInside,
      distanceToGeofenceMeters: distanceMeters,
      status: 'clocked_in',
      totalHours: 0,
      breakMinutes: 0,
      notes: notes || (isInside ? 'Onsite shift started' : 'Remote / Field clock in'),
      flags,
      verifiedLocationAddress: address,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  // Clock Out Action
  const handleClockOut = (notes: string, coords: Coordinates, address: string) => {
    if (!activeRecord) return;

    const now = new Date();
    const clockInMs = new Date(activeRecord.clockInTime).getTime();
    const clockOutMs = now.getTime();
    const totalHours = Math.max(0.1, parseFloat(((clockOutMs - clockInMs) / (1000 * 60 * 60)).toFixed(2)));

    const flags = [...activeRecord.flags];
    if (totalHours > 8) {
      flags.push('overtime');
    }

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.id === activeRecord.id
          ? {
              ...r,
              clockOutTime: now.toISOString(),
              clockOutCoords: coords,
              clockOutLocationName: activeRecord.clockInLocationName,
              status: 'clocked_out',
              totalHours,
              notes: notes ? `${r.notes ? r.notes + ' | ' : ''}${notes}` : r.notes,
              flags,
            }
          : r
      )
    );
  };

  // Take or End Break Action
  const handleToggleBreak = () => {
    if (!activeRecord) return;

    const newStatus: AttendanceStatus =
      activeRecord.status === 'on_break' ? 'clocked_in' : 'on_break';

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === activeRecord.id ? { ...r, status: newStatus } : r))
    );
  };

  // Manager force clock out
  const handleForceClockOut = (recordId: string) => {
    const now = new Date();
    setAttendanceRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const clockInMs = new Date(r.clockInTime).getTime();
          const totalHours = Math.max(0.1, parseFloat(((now.getTime() - clockInMs) / (1000 * 60 * 60)).toFixed(2)));
          return {
            ...r,
            clockOutTime: now.toISOString(),
            status: 'clocked_out',
            totalHours,
            notes: `${r.notes ? r.notes + ' | ' : ''}Force clocked out by manager`,
          };
        }
        return r;
      })
    );
  };

  // Manager/Admin add location
  const handleAddLocation = (newLoc: Omit<WorkLocation, 'id'>) => {
    const created: WorkLocation = {
      ...newLoc,
      id: `loc-${Date.now()}`,
    };
    setWorkLocations((prev) => [...prev, created]);
  };

  const handleUpdateLocation = (updatedLoc: WorkLocation) => {
    setWorkLocations((prev) => prev.map((l) => (l.id === updatedLoc.id ? updatedLoc : l)));
  };

  const handleDeleteLocation = (locId: string) => {
    setWorkLocations((prev) => prev.filter((l) => l.id !== locId));
  };

  // Sales and Purchases handlers
  const handleAddSale = (saleData: Omit<StoreSale, 'id' | 'timestamp'>) => {
    const newSale: StoreSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setStoreSales((prev) => [newSale, ...prev]);
  };

  const handleAddPurchase = (purchaseData: Omit<StorePurchase, 'id' | 'timestamp'>) => {
    const newPurchase: StorePurchase = {
      ...purchaseData,
      id: `pur-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setStorePurchases((prev) => [newPurchase, ...prev]);
  };

  const handleTogglePurchaseStatus = (purchaseId: string) => {
    setStorePurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? { ...p, paymentStatus: p.paymentStatus === 'Paid' ? 'Pending' : 'Paid' }
          : p
      )
    );
  };

  // Manager add manual shift
  const handleAddManualShift = (newShift: Omit<AttendanceRecord, 'id'>) => {
    const created: AttendanceRecord = {
      ...newShift,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords((prev) => [created, ...prev]);
  };

  // Manager Update Staff Details
  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // Manager Clock In Staff Directly
  const handleClockInStaff = (user: User, location: WorkLocation, notes: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const coords: Coordinates = { lat: location.lat, lng: location.lng, accuracy: 5 };

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      department: user.department,
      jobTitle: user.jobTitle,
      date: dateStr,
      clockInTime: now.toISOString(),
      clockOutTime: null,
      clockInCoords: coords,
      clockInLocationName: location.name,
      isGeofenced: true,
      distanceToGeofenceMeters: 0,
      status: 'clocked_in',
      totalHours: 0,
      breakMinutes: 0,
      notes: notes || 'Admin manual shift log',
      flags: ['on_time'],
      verifiedLocationAddress: location.address,
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  // Manager Add Staff
  const handleAddUser = (newUser: Omit<User, 'id'>) => {
    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    setAllUsers((prev) => [...prev, created]);
  };

  // Manager Delete Staff
  const handleDeleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser.id === userId) {
      const fallback = allUsers.find((u) => u.id !== userId);
      if (fallback) setCurrentUser(fallback);
    }
  };

  // Leave Actions
  const handleApplyLeave = (newLeave: Omit<LeaveRequest, 'id' | 'appliedOn'>) => {
    const created: LeaveRequest = {
      ...newLeave,
      id: `lv-${Date.now()}`,
      appliedOn: new Date().toISOString(),
    };
    setAllLeaves((prev) => [created, ...prev]);
  };

  const handleUpdateLeaveStatus = (
    leaveId: string,
    status: 'approved' | 'rejected',
    comment?: string
  ) => {
    setAllLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              managerComment: comment || l.managerComment,
            }
          : l
      )
    );
  };

  // Late Notice Actions
  const handleSubmitLateNotice = (newNotice: Omit<LateNotice, 'id' | 'submittedAt'>) => {
    const created: LateNotice = {
      ...newNotice,
      id: `ln-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setAllLateNotices((prev) => [created, ...prev]);
  };

  const handleAcknowledgeLateNotice = (noticeId: string) => {
    setAllLateNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'acknowledged' } : n))
    );
  };

  // Salary Slip Actions
  const handleSaveSalarySlip = (slip: SalarySlip) => {
    setSalarySlips((prev) => {
      const idx = prev.findIndex((s) => s.id === slip.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = slip;
        return updated;
      }
      return [slip, ...prev];
    });
  };

  // Handle staff payslip view
  const handleOpenStaffPayslip = () => {
    const slip = salarySlips.find((s) => s.userId === currentUser.id) || {
      id: `sal-${currentUser.id}-2026-07`,
      userId: currentUser.id,
      userName: currentUser.name,
      department: currentUser.department,
      jobTitle: currentUser.jobTitle,
      monthYear: '2026-07',
      monthName: 'July 2026',
      workingDaysInMonth: 26,
      daysPresent: 22,
      daysPaidLeave: 2,
      absentDays: 2,
      baseMonthlySalary: currentUser.monthlySalary || 50000,
      earnedBaseSalary: Math.round(((currentUser.monthlySalary || 50000) / 26) * 24),
      overtimeHours: 8,
      overtimePay: 3000,
      lateDeductions: 250,
      epfDeduction: 1800,
      esiDeduction: 350,
      netSalary: Math.round(((currentUser.monthlySalary || 50000) / 26) * 24) + 3000 - 250 - 1800 - 350,
      status: 'paid',
      generatedAt: new Date().toISOString(),
      bankAccountNo: currentUser.bankAccountNo || '918230048123',
      ifscCode: currentUser.ifscCode || 'HDFC0001234',
      panNo: currentUser.panNo || 'ABCDE1234F',
    };
    setViewingStaffPayslip(slip as SalarySlip);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
        }}
        activeRole={activeRole}
        onChangeRole={setActiveRole}
        isGpsActive={isGpsActive}
        gpsError={gpsError}
        onRefreshGps={requestLocation}
        currentTime={currentTime}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenStaffDirectory={() => setShowStaffDirectoryModal(true)}
        onOpenSettings={() => {
          setMobileActiveTab('settings');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        companyName={appSettings.companyName}
      />

      {/* Role Navigation Header (For Manager View) */}
      {activeRole === 'manager' && (
        <div className="bg-slate-900/60 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 text-xs font-bold py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Centralized Manager Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-2 text-xs font-bold py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'reports'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Weekly Reports & Analytics</span>
              </button>
            </div>

            <span className="text-xs text-emerald-400/90 font-medium hidden sm:inline-block">
              Manager Control Center
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        {activeRole === 'admin' ? (
          <AdminDashboard
            adminUser={currentUser}
            allUsers={allUsers}
            workLocations={workLocations}
            attendanceRecords={attendanceRecords}
            storeSales={storeSales}
            storePurchases={storePurchases}
            appSettings={appSettings}
            onSaveSettings={handleSaveSettings}
            onResetData={handleResetAllData}
            externalTab={mobileActiveTab}
            onTabChange={(tab) => setMobileActiveTab(tab)}
            onAddStore={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteStore={handleDeleteLocation}
            onAddLocation={handleAddLocation}
            onDeleteLocation={handleDeleteLocation}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onSelectUserToLogin={(user) => {
              setCurrentUser(user);
              setActiveRole(user.role);
              if (user.role === 'admin') setMobileActiveTab('overview');
              else if (user.role === 'manager') setMobileActiveTab('live');
              else setMobileActiveTab('clock');
            }}
          />
        ) : activeRole === 'manager' ? (
          activeTab === 'dashboard' ? (
            <ManagerDashboard
              currentUser={currentUser}
              allRecords={attendanceRecords}
              allUsers={allUsers}
              workLocations={workLocations}
              allLeaves={allLeaves}
              allLateNotices={allLateNotices}
              salarySlips={salarySlips}
              storeSales={storeSales}
              storePurchases={storePurchases}
              appSettings={appSettings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetAllData}
              externalTab={mobileActiveTab}
              onTabChange={(tab) => setMobileActiveTab(tab)}
              onAddLocation={handleAddLocation}
              onForceClockOut={handleForceClockOut}
              onAddManualShift={() => setShowShiftModal(true)}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
              onApplyLeaveForStaff={handleApplyLeave}
              onClockInStaff={handleClockInStaff}
              onAcknowledgeLateNotice={handleAcknowledgeLateNotice}
              onSaveSalarySlip={handleSaveSalarySlip}
              onAddSale={handleAddSale}
              onAddPurchase={handleAddPurchase}
              onTogglePurchaseStatus={handleTogglePurchaseStatus}
            />
          ) : (
            <ReportsView allRecords={attendanceRecords} />
          )
        ) : (
          <EmployeeDashboard
            currentUser={currentUser}
            workLocations={workLocations}
            userCoords={userCoords}
            gpsError={gpsError}
            onRequestGps={requestLocation}
            activeRecord={activeRecord}
            userRecords={currentUserRecords}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onToggleBreak={handleToggleBreak}
            onOpenLeaveModal={() => setShowLeaveModal(true)}
            onOpenLateNoticeModal={() => setShowLateNoticeModal(true)}
            onOpenPayslipModal={handleOpenStaffPayslip}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentUser={currentUser}
        activeRole={activeRole}
        onChangeRole={(role) => {
          setActiveRole(role);
          if (role === 'admin') setMobileActiveTab('overview');
          else if (role === 'manager') setMobileActiveTab('live');
          else setMobileActiveTab('clock');
        }}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenLeaveModal={() => setShowLeaveModal(true)}
        onOpenPayslipModal={handleOpenStaffPayslip}
        onOpenLateModal={() => setShowLateNoticeModal(true)}
        activeTab={mobileActiveTab}
        onSelectTab={(tab) => {
          setMobileActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        clockedIn={!!activeRecord}
      />

      {/* Login Portal Modal */}
      <LoginModal
        isOpen={showLoginModal}
        allUsers={allUsers}
        onLogin={(user) => {
          setCurrentUser(user);
          setActiveRole(user.role);
          setShowLoginModal(false);
        }}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Staff Management Directory Modal */}
      {showStaffDirectoryModal && (
        <StaffDirectoryModal
          allUsers={allUsers}
          workLocations={workLocations}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onClose={() => setShowStaffDirectoryModal(false)}
        />
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <LeaveModal
          currentUser={currentUser}
          allLeaves={allLeaves}
          onApplyLeave={handleApplyLeave}
          onUpdateLeaveStatus={handleUpdateLeaveStatus}
          onClose={() => setShowLeaveModal(false)}
          isManagerView={activeRole === 'manager'}
        />
      )}

      {/* Late Arrival Notice Modal */}
      {showLateNoticeModal && (
        <LateNoticeModal
          currentUser={currentUser}
          allLateNotices={allLateNotices}
          onSubmitNotice={handleSubmitLateNotice}
          onAcknowledgeNotice={handleAcknowledgeLateNotice}
          onClose={() => setShowLateNoticeModal(false)}
          isManagerView={activeRole === 'manager'}
        />
      )}

      {/* Manual Shift Modal */}
      {showShiftModal && (
        <AddShiftModal
          allUsers={allUsers}
          workLocations={workLocations}
          onClose={() => setShowShiftModal(false)}
          onSubmit={handleAddManualShift}
        />
      )}

      {/* Staff Payslip Preview Modal */}
      {viewingStaffPayslip && (
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
                  onClick={() => setViewingStaffPayslip(null)}
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
                    PAYSLIP: {viewingStaffPayslip.monthName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Employee Name:</span> {viewingStaffPayslip.userName}</p>
                  <p><span className="font-bold text-slate-700">Designation:</span> {viewingStaffPayslip.jobTitle}</p>
                  <p><span className="font-bold text-slate-700">Department:</span> {viewingStaffPayslip.department}</p>
                </div>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Working Days:</span> {viewingStaffPayslip.workingDaysInMonth} days</p>
                  <p><span className="font-bold text-slate-700">Days Attended:</span> {viewingStaffPayslip.daysPresent} days</p>
                  <p><span className="font-bold text-slate-700">Paid Leave:</span> {viewingStaffPayslip.daysPaidLeave} days</p>
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
                      <span className="font-mono font-bold">₹{viewingStaffPayslip.earnedBaseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overtime Pay</span>
                      <span className="font-mono font-bold text-emerald-700">+₹{viewingStaffPayslip.overtimePay.toLocaleString('en-IN')}</span>
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
                      <span className="font-mono text-rose-700">-₹{(viewingStaffPayslip.epfDeduction + viewingStaffPayslip.esiDeduction).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Late Penalty</span>
                      <span className="font-mono text-rose-700">-₹{viewingStaffPayslip.lateDeductions.toLocaleString('en-IN')}</span>
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
                  ₹{viewingStaffPayslip.netSalary.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
