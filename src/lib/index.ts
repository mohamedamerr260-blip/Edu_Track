// Route Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:id',
  GRADES: '/grades',
  ATTENDANCE: '/attendance',
  BEHAVIOR: '/behavior',
  MESSAGES: '/messages',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  CALENDAR: '/calendar',
  ASSIGNMENTS: '/assignments',
  PARENT_PORTAL: '/parent-portal',
  TEACHER_PORTAL: '/teacher-portal',
  STUDENT_PORTAL: '/student-portal',
} as const;

// User Roles
export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  ADMIN = 'admin',
}

// Grade Types
export type GradeValue = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | number;

export type GradeCategory = 'homework' | 'quiz' | 'test' | 'project' | 'participation' | 'final';

// Attendance Status
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

// Behavior Types
export enum BehaviorType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

export enum BadgeType {
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  IMPROVEMENT = 'improvement',
  LEADERSHIP = 'leadership',
  ATTENDANCE = 'attendance',
  ACADEMIC = 'academic',
}

// Message Priority
export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Notification Types
export enum NotificationType {
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  BEHAVIOR = 'behavior',
  MESSAGE = 'message',
  ASSIGNMENT = 'assignment',
  ANNOUNCEMENT = 'announcement',
  REMINDER = 'reminder',
}

// TypeScript Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  grade: string;
  class: string;
  parentId?: string;
  dateOfBirth: Date;
  enrollmentDate: Date;
  studentId: string;
  address?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  gpa?: number;
  attendance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  category: GradeCategory;
  value: GradeValue;
  numericValue: number;
  maxPoints: number;
  weight: number;
  assignmentName: string;
  description?: string;
  dueDate?: Date;
  submittedDate?: Date;
  gradedDate: Date;
  teacherId: string;
  teacherName: string;
  comments?: string;
  isLate?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  period?: string;
  subject?: string;
  teacherId: string;
  teacherName: string;
  notes?: string;
  notifiedParent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Behavior {
  id: string;
  studentId: string;
  type: BehaviorType;
  title: string;
  description: string;
  date: Date;
  teacherId: string;
  teacherName: string;
  severity?: 'minor' | 'moderate' | 'major';
  actionTaken?: string;
  followUpRequired: boolean;
  notifiedParent: boolean;
  points?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  subject: string;
  body: string;
  priority: MessagePriority;
  isRead: boolean;
  readAt?: Date;
  attachments?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  threadId?: string;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  studentId: string;
  type: 'progress' | 'attendance' | 'behavior' | 'comprehensive';
  title: string;
  period: string;
  startDate: Date;
  endDate: Date;
  generatedBy: string;
  generatedByName: string;
  data: {
    grades?: Grade[];
    attendance?: Attendance[];
    behavior?: Behavior[];
    summary?: string;
    recommendations?: string[];
    strengths?: string[];
    areasForImprovement?: string[];
  };
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  dueDate: Date;
  assignedDate: Date;
  maxPoints: number;
  category: GradeCategory;
  attachments?: {
    id: string;
    name: string;
    url: string;
  }[];
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: BadgeType;
  icon: string;
  color: string;
  criteria: string;
  points: number;
  createdAt: Date;
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  badge: Badge;
  awardedBy: string;
  awardedByName: string;
  awardedDate: Date;
  reason?: string;
}

// Utility Functions

/**
 * Get color class for grade value
 */
export function getGradeColor(grade: GradeValue): string {
  if (typeof grade === 'number') {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  const gradeStr = grade.toString();
  if (gradeStr.startsWith('A')) return 'text-green-600';
  if (gradeStr.startsWith('B')) return 'text-blue-600';
  if (gradeStr.startsWith('C')) return 'text-yellow-600';
  if (gradeStr.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get background color class for grade value
 */
export function getGradeBgColor(grade: GradeValue): string {
  if (typeof grade === 'number') {
    if (grade >= 90) return 'bg-green-100';
    if (grade >= 80) return 'bg-blue-100';
    if (grade >= 70) return 'bg-yellow-100';
    if (grade >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  }

  const gradeStr = grade.toString();
  if (gradeStr.startsWith('A')) return 'bg-green-100';
  if (gradeStr.startsWith('B')) return 'bg-blue-100';
  if (gradeStr.startsWith('C')) return 'bg-yellow-100';
  if (gradeStr.startsWith('D')) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Convert letter grade to numeric value
 */
export function letterToNumeric(grade: string): number {
  const gradeMap: Record<string, number> = {
    'A+': 97, 'A': 93, 'A-': 90,
    'B+': 87, 'B': 83, 'B-': 80,
    'C+': 77, 'C': 73, 'C-': 70,
    'D+': 67, 'D': 63, 'D-': 60,
    'F': 50,
  };
  return gradeMap[grade] || 0;
}

/**
 * Convert numeric grade to letter grade
 */
export function numericToLetter(grade: number): string {
  if (grade >= 97) return 'A+';
  if (grade >= 93) return 'A';
  if (grade >= 90) return 'A-';
  if (grade >= 87) return 'B+';
  if (grade >= 83) return 'B';
  if (grade >= 80) return 'B-';
  if (grade >= 77) return 'C+';
  if (grade >= 73) return 'C';
  if (grade >= 70) return 'C-';
  if (grade >= 67) return 'D+';
  if (grade >= 63) return 'D';
  if (grade >= 60) return 'D-';
  return 'F';
}

/**
 * Get color for attendance status
 */
export function getAttendanceColor(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return 'text-green-600';
    case AttendanceStatus.ABSENT:
      return 'text-red-600';
    case AttendanceStatus.LATE:
      return 'text-yellow-600';
    case AttendanceStatus.EXCUSED:
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get background color for attendance status
 */
export function getAttendanceBgColor(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return 'bg-green-100';
    case AttendanceStatus.ABSENT:
      return 'bg-red-100';
    case AttendanceStatus.LATE:
      return 'bg-yellow-100';
    case AttendanceStatus.EXCUSED:
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Get color for behavior type
 */
export function getBehaviorColor(type: BehaviorType): string {
  switch (type) {
    case BehaviorType.POSITIVE:
      return 'text-green-600';
    case BehaviorType.NEGATIVE:
      return 'text-red-600';
    case BehaviorType.NEUTRAL:
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get background color for behavior type
 */
export function getBehaviorBgColor(type: BehaviorType): string {
  switch (type) {
    case BehaviorType.POSITIVE:
      return 'bg-green-100';
    case BehaviorType.NEGATIVE:
      return 'bg-red-100';
    case BehaviorType.NEUTRAL:
      return 'bg-gray-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate GPA from grades
 */
export function calculateGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0;

  const totalPoints = grades.reduce((sum, grade) => {
    const numeric = typeof grade.value === 'number' 
      ? grade.value 
      : letterToNumeric(grade.value.toString());
    return sum + (numeric / 100) * 4.0 * (grade.weight || 1);
  }, 0);

  const totalWeight = grades.reduce((sum, grade) => sum + (grade.weight || 1), 0);

  return totalWeight > 0 ? Number((totalPoints / totalWeight).toFixed(2)) : 0;
}

/**
 * Calculate attendance percentage
 */
export function calculateAttendancePercentage(attendance: Attendance[]): number {
  if (attendance.length === 0) return 100;

  const presentCount = attendance.filter(
    a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE
  ).length;

  return Number(((presentCount / attendance.length) * 100).toFixed(1));
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
