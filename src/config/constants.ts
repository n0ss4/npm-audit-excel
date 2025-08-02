/**
 * Application constants and configuration values
 * This file centralizes all magic numbers and strings to improve maintainability
 */

// Severity Weights for Priority Calculation
export const SEVERITY_WEIGHTS = {
  critical: 40,
  high: 30,
  moderate: 20,
  low: 10,
  info: 5,
} as const;

// Priority Scoring Constants
export const PRIORITY_SCORING = {
  // Bonus points
  DIRECT_DEPENDENCY_BONUS: 15,
  FIX_AVAILABLE_BONUS: 10,
  HIGH_CVSS_BONUS: 10, // For CVSS >= 9
  MEDIUM_CVSS_BONUS: 5, // For CVSS >= 7

  // Penalty points
  MAJOR_VERSION_PENALTY: 5,
  EFFECTS_PENALTY_PER_PACKAGE: 2,
  MAX_EFFECTS_PENALTY: 10,

  // Thresholds
  HIGH_CVSS_THRESHOLD: 9.0,
  MEDIUM_CVSS_THRESHOLD: 7.0,

  // Priority Category Thresholds
  URGENT_THRESHOLD: 50,
  HIGH_THRESHOLD: 35,
  MEDIUM_THRESHOLD: 20,
} as const;

// Excel Styling Colors (ARGB format)
export const COLORS = {
  // Priority Colors
  PRIORITY_URGENT: 'FF8B0000', // Dark Red
  PRIORITY_HIGH: 'FFFF4500', // Orange Red
  PRIORITY_MEDIUM: 'FFFFD700', // Gold
  PRIORITY_LOW: 'FF98FB98', // Light Green

  // Severity Colors
  SEVERITY_CRITICAL: 'FFFF0000', // Red
  SEVERITY_HIGH: 'FFFFA500', // Orange
  SEVERITY_MODERATE: 'FFFFFF00', // Yellow
  SEVERITY_LOW: 'FF90EE90', // Light Green

  // Text Colors
  WHITE_TEXT: 'FFFFFFFF',
  BLACK_TEXT: 'FF000000',

  // CVSS Score Colors
  CVSS_HIGH_RISK: 'FFFF0000', // Red for >= 9
  CVSS_MEDIUM_RISK: 'FFFF4500', // Orange for >= 7

  // Fix Available Colors
  FIX_AVAILABLE: 'FF008000', // Green
  FIX_NOT_AVAILABLE: 'FFFF0000', // Red

  // Background Colors
  HEADER_BACKGROUND: 'FF1F4788', // Dark Blue
  ALTERNATING_ROW: 'FFF2F2F2', // Light Gray

  // Border Colors
  BORDER_LIGHT: 'FFD3D3D3', // Light Gray
} as const;

// Excel Layout Constants
export const EXCEL_LAYOUT = {
  // Row Heights
  TITLE_ROW_HEIGHT: 30,
  HEADER_ROW_HEIGHT: 25,

  // Text Limits
  VULNERABILITY_TITLE_MAX_LENGTH: 80,

  // Font Sizes
  TITLE_FONT_SIZE: 16,
  SUMMARY_FONT_SIZE: 12,

  // Merge Cells Range
  TITLE_MERGE_RANGE: 'A1:P1',
  SUMMARY_MERGE_RANGE: 'A3:P3',

  // Auto Filter Range
  FILTER_START: 'A5',
  FILTER_END: 'P5',

  // Freeze Panes
  FREEZE_ROW: 5,
  FREEZE_COL: 0,
} as const;

// Column Configuration
export const COLUMN_WIDTHS = {
  PRIORITY: 12,
  SCORE: 8,
  PACKAGE: 35,
  SEVERITY: 12,
  CVSS: 8,
  DEPENDENCY_TYPE: 15,
  FIX_AVAILABLE: 15,
  FIX_VERSION: 20,
  MAJOR_CHANGE: 14,
  VULNERABILITY: 50,
  CWE: 15,
  AFFECTED_PACKAGES: 18,
  VULNERABLE_RANGE: 25,
  FIX_COMMAND: 45,
  ADVISORY_URL: 40,
  NOTES: 25,
} as const;

// Default Values
export const DEFAULTS = {
  OUTPUT_FILENAME: 'npm-audit-report.xlsx',
  LANGUAGE: 'en',
  FORMAT: 'excel' as const,
  VERBOSE: false,
  CONFIG_FILENAME: 'npm-audit-excel.config.json',
} as const;

// CLI Exit Codes
export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  FILE_NOT_FOUND: 2,
  INVALID_JSON: 3,
  INVALID_CONFIG: 4,
} as const;

// Vulnerability Categories
export const VULNERABILITY_CATEGORIES = {
  PRIORITY: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const,
  SEVERITY: ['critical', 'high', 'moderate', 'low', 'info'] as const,
} as const;

// NPM Command Templates
export const NPM_COMMANDS = {
  UPDATE: (packageName: string) => `npm update ${packageName}`,
  INSTALL_SPECIFIC: (packageName: string, version: string) =>
    `npm install ${packageName}@${version} --save`,
  AUDIT_FIX: 'npm audit fix',
  AUDIT_FIX_FORCE: 'npm audit fix --force',
  NO_FIX: 'No fix available',
} as const;

// File Extensions and MIME Types
export const FILE_TYPES = {
  EXCEL: '.xlsx',
  JSON: '.json',
  CSV: '.csv',
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  SEMVER: /^\d+\.\d+\.\d+/,
  PACKAGE_NAME: /^[@a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-._~]*$|^[a-z][a-z0-9-._~]*$/,
} as const;
