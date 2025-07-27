// Application constants
export const APP_NAME = 'School ERP System';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password'
  },
  STUDENTS: '/students',
  FEES: '/fees',
  ATTENDANCE: '/attendance',
  ACADEMIC: '/academic',
  USERS: '/users',
  REPORTS: '/reports'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  STAFF: 'staff'
};

// User statuses
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Student statuses
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  SUSPENDED: 'suspended'
};

// Fee statuses
export const FEE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  WAIVED: 'waived'
};

// Attendance statuses
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  HALF_DAY: 'half_day'
};

// Academic grades
export const ACADEMIC_GRADES = {
  A_PLUS: 'A+',
  A: 'A',
  A_MINUS: 'A-',
  B_PLUS: 'B+',
  B: 'B',
  B_MINUS: 'B-',
  C_PLUS: 'C+',
  C: 'C',
  C_MINUS: 'C-',
  D_PLUS: 'D+',
  D: 'D',
  F: 'F'
};

// Report types
export const REPORT_TYPES = {
  STUDENT: 'student',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  ACADEMIC: 'academic',
  FINANCIAL: 'financial',
  DEMOGRAPHIC: 'demographic'
};

// File types
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  SPREADSHEET: ['xls', 'xlsx', 'csv'],
  PRESENTATION: ['ppt', 'pptx'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm'
};

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  STUDENT_ID: /^[A-Z]{2}\d{4}$/,
  GR_NUMBER: /^GR\d{6}$/
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  INVALID_STUDENT_ID: 'Student ID must be 2 letters followed by 4 digits',
  INVALID_GR_NUMBER: 'GR Number must be GR followed by 6 digits',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be no more than ${max}`,
  FILE_SIZE: (size) => `File size must be less than ${size}MB`,
  FILE_TYPE: (types) => `File type must be one of: ${types.join(', ')}`
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Record created successfully',
  UPDATED: 'Record updated successfully',
  DELETED: 'Record deleted successfully',
  SAVED: 'Changes saved successfully',
  UPLOADED: 'File uploaded successfully',
  DOWNLOADED: 'File downloaded successfully',
  EXPORTED: 'Report exported successfully',
  LOGGED_IN: 'Logged in successfully',
  LOGGED_OUT: 'Logged out successfully',
  PASSWORD_RESET: 'Password reset email sent',
  PASSWORD_CHANGED: 'Password changed successfully'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed'
};

// Route paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  FEES: '/fees',
  ATTENDANCE: '/attendance',
  ACADEMIC: '/academic',
  USERS: '/users',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  LOGIN: '/login',
  LOGOUT: '/logout'
};

// Table columns configuration
export const TABLE_COLUMNS = {
  STUDENTS: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'class', label: 'Class', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ],
  FEES: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'student', label: 'Student', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'due_date', label: 'Due Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ],
  ATTENDANCE: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'student', label: 'Student', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ]
};