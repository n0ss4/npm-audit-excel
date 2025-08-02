import fs from 'node:fs/promises';
import path from 'node:path';
import { DEFAULTS } from './constants';
import { DEFAULT_CONFIG, mergeConfig, PRESET_CONFIGS, type ReportConfig } from './reportConfig';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: ReportConfig;

  private constructor() {
    this.config = DEFAULT_CONFIG;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Deep merges two configurations, prioritizing the second one
   */
  private deepMergeConfig(base: ReportConfig, partial: Partial<ReportConfig>): ReportConfig {
    const result = { ...base };

    if (partial.columns) {
      result.columns = {
        ...result.columns,
        ...partial.columns,
        visible: {
          ...result.columns.visible,
          ...partial.columns.visible,
        },
        widths: {
          ...result.columns.widths,
          ...partial.columns.widths,
        },
        customHeaders: {
          ...result.columns.customHeaders,
          ...partial.columns.customHeaders,
        },
      };
    }

    if (partial.colors) {
      result.colors = {
        ...result.colors,
        ...partial.colors,
        priority: {
          ...result.colors.priority,
          ...partial.colors.priority,
        },
        severity: {
          ...result.colors.severity,
          ...partial.colors.severity,
        },
        text: {
          ...result.colors.text,
          ...partial.colors.text,
        },
        background: {
          ...result.colors.background,
          ...partial.colors.background,
        },
        cvss: {
          ...result.colors.cvss,
          ...partial.colors.cvss,
        },
        fix: {
          ...result.colors.fix,
          ...partial.colors.fix,
        },
      };
    }

    if (partial.layout) {
      result.layout = {
        ...result.layout,
        ...partial.layout,
        rowHeights: {
          ...result.layout.rowHeights,
          ...partial.layout.rowHeights,
        },
        fontSizes: {
          ...result.layout.fontSizes,
          ...partial.layout.fontSizes,
        },
        textLimits: {
          ...result.layout.textLimits,
          ...partial.layout.textLimits,
        },
        freezePanes: {
          ...result.layout.freezePanes,
          ...partial.layout.freezePanes,
        },
      };
    }

    if (partial.scoring) {
      result.scoring = {
        ...result.scoring,
        ...partial.scoring,
        severityWeights: {
          ...result.scoring.severityWeights,
          ...partial.scoring.severityWeights,
        },
        bonusPoints: {
          ...result.scoring.bonusPoints,
          ...partial.scoring.bonusPoints,
        },
        penalties: {
          ...result.scoring.penalties,
          ...partial.scoring.penalties,
        },
        thresholds: {
          ...result.scoring.thresholds,
          ...partial.scoring.thresholds,
        },
      };
    }

    if (partial.output) {
      result.output = {
        ...result.output,
        ...partial.output,
      };
    }

    return result;
  }

  /**
   * Loads configuration from file, preset, or returns default
   */
  public async loadConfig(
    options: {
      configFile?: string;
      preset?: keyof typeof PRESET_CONFIGS;
      inlineConfig?: Partial<ReportConfig>;
    } = {}
  ): Promise<ReportConfig> {
    let config = DEFAULT_CONFIG;

    // Load from preset first
    if (options.preset && PRESET_CONFIGS[options.preset]) {
      const presetConfig = PRESET_CONFIGS[options.preset]();
      config = mergeConfig(presetConfig);
    }

    // Load from config file
    if (options.configFile) {
      try {
        const fileConfig = await this.loadConfigFromFile(options.configFile);
        config = this.deepMergeConfig(config, fileConfig);
      } catch (error) {
        console.warn(`Warning: Could not load config file ${options.configFile}:`, error);
      }
    }

    // Apply inline configuration
    if (options.inlineConfig) {
      config = this.deepMergeConfig(config, options.inlineConfig);
    }

    this.config = config;
    return config;
  }

  /**
   * Loads configuration from a JSON file
   */
  private async loadConfigFromFile(configPath: string): Promise<Partial<ReportConfig>> {
    const fullPath = path.resolve(configPath);

    try {
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const config = JSON.parse(fileContent) as Partial<ReportConfig>;

      this.validateConfig(config);
      return config;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          throw new Error(`Config file not found: ${fullPath}`);
        } else if (error instanceof SyntaxError) {
          throw new Error(`Invalid JSON in config file: ${fullPath}`);
        }
      }
      throw error;
    }
  }

  /**
   * Saves current configuration to a file
   */
  public async saveConfig(configPath: string): Promise<void> {
    const fullPath = path.resolve(configPath);
    const configJson = JSON.stringify(this.config, null, 2);

    try {
      await fs.writeFile(fullPath, configJson, 'utf-8');
    } catch (_error) {
      throw new Error(`Could not save config file: ${fullPath}`);
    }
  }

  /**
   * Generates a sample configuration file
   */
  public async generateSampleConfig(outputPath: string = DEFAULTS.CONFIG_FILENAME): Promise<void> {
    const sampleConfig = {
      $schema: './config-schema.json',
      description: 'npm-audit-excel configuration file',
      version: '1.0.0',
      ...DEFAULT_CONFIG,
    };

    const configJson = JSON.stringify(sampleConfig, null, 2);
    await fs.writeFile(outputPath, configJson, 'utf-8');
  }

  /**
   * Validates configuration object
   */
  private validateConfig(config: unknown): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('Configuration must be an object');
    }

    const configObj = config as Record<string, unknown>;

    // Validate colors are in ARGB format
    if (configObj.colors) {
      this.validateColors(configObj.colors);
    }

    // Validate column configuration
    if (configObj.columns) {
      this.validateColumns(configObj.columns);
    }

    // Validate scoring configuration
    if (configObj.scoring) {
      this.validateScoring(configObj.scoring);
    }
  }

  private validateColors(colors: unknown): void {
    const colorRegex = /^FF[0-9A-Fa-f]{6}$/;

    const checkColorValue = (value: unknown, path: string) => {
      if (typeof value === 'string' && !colorRegex.test(value)) {
        throw new Error(`Invalid color format at ${path}. Expected ARGB format (e.g., 'FFFF0000')`);
      }
    };

    const traverseColors = (obj: Record<string, unknown>, currentPath = 'colors') => {
      for (const [key, value] of Object.entries(obj)) {
        const path = `${currentPath}.${key}`;
        if (typeof value === 'object' && value !== null) {
          traverseColors(value as Record<string, unknown>, path);
        } else {
          checkColorValue(value, path);
        }
      }
    };

    if (typeof colors === 'object' && colors !== null) {
      traverseColors(colors as Record<string, unknown>);
    }
  }

  private getValidColumnNames(): string[] {
    return [
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
    ];
  }

  private validateColumnVisibility(visible: Record<string, unknown>): void {
    const validColumns = this.getValidColumnNames();
    for (const column of Object.keys(visible)) {
      if (!validColumns.includes(column)) {
        throw new Error(`Invalid column name: ${column}`);
      }
    }
  }

  private validateColumnWidths(widths: Record<string, unknown>): void {
    for (const [column, width] of Object.entries(widths)) {
      if (typeof width !== 'number' || width <= 0) {
        throw new Error(`Invalid width for column ${column}: must be a positive number`);
      }
    }
  }

  private validateColumns(columns: unknown): void {
    const columnsObj = columns as Record<string, unknown>;

    if (columnsObj.visible) {
      this.validateColumnVisibility(columnsObj.visible as Record<string, unknown>);
    }

    if (columnsObj.widths) {
      this.validateColumnWidths(columnsObj.widths as Record<string, unknown>);
    }
  }

  private validateSeverityWeights(severityWeights: Record<string, unknown>): void {
    for (const [severity, weight] of Object.entries(severityWeights)) {
      if (typeof weight !== 'number' || weight < 0) {
        throw new Error(`Invalid severity weight for ${severity}: must be a non-negative number`);
      }
    }
  }

  private validateCvssThreshold(value: unknown, thresholdName: string): void {
    if (typeof value === 'number' && (value < 0 || value > 10)) {
      throw new Error(`${thresholdName} threshold must be between 0 and 10`);
    }
  }

  private validateThresholds(thresholds: Record<string, unknown>): void {
    this.validateCvssThreshold(thresholds.highCvss, 'High CVSS');
    this.validateCvssThreshold(thresholds.mediumCvss, 'Medium CVSS');
  }

  private validateScoring(scoring: unknown): void {
    const scoringObj = scoring as Record<string, unknown>;

    if (scoringObj.severityWeights) {
      this.validateSeverityWeights(scoringObj.severityWeights as Record<string, unknown>);
    }

    if (scoringObj.thresholds) {
      this.validateThresholds(scoringObj.thresholds as Record<string, unknown>);
    }
  }

  /**
   * Gets current configuration
   */
  public getConfig(): ReportConfig {
    return this.config;
  }

  /**
   * Updates configuration
   */
  public updateConfig(updates: Partial<ReportConfig>): void {
    this.config = mergeConfig({ ...this.config, ...updates });
  }

  /**
   * Resets configuration to default
   */
  public resetToDefault(): void {
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Gets available presets
   */
  public getAvailablePresets(): string[] {
    return Object.keys(PRESET_CONFIGS);
  }

  /**
   * Applies a preset configuration
   */
  public applyPreset(presetName: keyof typeof PRESET_CONFIGS): void {
    if (!PRESET_CONFIGS[presetName]) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    const presetConfig = PRESET_CONFIGS[presetName]();
    this.config = mergeConfig({ ...this.config, ...presetConfig });
  }
}
