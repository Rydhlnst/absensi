export type Role = 'super_admin' | 'admin' | 'employee';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'holiday';

export type TaskCategory = 'installation' | 'maintenance' | 'billing' | 'repair' | 'inspection';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type RewardType = 'earned' | 'redeemed' | 'expired' | 'adjusted';

export type NotificationType = 'task' | 'attendance' | 'reward' | 'system' | 'warning';

export type ReportType = 'attendance' | 'task' | 'salary' | 'reward';

export type SalaryStatus = 'pending' | 'paid' | 'processing';

export type EmployeeStatus = 'active' | 'inactive' | 'suspended';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface WorkingHour {
  start: string;
  end: string;
}

export interface RewardSettings {
  installationPoints: number;
  maintenancePoints: number;
  billingPoints: number;
  repairPoints: number;
  inspectionPoints: number;
  monthlyBonus: number;
  attendanceBonus: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar: string | null;
  department: string;
  position: string;
  status: EmployeeStatus;
  joinDate: string;
  salary: number;
  address: string;
  nik: string;
  npwp: string;
  bankName: string;
  bankAccount: string;
  rewardPoints: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLocation: GeoLocation | null;
  checkOutLocation: GeoLocation | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  status: AttendanceStatus;
  workingDuration: number;
  isLate: boolean;
  lateMinutes: number;
  notes: string | null;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  addressDetail: string;
  latitude: number;
  longitude: number;
  description: string;
  assignedTo: string | null;
  assignedBy: string;
  rewardPoints: number;
  attachments: string[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  workingDate: string;
  estimatedDuration: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  addressDetail: string;
  latitude: number;
  longitude: number;
  notes: string;
}

export interface Reward {
  id: string;
  employeeId: string;
  points: number;
  type: RewardType;
  description: string;
  taskId: string | null;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  image: string;
  stock: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export interface Report {
  id: string;
  type: ReportType;
  generatedBy: string;
  dateRange: {
    start: string;
    end: string;
  };
  data: Record<string, unknown>;
  createdAt: string;
}

export interface CompanySetting {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  latitude: number;
  longitude: number;
  workingHours: WorkingHour;
  lateTolerance: number;
  gpsRadius: number;
  holidays: string[];
  taskCategories: TaskCategory[];
  rewardSettings: RewardSettings;
}

export interface Salary {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalSalary: number;
  status: SalaryStatus;
}

export interface TimelineEvent {
  id: string;
  taskId: string;
  status: TaskStatus;
  description: string;
  timestamp: string;
  employeeId: string;
  employeeName: string;
}

export interface EmployeeDashboardStats {
  attendanceDays: number;
  workingHours: number;
  salary: number;
  rewardPoints: number;
}

export interface AdminDashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  tasksToday: number;
  pendingTasks: number;
  completedTasks: number;
  onlineEmployees: number;
  monthlySalary: number;
}

export type DashboardStats = EmployeeDashboardStats | AdminDashboardStats;
