export { ConfigManager, DEFAULT_CONFIG, DEFAULTS, EXIT_CODES } from './config';
export type { ReportConfig } from './config';
export { ExcelReportGenerator } from './core/ExcelReportGenerator';
export { VulnerabilityProcessor } from './core/VulnerabilityProcessor';
export type {
  AuditReport,
  ProcessedVulnerability,
  ReportOptions,
  SeverityLevel,
  PriorityCategory,
  LanguageCode,
  PresetName,
  ColumnName,
  CellValue,
  ConfigError,
  ProcessingError,
} from './types';
