export type UserRole = 'admin' | 'manager' | 'employee';

export type AttendanceStatus = 'clocked_in' | 'clocked_out' | 'on_break';

export type AnomalyFlag = 'on_time' | 'late' | 'early_departure' | 'outside_geofence' | 'overtime' | 'missing_clockout';

export interface User {
  id: string;
  employeeCode?: string; // e.g. "EMP-1001"
  username?: string; // login username e.g. "aarav.admin"
  password?: string; // login password e.g. "pass123"
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  assignedWorkLocationId: string; // Store / Location ID
  monthlySalary?: number; // e.g. 65000 INR
  dailyRate?: number; // e.g. 2500 INR
  weeklyOffDays?: string[]; // e.g. ['Sunday', 'Saturday']
  shiftTiming?: string; // e.g. "09:00 AM - 06:00 PM IST"
  casualLeaveQuota?: number; // default e.g. 12
  sickLeaveQuota?: number; // default e.g. 10
  earnedLeaveQuota?: number; // default e.g. 15
  bankAccountNo?: string;
  ifscCode?: string;
  panNo?: string;
}

export interface StoreSale {
  id: string;
  storeId: string;
  storeName: string;
  date: string; // YYYY-MM-DD
  invoiceNo: string; // e.g. "INV-8091"
  customerName: string;
  amount: number;
  paymentMethod: 'UPI' | 'Cash' | 'Card';
  itemsCount: number;
  notes?: string;
  createdBy: string; // User Name
  timestamp: string; // ISO string
}

export interface StorePurchase {
  id: string;
  storeId: string;
  storeName: string;
  date: string; // YYYY-MM-DD
  purchaseNo: string; // e.g. "PO-5011"
  supplierName: string;
  itemCategory: string; // e.g. "Inventory Raw Materials", "Store Utilities", "Equipment"
  amount: number;
  paymentStatus: 'Paid' | 'Pending';
  invoiceCopy?: string;
  notes?: string;
  createdBy: string;
  timestamp: string; // ISO string
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number; // e.g. 200m
  isDefault?: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy: number; // accuracy in meters
}

export interface BreakRecord {
  id: string;
  attendanceId: string;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  durationMinutes: number;
  type: 'lunch' | 'short' | 'personal';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  jobTitle: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO string or HH:mm:ss
  clockOutTime?: string | null; // ISO string or HH:mm:ss
  clockInCoords: Coordinates;
  clockOutCoords?: Coordinates | null;
  clockInLocationName: string;
  clockOutLocationName?: string | null;
  isGeofenced: boolean; // whether clock in was within target geofence
  distanceToGeofenceMeters: number; // distance to target office center
  status: AttendanceStatus;
  totalHours: number; // calculated hours
  breakMinutes: number;
  notes?: string;
  flags: AnomalyFlag[];
  verifiedLocationAddress?: string;
}

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  jobTitle: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string; // ISO String
  managerComment?: string;
}

export interface LateNotice {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  date: string; // YYYY-MM-DD
  expectedTime: string; // e.g. "10:30 AM"
  reason: string;
  status: 'pending' | 'acknowledged';
  submittedAt: string; // ISO String
}

export interface SalarySlip {
  id: string;
  userId: string;
  userName: string;
  department: string;
  jobTitle: string;
  monthYear: string; // e.g. "2026-07"
  monthName: string; // e.g. "July 2026"
  workingDaysInMonth: number;
  daysPresent: number;
  daysPaidLeave: number;
  absentDays: number;
  baseMonthlySalary: number;
  earnedBaseSalary: number;
  overtimeHours: number;
  overtimePay: number;
  lateDeductions: number;
  epfDeduction: number;
  esiDeduction: number;
  netSalary: number;
  status: 'draft' | 'generated' | 'paid';
  generatedAt: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panNo?: string;
}

export interface AppSettings {
  // Company Info
  companyName: string;
  companyAddress: string;
  companyGstin: string;
  companyEmail: string;
  companyPhone: string;
  currencySymbol: string;
  currencyCode: string;

  // Geofence & Shift Policy
  defaultGeofenceRadius: number; // meters
  strictGeofencing: boolean; // block clock-in if outside geofence vs flag it
  lateGracePeriodMins: number; // e.g. 15 mins
  shiftStartDefault: string; // e.g. "09:30"
  shiftEndDefault: string; // e.g. "18:30"
  halfDayThresholdHours: number; // e.g. 4
  allowSelfClockIn: boolean; // allow staff self clock-in
  requireSelfieVerification: boolean;

  // Payroll & Taxes
  paydayOfMonth: number; // e.g. 1 or 30 or 7
  pfRatePercent: number; // e.g. 12%
  esiRatePercent: number; // e.g. 0.75%
  professionalTaxAmount: number; // e.g. 200
  hraPercent: number; // e.g. 40%
  overtimeHourlyRate: number; // e.g. 200

  // Notifications & Alerts
  enableEmailAlerts: boolean;
  enableWhatsappAlerts: boolean;
  notifyOnLateArrival: boolean;
  notifyOnLeaveRequest: boolean;
  notifyOnExpenseSubmission: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  companyName: 'Apex Retail & Logistics India Pvt. Ltd.',
  companyAddress: '102 Indiranagar 100ft Road, Bengaluru, Karnataka - 560038',
  companyGstin: '29AABCA1234F1ZB',
  companyEmail: 'hr@apexretail.in',
  companyPhone: '+91 98765 43210',
  currencySymbol: '₹',
  currencyCode: 'INR',

  defaultGeofenceRadius: 200,
  strictGeofencing: false,
  lateGracePeriodMins: 15,
  shiftStartDefault: '09:30',
  shiftEndDefault: '18:30',
  halfDayThresholdHours: 4,
  allowSelfClockIn: true,
  requireSelfieVerification: false,

  paydayOfMonth: 1,
  pfRatePercent: 12,
  esiRatePercent: 0.75,
  professionalTaxAmount: 200,
  hraPercent: 40,
  overtimeHourlyRate: 200,

  enableEmailAlerts: true,
  enableWhatsappAlerts: true,
  notifyOnLateArrival: true,
  notifyOnLeaveRequest: true,
  notifyOnExpenseSubmission: true,
};

export interface DepartmentSummary {
  department: string;
  employeeCount: number;
  totalHours: number;
  onTimePercentage: number;
  geofenceCompliancePercentage: number;
}

export interface FilterOptions {
  startDate: string;
  endDate: string;
  department: string;
  status: string;
  searchQuery: string;
}
