#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { ConfigManager, DEFAULT_CONFIG, DEFAULTS, EXIT_CODES, type ReportConfig } from './config';
import { ExcelReportGenerator } from './core/ExcelReportGenerator';
import { VulnerabilityProcessor } from './core/VulnerabilityProcessor';
import { initI18n, t } from './i18n';
import type {
  AuditReport,
  ProcessedVulnerability,
  ReportOptions,
  ColumnName,
  ConfigError,
  ProcessingError,
  VisibleColumns,
} from './types';
import { safeJsonParse, isColumnName, colorValidation } from './types/validation';

const program = new Command();

program
  .name('npm-audit-excel')
  .description('Generate Excel reports from npm audit with prioritization')
  .version('1.0.0')
  .option('-i, --input <file>', 'input audit JSON file (default: run npm audit)', '')
  .option('-o, --output <file>', 'output Excel file', DEFAULTS.OUTPUT_FILENAME)
  .option('-l, --language <lang>', 'report language (en, es)', DEFAULTS.LANGUAGE)
  .option('-f, --format <format>', 'output format (excel)', DEFAULTS.FORMAT)
  .option('-v, --verbose', 'verbose output', DEFAULTS.VERBOSE)
  .option('-c, --config <file>', 'configuration file path')
  .option(
    '-p, --preset <preset>',
    'use preset configuration (minimal, developer, security, highContrast)'
  )
  .option('--show-columns <columns>', 'comma-separated list of columns to show (overrides config)')
  .option('--hide-columns <columns>', 'comma-separated list of columns to hide (overrides config)')
  .option('--colors <scheme>', 'color scheme (default, highContrast, or JSON string)')
  .option('--generate-config [file]', 'generate sample configuration file')
  .option('--list-presets', 'list available configuration presets')
  .parse(process.argv);

async function getAuditData(options: ReportOptions): Promise<AuditReport> {
  if (options.input) {
    const fileContent = await fs.readFile(options.input, 'utf-8');
    return JSON.parse(fileContent) as AuditReport;
  }

  try {
    const auditOutput = execSync('npm audit --json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(auditOutput) as AuditReport;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      const parseResult = safeJsonParse<AuditReport>(error.stdout);
      if (parseResult.success && parseResult.data) {
        return parseResult.data;
      }
    }
    const processingError = new Error(`Failed to run npm audit: ${error}`) as ProcessingError;
    processingError.step = 'npm_audit';
    throw processingError;
  }
}

async function generateReport(
  vulnerabilities: ProcessedVulnerability[],
  metadata: AuditReport['metadata'],
  outputPath: string,
  config: ReportConfig
): Promise<void> {
  const generator = new ExcelReportGenerator(config);
  await generator.generateReport(vulnerabilities, metadata, outputPath);
}

function validateColumnName(columnName: string): columnName is ColumnName {
  if (isColumnName(columnName)) {
    return true;
  }
  console.warn(chalk.yellow(`Warning: Unknown column '${columnName}' ignored`));
  return false;
}

function parseColumnsToShow(showColumns: string): Partial<Record<ColumnName, boolean>> {
  const columns = showColumns.split(',').map(c => c.trim());
  const visible: Partial<Record<ColumnName, boolean>> = {};

  // Set all columns to false first
  for (const col of Object.keys(DEFAULT_CONFIG.columns.visible) as ColumnName[]) {
    visible[col] = false;
  }

  // Enable requested columns
  for (const col of columns) {
    if (validateColumnName(col)) {
      visible[col] = true;
    }
  }

  return visible;
}

function parseColumnsToHide(
  hideColumns: string,
  currentVisible?: Partial<Record<ColumnName, boolean>>
): Partial<Record<ColumnName, boolean>> {
  const columns = hideColumns.split(',').map(c => c.trim());
  const visible = currentVisible || { ...DEFAULT_CONFIG.columns.visible };

  for (const col of columns) {
    if (validateColumnName(col)) {
      visible[col] = false;
    }
  }

  return visible;
}

function parseColumnOptions(showColumns?: string, hideColumns?: string): Partial<ReportConfig> {
  let visible: Partial<Record<ColumnName, boolean>> | undefined;

  if (showColumns) {
    visible = parseColumnsToShow(showColumns);
  }

  if (hideColumns) {
    visible = parseColumnsToHide(hideColumns, visible);
  }

  return visible
    ? {
        columns: {
          visible: visible as VisibleColumns,
          order: DEFAULT_CONFIG.columns.order,
          widths: DEFAULT_CONFIG.columns.widths,
        },
      }
    : {};
}

function parseColorOptions(colorScheme?: string): Partial<ReportConfig> {
  if (!colorScheme) return {};

  if (colorScheme === 'highContrast') {
    return {
      colors: {
        priority: {
          urgent: 'FF000000',
          high: 'FF800000',
          medium: 'FF808000',
          low: 'FF008000',
        },
        severity: {
          critical: 'FF000000',
          high: 'FF800000',
          moderate: 'FF808000',
          low: 'FF008000',
        },
      },
    } as Partial<ReportConfig>;
  }

  const parseResult = safeJsonParse<Record<string, string>>(colorScheme);
  if (!parseResult.success) {
    console.warn(chalk.yellow(`Warning: Invalid color scheme JSON ignored: ${parseResult.error}`));
    return {};
  }

  const colorResult = colorValidation.isValidColorConfig(parseResult.data || {});
  if (!colorResult.isValid) {
    console.warn(
      chalk.yellow(
        `Warning: Invalid color configuration: ${colorResult.errors.map(e => e.message).join(', ')}`
      )
    );
    return {};
  }

  return { colors: parseResult.data } as Partial<ReportConfig>;
}

async function handleSpecialCommands(options: ReportOptions): Promise<boolean> {
  const configManager = ConfigManager.getInstance();

  if (options.listPresets) {
    console.log(chalk.bold('Available configuration presets:'));
    const presets = configManager.getAvailablePresets();
    presets.forEach(preset => {
      console.log(chalk.blue(`  ${preset}`));
    });
    console.log('\nUse with: --preset <preset-name>');
    return true;
  }

  if (options.generateConfig !== undefined) {
    const configPath =
      typeof options.generateConfig === 'string'
        ? options.generateConfig
        : DEFAULTS.CONFIG_FILENAME;

    try {
      await configManager.generateSampleConfig(configPath);
      console.log(chalk.green(`Configuration file generated: ${configPath}`));
      console.log(chalk.gray('Edit this file to customize your reports.'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error generating config: ${errorMessage}`));
      process.exit(EXIT_CODES.ERROR);
    }
    return true;
  }

  return false;
}

function printSummary(
  options: ReportOptions,
  vulnerabilities: ProcessedVulnerability[],
  metadata: AuditReport['metadata']
): void {
  if (!options.verbose) return;

  console.log(`\n${chalk.bold('Summary:')}`);
  console.log(chalk.red(`  Critical: ${metadata.vulnerabilities.critical}`));
  console.log(chalk.yellow(`  High: ${metadata.vulnerabilities.high}`));
  console.log(chalk.blue(`  Moderate: ${metadata.vulnerabilities.moderate}`));
  console.log(chalk.gray(`  Low: ${metadata.vulnerabilities.low}`));

  const urgent = vulnerabilities.filter(v => v.priorityCategory === 'URGENT').length;
  if (urgent > 0) {
    console.log(
      `\n${chalk.bold.red(`⚠️  ${urgent} URGENT vulnerabilities require immediate attention!`)}`
    );
  }
}

function handleError(error: Error | ConfigError | ProcessingError, options: ReportOptions): void {
  if ('code' in error) {
    const configError = error as ConfigError;
    switch (configError.code) {
      case 'FILE_NOT_FOUND':
        console.error(chalk.red(`${t('cli.fileNotFound')}: ${configError.path || 'unknown'}`));
        break;
      case 'INVALID_JSON':
        console.error(chalk.red(t('cli.invalidJson')));
        break;
      case 'UNKNOWN_PRESET':
        console.error(chalk.red(`Unknown preset: ${configError.message.split(': ')[1]}`));
        break;
      case 'VALIDATION_FAILED':
        console.error(chalk.red(`Configuration validation failed: ${configError.message}`));
        break;
      default:
        console.error(chalk.red(configError.message));
    }
  } else {
    console.error(chalk.red(error.message));
  }

  if (options.verbose && error.stack) {
    console.error(error.stack);
  }
}

async function main() {
  const options = program.opts<ReportOptions>();
  const spinner = ora();

  try {
    if (await handleSpecialCommands(options)) {
      return;
    }

    await initI18n(options.language);

    const configManager = ConfigManager.getInstance();

    let inlineConfig: Partial<ReportConfig> = {};

    const columnConfig = parseColumnOptions(options.showColumns, options.hideColumns);
    if (Object.keys(columnConfig).length > 0) {
      inlineConfig = { ...inlineConfig, ...columnConfig };
    }

    const colorConfig = parseColorOptions(options.colors);
    if (Object.keys(colorConfig).length > 0) {
      inlineConfig = { ...inlineConfig, ...colorConfig };
    }

    const config = await configManager.loadConfig({
      configFile: options.config,
      preset: options.preset,
      inlineConfig: Object.keys(inlineConfig).length > 0 ? inlineConfig : undefined,
    });

    if (options.verbose) {
      console.log(chalk.gray('Configuration loaded:'));
      console.log(chalk.gray(`  Preset: ${options.preset || 'default'}`));
      console.log(chalk.gray(`  Config file: ${options.config || 'none'}`));
      const visibleColumns = Object.entries(config.columns.visible)
        .filter(([, visible]) => visible)
        .map(([col]) => col)
        .join(', ');
      console.log(chalk.gray(`  Visible columns: ${visibleColumns}`));
    }

    spinner.start(chalk.blue(t('cli.generatingReport')));
    const auditData = await getAuditData(options);

    const processor = new VulnerabilityProcessor(config);
    const vulnerabilities = processor.processAuditReport(auditData);

    if (options.verbose) {
      spinner.info(chalk.gray(`Found ${vulnerabilities.length} vulnerabilities`));
    }

    spinner.text = chalk.blue(t('cli.writingFile'));
    const outputPath = path.resolve(options.output || DEFAULTS.OUTPUT_FILENAME);

    await generateReport(vulnerabilities, auditData.metadata, outputPath, config);

    spinner.succeed(chalk.green(`${t('cli.reportGenerated')}: ${outputPath}`));

    printSummary(options, vulnerabilities, auditData.metadata);
  } catch (error) {
    spinner.fail(chalk.red(t('cli.error')));
    const typedError = error instanceof Error ? error : new Error(String(error));
    handleError(typedError, options);
    process.exit(EXIT_CODES.ERROR);
  }
}

main().catch(error => {
  const typedError = error instanceof Error ? error : new Error(String(error));
  console.error(chalk.red(typedError.message));
  process.exit(EXIT_CODES.ERROR);
});
