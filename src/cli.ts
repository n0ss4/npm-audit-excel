#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { AuditReport, ReportOptions, ProcessedVulnerability } from './types';
import { VulnerabilityProcessor } from './core/VulnerabilityProcessor';
import { ExcelReportGenerator } from './core/ExcelReportGenerator';
import { initI18n, t } from './i18n';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('npm-audit-excel')
  .description('Generate Excel reports from npm audit with prioritization')
  .version('1.0.0')
  .option('-i, --input <file>', 'input audit JSON file (default: run npm audit)', '')
  .option('-o, --output <file>', 'output Excel file', 'npm-audit-report.xlsx')
  .option('-l, --language <lang>', 'report language (en, es)', 'en')
  .option('-f, --format <format>', 'output format (excel)', 'excel')
  .option('-v, --verbose', 'verbose output', false)
  .parse(process.argv);

async function getAuditData(options: ReportOptions): Promise<AuditReport> {
  if (options.input) {
    const fileContent = await fs.readFile(options.input, 'utf-8');
    return JSON.parse(fileContent);
  }

  try {
    const auditOutput = execSync('npm audit --json', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(auditOutput);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'stdout' in error && typeof error.stdout === 'string') {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

async function generateReport(
  vulnerabilities: ProcessedVulnerability[], 
  metadata: AuditReport['metadata'], 
  outputPath: string
): Promise<void> {
  const generator = new ExcelReportGenerator();
  await generator.generateReport(vulnerabilities, metadata, outputPath);
}

function printSummary(
  options: ReportOptions, 
  vulnerabilities: ProcessedVulnerability[], 
  metadata: AuditReport['metadata']
): void {
  if (!options.verbose) return;

  console.log('\n' + chalk.bold('Summary:'));
  console.log(chalk.red(`  Critical: ${metadata.vulnerabilities.critical}`));
  console.log(chalk.yellow(`  High: ${metadata.vulnerabilities.high}`));
  console.log(chalk.blue(`  Moderate: ${metadata.vulnerabilities.moderate}`));
  console.log(chalk.gray(`  Low: ${metadata.vulnerabilities.low}`));
  
  const urgent = vulnerabilities.filter(v => v.priorityCategory === 'URGENT').length;
  if (urgent > 0) {
    console.log('\n' + chalk.bold.red(`⚠️  ${urgent} URGENT vulnerabilities require immediate attention!`));
  }
}

function handleError(error: unknown, options: ReportOptions): void {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT' && 'path' in error) {
    console.error(chalk.red(`${t('cli.fileNotFound')}: ${error.path}`));
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
    await initI18n(options.language);

    spinner.start(chalk.blue(t('cli.generatingReport')));
    const auditData = await getAuditData(options);

    const processor = new VulnerabilityProcessor();
    const vulnerabilities = processor.processAuditReport(auditData);

    if (options.verbose) {
      spinner.info(chalk.gray(`Found ${vulnerabilities.length} vulnerabilities`));
    }

    spinner.text = chalk.blue(t('cli.writingFile'));
    const outputPath = path.resolve(options.output || 'npm-audit-report.xlsx');
    
    await generateReport(vulnerabilities, auditData.metadata, outputPath);

    spinner.succeed(chalk.green(`${t('cli.reportGenerated')}: ${outputPath}`));

    printSummary(options, vulnerabilities, auditData.metadata);

  } catch (error: unknown) {
    spinner.fail(chalk.red(t('cli.error')));
    handleError(error, options);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
});
