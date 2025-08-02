// Severity levels as literal types for strict typing
export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low' | 'info';
export type PriorityCategory = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

// Language codes for i18n
export type LanguageCode = 'en' | 'es';

// Column names as literal types
export type ColumnName = keyof VisibleColumns;

// Configuration validation types
export interface ValidationError {
  readonly path: string;
  readonly message: string;
}

export interface ConfigValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
}

// Type guards for runtime type checking
export interface TypeGuards {
  isSeverityLevel(value: string): value is SeverityLevel;
  isPriorityCategory(value: string): value is PriorityCategory;
  isLanguageCode(value: string): value is LanguageCode;
  isColumnName(value: string): value is ColumnName;
}

export interface AuditReport {
  readonly auditReportVersion: number;
  readonly vulnerabilities: Record<string, Vulnerability>;
  readonly metadata: Metadata;
}

export interface Vulnerability {
  readonly name: string;
  readonly severity: SeverityLevel;
  readonly isDirect: boolean;
  readonly via: ReadonlyArray<string | VulnerabilityDetail>;
  readonly effects: readonly string[];
  readonly range: string;
  readonly nodes: readonly string[];
  readonly fixAvailable: boolean | FixInfo;
}

export interface VulnerabilityDetail {
  readonly source: number;
  readonly name: string;
  readonly dependency: string;
  readonly title: string;
  readonly url: string;
  readonly severity: SeverityLevel;
  readonly cwe: readonly string[];
  readonly cvss: {
    readonly score: number;
    readonly vectorString: string | null;
  };
  readonly range: string;
}

export interface FixInfo {
  readonly name: string;
  readonly version: string;
  readonly isSemVerMajor?: boolean;
}

export interface Metadata {
  readonly vulnerabilities: {
    readonly info: number;
    readonly low: number;
    readonly moderate: number;
    readonly high: number;
    readonly critical: number;
    readonly total: number;
  };
  readonly dependencies: {
    readonly prod: number;
    readonly dev: number;
    readonly optional: number;
    readonly peer: number;
    readonly peerOptional: number;
    readonly total: number;
  };
}

export interface ProcessedVulnerability {
  package: string;
  severity: SeverityLevel;
  isDirect: boolean;
  range: string;
  fixAvailable: boolean;
  fixVersion: string;
  fixPackage: string;
  isSemVerMajor: boolean;
  effectsCount: number;
  viaCount: number;
  cvssScore: number;
  vulnerabilityTitle: string;
  advisoryUrl: string;
  cwe: string;
  fixCommand: string;
  priorityScore: number;
  priorityCategory: PriorityCategory;
}

// Preset types for strict validation
export type PresetName = 'minimal' | 'developer' | 'security' | 'highContrast';
export type OutputFormat = 'excel' | 'json' | 'csv';

export interface ReportOptions {
  readonly input?: string;
  readonly output?: string;
  readonly language?: LanguageCode;
  readonly format?: OutputFormat;
  readonly verbose?: boolean;
  readonly config?: string;
  readonly preset?: PresetName;
  readonly showColumns?: string;
  readonly hideColumns?: string;
  readonly colors?: string;
  readonly generateConfig?: boolean;
  readonly listPresets?: boolean;
}

// Configuration types (need to be defined before ColumnName type)
export interface VisibleColumns {
  readonly priority: boolean;
  readonly score: boolean;
  readonly package: boolean;
  readonly severity: boolean;
  readonly cvss: boolean;
  readonly dependencyType: boolean;
  readonly fixAvailable: boolean;
  readonly fixVersion: boolean;
  readonly majorChange: boolean;
  readonly vulnerability: boolean;
  readonly cwe: boolean;
  readonly affectedPackages: boolean;
  readonly vulnerableRange: boolean;
  readonly fixCommand: boolean;
  readonly advisoryUrl: boolean;
  readonly notes: boolean;
}

export interface ColorConfig {
  readonly priority: {
    readonly urgent: string;
    readonly high: string;
    readonly medium: string;
    readonly low: string;
  };
  readonly severity: {
    readonly critical: string;
    readonly high: string;
    readonly moderate: string;
    readonly low: string;
  };
  readonly text: {
    readonly white: string;
    readonly black: string;
  };
  readonly background: {
    readonly header: string;
    readonly alternatingRow: string;
  };
  readonly cvss: {
    readonly highRisk: string;
    readonly mediumRisk: string;
  };
  readonly fix: {
    readonly available: string;
    readonly notAvailable: string;
  };
  readonly border: string;
}

export interface ColumnConfig {
  readonly visible: VisibleColumns;
  readonly order: ColumnName[];
  readonly widths: Record<ColumnName, number>;
  readonly customHeaders?: Partial<Record<ColumnName, string>>;
}

// Validation-specific types
export interface ColorValidation {
  readonly isValidHexColor: (color: string) => boolean;
  readonly isValidColorConfig: (config: Partial<ColorConfig>) => ConfigValidationResult;
}

export interface ColumnValidation {
  readonly isValidColumnName: (name: string) => name is ColumnName;
  readonly isValidColumnConfig: (config: Partial<ColumnConfig>) => ConfigValidationResult;
}

// JSON parsing types for safe configuration handling
export interface JsonParseResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

// Utility types for configuration merging
export type DeepPartial<T> = {
  readonly [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Error handling types
export interface ConfigError extends Error {
  code: string;
  path?: string;
}

export interface ProcessingError extends Error {
  vulnerability?: string;
  step?: string;
}

// Type-safe cell value types for Excel generation
export type CellValue = string | number | boolean | Date;
export type CellData = Record<ColumnName, CellValue>;

// Safe data mapping interface
export interface DataMapping {
  readonly getValue: (key: ColumnName) => CellValue;
  readonly getRowData: () => readonly CellValue[];
  readonly validate: () => ConfigValidationResult;
}

// I18n types
export interface TranslationOptions {
  readonly [key: string]: string | number;
}

export type I18nFunction = (key: string, options?: TranslationOptions) => string;

// CLI argument parsing types
export interface ParsedColumns {
  readonly visible: Partial<VisibleColumns>;
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface ParsedColors {
  readonly colors: Partial<ColorConfig>;
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

// Type guards implementation
export const createTypeGuards = (): TypeGuards => ({
  isSeverityLevel: (value: string): value is SeverityLevel =>
    ['critical', 'high', 'moderate', 'low', 'info'].includes(value),

  isPriorityCategory: (value: string): value is PriorityCategory =>
    ['URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(value),

  isLanguageCode: (value: string): value is LanguageCode => ['en', 'es'].includes(value),

  isColumnName: (value: string): value is ColumnName =>
    [
      'priority',
      'score',
      'package',
      'severity',
      'cvss',
      'dependencyType',
      'fixAvailable',
      'fixVersion',
      'majorChange',
      'vulnerability',
      'cwe',
      'affectedPackages',
      'vulnerableRange',
      'fixCommand',
      'advisoryUrl',
      'notes',
    ].includes(value),
});

// Export type guard instance
export const typeGuards = createTypeGuards();
