import type {
  ConfigValidationResult,
  ValidationError,
  SeverityLevel,
  PriorityCategory,
  LanguageCode,
  ColumnName,
  ColorConfig,
  ColumnConfig,
  JsonParseResult,
  ColorValidation,
  ColumnValidation,
} from './index';

// Utility functions for validation
export const createValidationError = (path: string, message: string): ValidationError => ({
  path,
  message,
});

export const createValidationResult = (
  isValid: boolean,
  errors: readonly ValidationError[] = []
): ConfigValidationResult => ({
  isValid,
  errors,
});

// Type guard implementations
export const isSeverityLevel = (value: string): value is SeverityLevel =>
  ['critical', 'high', 'moderate', 'low', 'info'].includes(value);

export const isPriorityCategory = (value: string): value is PriorityCategory =>
  ['URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(value);

export const isLanguageCode = (value: string): value is LanguageCode =>
  ['en', 'es'].includes(value);

export const isColumnName = (value: string): value is ColumnName =>
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
  ].includes(value);

// Hex color validation
export const isValidHexColor = (color: string): boolean => {
  if (typeof color !== 'string') return false;
  const hexRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexRegex.test(color) || hexRegex.test(color.replace(/^#/, ''));
};

// JSON parsing with type safety
export const safeJsonParse = <T>(jsonString: string): JsonParseResult<T> => {
  try {
    const data = JSON.parse(jsonString) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    };
  }
};

// Object type checking utilities
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const hasProperty = <T extends Record<string, unknown>>(
  obj: T,
  property: string | number | symbol
): property is keyof T => Object.hasOwn(obj, property);

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

// Color configuration validation
export const createColorValidation = (): ColorValidation => ({
  isValidHexColor,

  isValidColorConfig: (config: Partial<ColorConfig>): ConfigValidationResult => {
    const errors: ValidationError[] = [];

    if (!isObject(config)) {
      return createValidationResult(false, [
        createValidationError('colors', 'Color configuration must be an object'),
      ]);
    }

    // Validate priority colors
    if (hasProperty(config, 'priority') && config.priority) {
      const priority = config.priority;
      if (!isObject(priority)) {
        errors.push(createValidationError('colors.priority', 'Priority colors must be an object'));
      } else {
        const priorityColors = ['urgent', 'high', 'medium', 'low'] as const;
        for (const colorKey of priorityColors) {
          if (hasProperty(priority, colorKey) && priority[colorKey]) {
            if (!isString(priority[colorKey]) || !isValidHexColor(priority[colorKey] as string)) {
              errors.push(
                createValidationError(
                  `colors.priority.${colorKey}`,
                  `Invalid hex color: ${priority[colorKey]}`
                )
              );
            }
          }
        }
      }
    }

    // Validate severity colors
    if (hasProperty(config, 'severity') && config.severity) {
      const severity = config.severity;
      if (!isObject(severity)) {
        errors.push(createValidationError('colors.severity', 'Severity colors must be an object'));
      } else {
        const severityColors = ['critical', 'high', 'moderate', 'low'] as const;
        for (const colorKey of severityColors) {
          if (hasProperty(severity, colorKey) && severity[colorKey]) {
            if (!isString(severity[colorKey]) || !isValidHexColor(severity[colorKey] as string)) {
              errors.push(
                createValidationError(
                  `colors.severity.${colorKey}`,
                  `Invalid hex color: ${severity[colorKey]}`
                )
              );
            }
          }
        }
      }
    }

    return createValidationResult(errors.length === 0, errors);
  },
});

// Column configuration validation
export const createColumnValidation = (): ColumnValidation => ({
  isValidColumnName: isColumnName,

  isValidColumnConfig: (config: Partial<ColumnConfig>): ConfigValidationResult => {
    const errors: ValidationError[] = [];

    if (!isObject(config)) {
      return createValidationResult(false, [
        createValidationError('columns', 'Column configuration must be an object'),
      ]);
    }

    // Validate visible columns
    if (hasProperty(config, 'visible') && config.visible) {
      const visible = config.visible;
      if (!isObject(visible)) {
        errors.push(createValidationError('columns.visible', 'Visible columns must be an object'));
      } else {
        for (const [key, value] of Object.entries(visible)) {
          if (!isColumnName(key)) {
            errors.push(
              createValidationError(`columns.visible.${key}`, `Invalid column name: ${key}`)
            );
          }
          if (!isBoolean(value)) {
            errors.push(
              createValidationError(
                `columns.visible.${key}`,
                `Column visibility must be boolean, got: ${typeof value}`
              )
            );
          }
        }
      }
    }

    // Validate column order
    if (hasProperty(config, 'order') && config.order) {
      const order = config.order;
      if (!Array.isArray(order)) {
        errors.push(createValidationError('columns.order', 'Column order must be an array'));
      } else {
        for (let i = 0; i < order.length; i++) {
          const column = order[i];
          if (!isString(column) || !isColumnName(column)) {
            errors.push(
              createValidationError(`columns.order[${i}]`, `Invalid column name: ${column}`)
            );
          }
        }
      }
    }

    // Validate column widths
    if (hasProperty(config, 'widths') && config.widths) {
      const widths = config.widths;
      if (!isObject(widths)) {
        errors.push(createValidationError('columns.widths', 'Column widths must be an object'));
      } else {
        for (const [key, value] of Object.entries(widths)) {
          if (!isColumnName(key)) {
            errors.push(
              createValidationError(`columns.widths.${key}`, `Invalid column name: ${key}`)
            );
          }
          if (!isNumber(value) || value <= 0) {
            errors.push(
              createValidationError(
                `columns.widths.${key}`,
                `Column width must be positive number, got: ${value}`
              )
            );
          }
        }
      }
    }

    return createValidationResult(errors.length === 0, errors);
  },
});

// Export validation instances
export const colorValidation = createColorValidation();
export const columnValidation = createColumnValidation();
