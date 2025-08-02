import { COLORS, COLUMN_WIDTHS, EXCEL_LAYOUT } from './constants';

/**
 * Report configuration interface
 * Allows customization of columns, colors, and layout
 */
export interface ReportConfig {
  columns: ColumnConfig;
  colors: ColorConfig;
  layout: LayoutConfig;
  scoring: ScoringConfig;
  output: OutputConfig;
}

export interface ColumnConfig {
  visible: VisibleColumns;
  order: (keyof VisibleColumns)[];
  widths: Record<keyof VisibleColumns, number>;
  customHeaders?: Partial<Record<keyof VisibleColumns, string>>;
}

export interface VisibleColumns {
  priority: boolean;
  score: boolean;
  package: boolean;
  severity: boolean;
  cvss: boolean;
  dependencyType: boolean;
  fixAvailable: boolean;
  fixVersion: boolean;
  majorChange: boolean;
  vulnerability: boolean;
  cwe: boolean;
  affectedPackages: boolean;
  vulnerableRange: boolean;
  fixCommand: boolean;
  advisoryUrl: boolean;
  notes: boolean;
}

export interface ColorConfig {
  priority: {
    urgent: string;
    high: string;
    medium: string;
    low: string;
  };
  severity: {
    critical: string;
    high: string;
    moderate: string;
    low: string;
  };
  text: {
    white: string;
    black: string;
  };
  background: {
    header: string;
    alternatingRow: string;
  };
  cvss: {
    highRisk: string;
    mediumRisk: string;
  };
  fix: {
    available: string;
    notAvailable: string;
  };
  border: string;
}

export interface LayoutConfig {
  rowHeights: {
    title: number;
    header: number;
  };
  fontSizes: {
    title: number;
    summary: number;
  };
  textLimits: {
    vulnerabilityTitle: number;
  };
  freezePanes: {
    row: number;
    col: number;
  };
  enableAutoFilter: boolean;
  enableAlternatingRows: boolean;
}

export interface ScoringConfig {
  severityWeights: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    info: number;
  };
  bonusPoints: {
    directDependency: number;
    fixAvailable: number;
    highCvss: number;
    mediumCvss: number;
  };
  penalties: {
    majorVersion: number;
    effectsPerPackage: number;
    maxEffectsPenalty: number;
  };
  thresholds: {
    highCvss: number;
    mediumCvss: number;
    urgentPriority: number;
    highPriority: number;
    mediumPriority: number;
  };
}

export interface OutputConfig {
  includeTitle: boolean;
  includeSummary: boolean;
  includeTimestamp: boolean;
  dateFormat: string;
  worksheetName: string;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: ReportConfig = {
  columns: {
    visible: {
      priority: true,
      score: true,
      package: true,
      severity: true,
      cvss: true,
      dependencyType: true,
      fixAvailable: true,
      fixVersion: true,
      majorChange: true,
      vulnerability: true,
      cwe: true,
      affectedPackages: true,
      vulnerableRange: true,
      fixCommand: true,
      advisoryUrl: true,
      notes: true,
    },
    order: [
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
    ],
    widths: {
      priority: COLUMN_WIDTHS.PRIORITY,
      score: COLUMN_WIDTHS.SCORE,
      package: COLUMN_WIDTHS.PACKAGE,
      severity: COLUMN_WIDTHS.SEVERITY,
      cvss: COLUMN_WIDTHS.CVSS,
      dependencyType: COLUMN_WIDTHS.DEPENDENCY_TYPE,
      fixAvailable: COLUMN_WIDTHS.FIX_AVAILABLE,
      fixVersion: COLUMN_WIDTHS.FIX_VERSION,
      majorChange: COLUMN_WIDTHS.MAJOR_CHANGE,
      vulnerability: COLUMN_WIDTHS.VULNERABILITY,
      cwe: COLUMN_WIDTHS.CWE,
      affectedPackages: COLUMN_WIDTHS.AFFECTED_PACKAGES,
      vulnerableRange: COLUMN_WIDTHS.VULNERABLE_RANGE,
      fixCommand: COLUMN_WIDTHS.FIX_COMMAND,
      advisoryUrl: COLUMN_WIDTHS.ADVISORY_URL,
      notes: COLUMN_WIDTHS.NOTES,
    },
  },
  colors: {
    priority: {
      urgent: COLORS.PRIORITY_URGENT,
      high: COLORS.PRIORITY_HIGH,
      medium: COLORS.PRIORITY_MEDIUM,
      low: COLORS.PRIORITY_LOW,
    },
    severity: {
      critical: COLORS.SEVERITY_CRITICAL,
      high: COLORS.SEVERITY_HIGH,
      moderate: COLORS.SEVERITY_MODERATE,
      low: COLORS.SEVERITY_LOW,
    },
    text: {
      white: COLORS.WHITE_TEXT,
      black: COLORS.BLACK_TEXT,
    },
    background: {
      header: COLORS.HEADER_BACKGROUND,
      alternatingRow: COLORS.ALTERNATING_ROW,
    },
    cvss: {
      highRisk: COLORS.CVSS_HIGH_RISK,
      mediumRisk: COLORS.CVSS_MEDIUM_RISK,
    },
    fix: {
      available: COLORS.FIX_AVAILABLE,
      notAvailable: COLORS.FIX_NOT_AVAILABLE,
    },
    border: COLORS.BORDER_LIGHT,
  },
  layout: {
    rowHeights: {
      title: EXCEL_LAYOUT.TITLE_ROW_HEIGHT,
      header: EXCEL_LAYOUT.HEADER_ROW_HEIGHT,
    },
    fontSizes: {
      title: EXCEL_LAYOUT.TITLE_FONT_SIZE,
      summary: EXCEL_LAYOUT.SUMMARY_FONT_SIZE,
    },
    textLimits: {
      vulnerabilityTitle: EXCEL_LAYOUT.VULNERABILITY_TITLE_MAX_LENGTH,
    },
    freezePanes: {
      row: EXCEL_LAYOUT.FREEZE_ROW,
      col: EXCEL_LAYOUT.FREEZE_COL,
    },
    enableAutoFilter: true,
    enableAlternatingRows: true,
  },
  scoring: {
    severityWeights: {
      critical: 40,
      high: 30,
      moderate: 20,
      low: 10,
      info: 5,
    },
    bonusPoints: {
      directDependency: 15,
      fixAvailable: 10,
      highCvss: 10,
      mediumCvss: 5,
    },
    penalties: {
      majorVersion: 5,
      effectsPerPackage: 2,
      maxEffectsPenalty: 10,
    },
    thresholds: {
      highCvss: 9.0,
      mediumCvss: 7.0,
      urgentPriority: 50,
      highPriority: 35,
      mediumPriority: 20,
    },
  },
  output: {
    includeTitle: true,
    includeSummary: true,
    includeTimestamp: true,
    dateFormat: 'toLocaleString',
    worksheetName: 'Security Report',
  },
};

/**
 * Preset configurations for common use cases
 */
export const PRESET_CONFIGS = {
  // Minimal configuration showing only essential columns
  minimal: (): Partial<ReportConfig> => ({
    columns: {
      visible: {
        priority: true,
        package: true,
        severity: true,
        fixAvailable: true,
        fixCommand: true,
        // Hide all others
        score: false,
        cvss: false,
        dependencyType: false,
        fixVersion: false,
        majorChange: false,
        vulnerability: false,
        cwe: false,
        affectedPackages: false,
        vulnerableRange: false,
        advisoryUrl: false,
        notes: false,
      },
      order: ['priority', 'package', 'severity', 'fixAvailable', 'fixCommand'],
      widths: {
        priority: COLUMN_WIDTHS.PRIORITY,
        score: COLUMN_WIDTHS.SCORE,
        package: COLUMN_WIDTHS.PACKAGE,
        severity: COLUMN_WIDTHS.SEVERITY,
        cvss: COLUMN_WIDTHS.CVSS,
        dependencyType: COLUMN_WIDTHS.DEPENDENCY_TYPE,
        fixAvailable: COLUMN_WIDTHS.FIX_AVAILABLE,
        fixVersion: COLUMN_WIDTHS.FIX_VERSION,
        majorChange: COLUMN_WIDTHS.MAJOR_CHANGE,
        vulnerability: COLUMN_WIDTHS.VULNERABILITY,
        cwe: COLUMN_WIDTHS.CWE,
        affectedPackages: COLUMN_WIDTHS.AFFECTED_PACKAGES,
        vulnerableRange: COLUMN_WIDTHS.VULNERABLE_RANGE,
        fixCommand: COLUMN_WIDTHS.FIX_COMMAND,
        advisoryUrl: COLUMN_WIDTHS.ADVISORY_URL,
        notes: COLUMN_WIDTHS.NOTES,
      },
    },
  }),

  // Developer-focused configuration
  developer: (): Partial<ReportConfig> => ({
    columns: {
      visible: {
        priority: true,
        score: true,
        package: true,
        severity: true,
        cvss: true,
        dependencyType: true,
        fixAvailable: true,
        fixVersion: true,
        fixCommand: true,
        vulnerability: true,
        // Hide less relevant for devs
        majorChange: false,
        cwe: false,
        affectedPackages: false,
        vulnerableRange: false,
        advisoryUrl: false,
        notes: false,
      },
      order: [
        'priority',
        'package',
        'severity',
        'dependencyType',
        'fixAvailable',
        'fixCommand',
        'score',
        'cvss',
        'fixVersion',
        'vulnerability',
      ],
      widths: {
        priority: COLUMN_WIDTHS.PRIORITY,
        score: COLUMN_WIDTHS.SCORE,
        package: COLUMN_WIDTHS.PACKAGE,
        severity: COLUMN_WIDTHS.SEVERITY,
        cvss: COLUMN_WIDTHS.CVSS,
        dependencyType: COLUMN_WIDTHS.DEPENDENCY_TYPE,
        fixAvailable: COLUMN_WIDTHS.FIX_AVAILABLE,
        fixVersion: COLUMN_WIDTHS.FIX_VERSION,
        majorChange: COLUMN_WIDTHS.MAJOR_CHANGE,
        vulnerability: COLUMN_WIDTHS.VULNERABILITY,
        cwe: COLUMN_WIDTHS.CWE,
        affectedPackages: COLUMN_WIDTHS.AFFECTED_PACKAGES,
        vulnerableRange: COLUMN_WIDTHS.VULNERABLE_RANGE,
        fixCommand: COLUMN_WIDTHS.FIX_COMMAND,
        advisoryUrl: COLUMN_WIDTHS.ADVISORY_URL,
        notes: COLUMN_WIDTHS.NOTES,
      },
    },
  }),

  // Security-focused configuration
  security: (): Partial<ReportConfig> => ({
    columns: {
      visible: {
        priority: true,
        score: true,
        package: true,
        severity: true,
        cvss: true,
        vulnerability: true,
        cwe: true,
        advisoryUrl: true,
        dependencyType: true,
        fixAvailable: true,
        notes: true,
        // Hide technical details
        fixVersion: false,
        majorChange: false,
        affectedPackages: false,
        vulnerableRange: false,
        fixCommand: false,
      },
      order: [
        'priority',
        'severity',
        'cvss',
        'package',
        'vulnerability',
        'cwe',
        'dependencyType',
        'fixAvailable',
        'advisoryUrl',
        'score',
        'notes',
      ],
      widths: {
        priority: COLUMN_WIDTHS.PRIORITY,
        score: COLUMN_WIDTHS.SCORE,
        package: COLUMN_WIDTHS.PACKAGE,
        severity: COLUMN_WIDTHS.SEVERITY,
        cvss: COLUMN_WIDTHS.CVSS,
        dependencyType: COLUMN_WIDTHS.DEPENDENCY_TYPE,
        fixAvailable: COLUMN_WIDTHS.FIX_AVAILABLE,
        fixVersion: COLUMN_WIDTHS.FIX_VERSION,
        majorChange: COLUMN_WIDTHS.MAJOR_CHANGE,
        vulnerability: COLUMN_WIDTHS.VULNERABILITY,
        cwe: COLUMN_WIDTHS.CWE,
        affectedPackages: COLUMN_WIDTHS.AFFECTED_PACKAGES,
        vulnerableRange: COLUMN_WIDTHS.VULNERABLE_RANGE,
        fixCommand: COLUMN_WIDTHS.FIX_COMMAND,
        advisoryUrl: COLUMN_WIDTHS.ADVISORY_URL,
        notes: COLUMN_WIDTHS.NOTES,
      },
    },
  }),

  // High contrast color scheme for accessibility
  highContrast: (): Partial<ReportConfig> => ({
    colors: {
      priority: {
        urgent: 'FF000000', // Black
        high: 'FF800000', // Maroon
        medium: 'FF808000', // Olive
        low: 'FF008000', // Green
      },
      severity: {
        critical: 'FF000000', // Black
        high: 'FF800000', // Maroon
        moderate: 'FF808000', // Olive
        low: 'FF008000', // Green
      },
      text: {
        white: 'FFFFFFFF',
        black: 'FF000000',
      },
      background: {
        header: 'FF000080', // Navy
        alternatingRow: 'FFE0E0E0', // Light Gray
      },
      cvss: {
        highRisk: 'FF000000',
        mediumRisk: 'FF800000',
      },
      fix: {
        available: 'FF008000',
        notAvailable: 'FF800000',
      },
      border: 'FF000000',
    },
  }),
} as const;

/**
 * Merges user configuration with default configuration
 */
export function mergeConfig(userConfig: Partial<ReportConfig>): ReportConfig {
  return {
    columns: {
      ...DEFAULT_CONFIG.columns,
      ...userConfig.columns,
      visible: {
        ...DEFAULT_CONFIG.columns.visible,
        ...userConfig.columns?.visible,
      },
      widths: {
        ...DEFAULT_CONFIG.columns.widths,
        ...userConfig.columns?.widths,
      },
    },
    colors: {
      ...DEFAULT_CONFIG.colors,
      ...userConfig.colors,
      priority: {
        ...DEFAULT_CONFIG.colors.priority,
        ...userConfig.colors?.priority,
      },
      severity: {
        ...DEFAULT_CONFIG.colors.severity,
        ...userConfig.colors?.severity,
      },
      text: {
        ...DEFAULT_CONFIG.colors.text,
        ...userConfig.colors?.text,
      },
      background: {
        ...DEFAULT_CONFIG.colors.background,
        ...userConfig.colors?.background,
      },
      cvss: {
        ...DEFAULT_CONFIG.colors.cvss,
        ...userConfig.colors?.cvss,
      },
      fix: {
        ...DEFAULT_CONFIG.colors.fix,
        ...userConfig.colors?.fix,
      },
    },
    layout: {
      ...DEFAULT_CONFIG.layout,
      ...userConfig.layout,
      rowHeights: {
        ...DEFAULT_CONFIG.layout.rowHeights,
        ...userConfig.layout?.rowHeights,
      },
      fontSizes: {
        ...DEFAULT_CONFIG.layout.fontSizes,
        ...userConfig.layout?.fontSizes,
      },
      textLimits: {
        ...DEFAULT_CONFIG.layout.textLimits,
        ...userConfig.layout?.textLimits,
      },
      freezePanes: {
        ...DEFAULT_CONFIG.layout.freezePanes,
        ...userConfig.layout?.freezePanes,
      },
    },
    scoring: {
      ...DEFAULT_CONFIG.scoring,
      ...userConfig.scoring,
      severityWeights: {
        ...DEFAULT_CONFIG.scoring.severityWeights,
        ...userConfig.scoring?.severityWeights,
      },
      bonusPoints: {
        ...DEFAULT_CONFIG.scoring.bonusPoints,
        ...userConfig.scoring?.bonusPoints,
      },
      penalties: {
        ...DEFAULT_CONFIG.scoring.penalties,
        ...userConfig.scoring?.penalties,
      },
      thresholds: {
        ...DEFAULT_CONFIG.scoring.thresholds,
        ...userConfig.scoring?.thresholds,
      },
    },
    output: {
      ...DEFAULT_CONFIG.output,
      ...userConfig.output,
    },
  };
}
