import fs from 'node:fs/promises';
import path from 'node:path';
import { DEFAULTS } from './constants';
import { DEFAULT_CONFIG, mergeConfig, PRESET_CONFIGS, type ReportConfig } from './reportConfig';
import type {
  PresetName,
  ConfigValidationResult,
  ConfigError,
  DeepPartial,
  ColorConfig,
  ColumnConfig,
  SeverityLevel,
} from '../types';
import {
  safeJsonParse,
  isObject,
  hasProperty,
  colorValidation,
  columnValidation,
  createValidationResult,
  createValidationError,
} from '../types/validation';

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
    options: { configFile?: string; preset?: PresetName; inlineConfig?: Partial<ReportConfig> } = {}
  ): Promise<ReportConfig> {
    let config = DEFAULT_CONFIG;

    // Load from preset first
    if (options.preset && hasProperty(PRESET_CONFIGS, options.preset)) {
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
      const parseResult = safeJsonParse<DeepPartial<ReportConfig>>(fileContent);

      if (!parseResult.success || !parseResult.data) {
        const error = new Error(`Invalid JSON in config file: ${parseResult.error}`) as ConfigError;
        error.code = 'INVALID_JSON';
        throw error;
      }

      const userConfig = parseResult.data;
      this.validateConfig(userConfig);
      return userConfig as Partial<ReportConfig>;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ENOENT')) {
          const configError = new Error(`Config file not found: ${fullPath}`) as ConfigError;
          configError.code = 'FILE_NOT_FOUND';
          throw configError;
        }
        if ('code' in error) {
          throw error;
        }
      }
      const configError = new Error(`Failed to load config: ${error}`) as ConfigError;
      configError.code = 'CONFIG_LOAD_ERROR';
      throw configError;
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
   * Validates configuration object with type safety
   */
  private validateConfig(config: DeepPartial<ReportConfig>): ConfigValidationResult {
    const errors: ConfigError[] = [];

    if (!isObject(config)) {
      const error = new Error('Configuration must be an object') as ConfigError;
      error.code = 'INVALID_CONFIG_TYPE';
      throw error;
    }

    // Validate colors
    if (hasProperty(config, 'colors') && config.colors) {
      const colorResult = colorValidation.isValidColorConfig(config.colors as Partial<ColorConfig>);
      if (!colorResult.isValid) {
        errors.push(
          ...colorResult.errors.map(e => {
            const error = new Error(e.message) as ConfigError;
            error.code = 'INVALID_COLOR';
            error.path = e.path;
            return error;
          })
        );
      }
    }

    // Validate columns
    if (hasProperty(config, 'columns') && config.columns) {
      const columnResult = columnValidation.isValidColumnConfig(
        config.columns as Partial<ColumnConfig>
      );
      if (!columnResult.isValid) {
        errors.push(
          ...columnResult.errors.map(e => {
            const error = new Error(e.message) as ConfigError;
            error.code = 'INVALID_COLUMN';
            error.path = e.path;
            return error;
          })
        );
      }
    }

    // Validate scoring
    if (hasProperty(config, 'scoring') && config.scoring) {
      const scoringResult = this.validateScoring(config.scoring);
      if (!scoringResult.isValid) {
        errors.push(
          ...scoringResult.errors.map(e => {
            const error = new Error(e.message) as ConfigError;
            error.code = 'INVALID_SCORING';
            error.path = e.path;
            return error;
          })
        );
      }
    }

    if (errors.length > 0) {
      const mainError = new Error(
        `Configuration validation failed: ${errors.length} errors`
      ) as ConfigError;
      mainError.code = 'VALIDATION_FAILED';
      throw mainError;
    }

    return createValidationResult(true);
  }

  // Color validation now handled by validation module

  // Column validation now handled by validation module

  private validateScoring(scoring: DeepPartial<ReportConfig['scoring']>): ConfigValidationResult {
    const errors = [];

    if (!isObject(scoring)) {
      return createValidationResult(false, [
        createValidationError('scoring', 'Scoring configuration must be an object'),
      ]);
    }

    // Validate severity weights
    if (hasProperty(scoring, 'severityWeights') && scoring.severityWeights) {
      const severityWeights = scoring.severityWeights;
      if (!isObject(severityWeights)) {
        errors.push(
          createValidationError('scoring.severityWeights', 'Severity weights must be an object')
        );
      } else {
        const validSeverities = ['critical', 'high', 'moderate', 'low', 'info'] as const;
        for (const [severity, weight] of Object.entries(severityWeights)) {
          if (!validSeverities.includes(severity as SeverityLevel)) {
            errors.push(
              createValidationError(
                `scoring.severityWeights.${severity}`,
                `Invalid severity level: ${severity}`
              )
            );
          }
          if (typeof weight !== 'number' || weight < 0) {
            errors.push(
              createValidationError(
                `scoring.severityWeights.${severity}`,
                `Severity weight must be a non-negative number, got: ${weight}`
              )
            );
          }
        }
      }
    }

    // Validate thresholds
    if (hasProperty(scoring, 'thresholds') && scoring.thresholds) {
      const thresholds = scoring.thresholds;
      if (!isObject(thresholds)) {
        errors.push(createValidationError('scoring.thresholds', 'Thresholds must be an object'));
      } else {
        const cvssThresholds = ['highCvss', 'mediumCvss'] as const;
        for (const thresholdKey of cvssThresholds) {
          if (hasProperty(thresholds, thresholdKey)) {
            const value = thresholds[thresholdKey];
            if (typeof value === 'number' && (value < 0 || value > 10)) {
              errors.push(
                createValidationError(
                  `scoring.thresholds.${thresholdKey}`,
                  `CVSS threshold must be between 0 and 10, got: ${value}`
                )
              );
            }
          }
        }
      }
    }

    return createValidationResult(errors.length === 0, errors);
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
   * Gets available presets with type safety
   */
  public getAvailablePresets(): readonly PresetName[] {
    return Object.keys(PRESET_CONFIGS) as PresetName[];
  }

  /**
   * Applies a preset configuration with type safety
   */
  public applyPreset(presetName: PresetName): void {
    if (!hasProperty(PRESET_CONFIGS, presetName)) {
      const error = new Error(`Unknown preset: ${presetName}`) as ConfigError;
      error.code = 'UNKNOWN_PRESET';
      throw error;
    }

    const presetConfig = PRESET_CONFIGS[presetName]();
    this.validateConfig(presetConfig);
    this.config = mergeConfig({ ...this.config, ...presetConfig });
  }
}
