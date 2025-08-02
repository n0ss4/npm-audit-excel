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
import type { AuditReport, ProcessedVulnerability, ReportOptions } from './types';

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
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      return JSON.parse(error.stdout) as AuditReport;
    }
    throw error;
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

function validateColumnName(columnName: string): boolean {
  if (columnName in DEFAULT_CONFIG.columns.visible) {
    return true;
  }
  console.warn(chalk.yellow(`Warning: Unknown column '${columnName}' ignored`));
  return false;
}

function parseColumnsToShow(showColumns: string): Record<string, boolean> {
  const columns = showColumns.split(',').map(c => c.trim());
  const visible: Record<string, boolean> = {};

  for (const col of Object.keys(DEFAULT_CONFIG.columns.visible)) {
    visible[col] = false;
  }

  for (const col of columns) {
    if (validateColumnName(col)) {
      visible[col] = true;
    }
  }

  return visible;
}

function parseColumnsToHide(
  hideColumns: string,
  currentVisible?: Record<string, boolean>
): Record<string, boolean> {
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
  let visible: Record<string, boolean> | undefined;

  if (showColumns) {
    visible = parseColumnsToShow(showColumns);
  }

  if (hideColumns) {
    visible = parseColumnsToHide(hideColumns, visible);
  }

  return visible ? ({ columns: { visible } } as unknown as Partial<ReportConfig>) : {};
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
    } as unknown as Partial<ReportConfig>;
  }

  try {
    const parsedColors = JSON.parse(colorScheme) as Record<string, unknown>;
    return { colors: parsedColors } as unknown as Partial<ReportConfig>;
  } catch (_error) {
    console.warn(chalk.yellow(`Warning: Invalid color scheme JSON ignored`));
    return {};
  }
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

function handleError(error: unknown, options: ReportOptions): void {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'ENOENT' &&
    'path' in error
  ) {
    console.error(chalk.red(`${t('cli.fileNotFound')}: ${String(error.path)}`));
  } else if (error instanceof SyntaxError) {
    console.error(chalk.red(t('cli.invalidJson')));
  } else {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(message));
    if (options.verbose && error instanceof Error) {
      console.error(error.stack);
    }
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
  } catch (error: unknown) {
    spinner.fail(chalk.red(t('cli.error')));
    handleError(error, options);
    process.exit(EXIT_CODES.ERROR);
  }
}

main().catch((error: unknown) => {
  console.error(error);
});
