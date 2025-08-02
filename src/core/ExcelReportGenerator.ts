import ExcelJS from 'exceljs';
import type { ReportConfig } from '../config';
import { t } from '../i18n';
import type { AuditReport, ProcessedVulnerability, CellValue } from '../types';

export class ExcelReportGenerator {
  private readonly workbook: ExcelJS.Workbook;
  private readonly worksheet: ExcelJS.Worksheet;
  private readonly config: ReportConfig;

  constructor(config: ReportConfig) {
    this.config = config;
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet(config.output.worksheetName || t('title'));
  }

  async generateReport(
    vulnerabilities: ProcessedVulnerability[],
    metadata: AuditReport['metadata'],
    outputPath: string
  ): Promise<void> {
    if (this.config.output.includeTitle) {
      this.addTitle();
    }

    if (this.config.output.includeSummary) {
      this.addSummary(vulnerabilities.length, metadata);
    }

    this.addHeaders();
    this.addData(vulnerabilities);
    this.applyStyles();
    this.adjustColumnWidths();

    await this.workbook.xlsx.writeFile(outputPath);
  }

  private addTitle(): void {
    const timestamp = this.config.output.includeTimestamp
      ? ` - ${new Date().toLocaleString()}`
      : '';
    const titleRow = this.worksheet.addRow([`${t('title')}${timestamp}`]);

    const visibleColumnsCount = Object.values(this.config.columns.visible).filter(Boolean).length;
    const lastColumn = String.fromCharCode(64 + visibleColumnsCount); // A=65, so 64+1=A

    this.worksheet.mergeCells(`A1:${lastColumn}1`);
    titleRow.getCell(1).font = { size: this.config.layout.fontSizes.title, bold: true };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = this.config.layout.rowHeights.title;
  }

  private addSummary(total: number, metadata: AuditReport['metadata']): void {
    const summary = t('summary', {
      total,
      critical: metadata.vulnerabilities.critical,
      high: metadata.vulnerabilities.high,
      moderate: metadata.vulnerabilities.moderate,
      low: metadata.vulnerabilities.low,
    });

    const summaryRow = this.worksheet.addRow([summary]);
    this.worksheet.mergeCells('A3:P3');
    summaryRow.getCell(1).font = { size: 12, italic: true };
    summaryRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    this.worksheet.addRow([]);
  }

  private addHeaders(): void {
    const headerMapping = {
      priority: t('headers.priority'),
      score: t('headers.score'),
      package: t('headers.package'),
      severity: t('headers.severity'),
      cvss: t('headers.cvss'),
      dependencyType: t('headers.dependencyType'),
      fixAvailable: t('headers.fixAvailable'),
      fixVersion: t('headers.fixVersion'),
      majorChange: t('headers.majorChange'),
      vulnerability: t('headers.vulnerability'),
      cwe: t('headers.cwe'),
      affectedPackages: t('headers.affectedPackages'),
      vulnerableRange: t('headers.vulnerableRange'),
      fixCommand: t('headers.fixCommand'),
      advisoryUrl: t('headers.advisoryUrl'),
      notes: t('headers.notes'),
    };

    const headers: string[] = [];

    for (const column of this.config.columns.order) {
      if (this.config.columns.visible[column]) {
        const customHeader = this.config.columns.customHeaders?.[column];
        headers.push(customHeader || headerMapping[column] || column);
      }
    }

    const headerRow = this.worksheet.addRow(headers);

    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: this.config.colors.text.white } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.config.colors.background.header },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    headerRow.height = this.config.layout.rowHeights.header;
  }

  private createDataMapping(vuln: ProcessedVulnerability): Record<string, CellValue> {
    const notes = this.generateNotes(vuln);

    return {
      priority: t(`priority.${vuln.priorityCategory.toLowerCase()}`),
      score: vuln.priorityScore,
      package: vuln.package,
      severity: t(`severity.${vuln.severity}`),
      cvss: vuln.cvssScore > 0 ? vuln.cvssScore : '-',
      dependencyType: vuln.isDirect ? t('dependencyType.direct') : t('dependencyType.indirect'),
      fixAvailable: vuln.fixAvailable ? t('boolean.available') : t('boolean.notAvailable'),
      fixVersion: vuln.fixVersion,
      majorChange: vuln.isSemVerMajor ? t('boolean.yes') : t('boolean.no'),
      vulnerability: this.truncate(
        vuln.vulnerabilityTitle,
        this.config.layout.textLimits.vulnerabilityTitle
      ),
      cwe: vuln.cwe,
      affectedPackages: vuln.effectsCount,
      vulnerableRange: vuln.range,
      fixCommand: vuln.fixCommand || t('commands.noFixAvailable'),
      advisoryUrl: vuln.advisoryUrl,
      notes,
    };
  }

  private createRowData(dataMapping: Record<string, CellValue>): readonly CellValue[] {
    const rowData: CellValue[] = [];
    for (const column of this.config.columns.order) {
      if (this.config.columns.visible[column]) {
        rowData.push(dataMapping[column]);
      }
    }
    return rowData;
  }

  private applyCellStyle(cell: ExcelJS.Cell, column: string, vuln: ProcessedVulnerability): void {
    switch (column) {
      case 'priority':
        this.applyPriorityStyle(cell, vuln.priorityCategory);
        break;
      case 'score':
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        break;
      case 'severity':
        this.applySeverityStyle(cell, vuln.severity);
        break;
      case 'cvss':
        this.applyCvssStyle(cell, vuln.cvssScore);
        break;
      case 'fixAvailable':
        this.applyFixAvailableStyle(cell, vuln.fixAvailable);
        break;
      default:
        cell.alignment = { vertical: 'middle', wrapText: true };
    }
  }

  private applyBorder(cell: ExcelJS.Cell): void {
    cell.border = {
      top: { style: 'thin', color: { argb: this.config.colors.border } },
      left: { style: 'thin', color: { argb: this.config.colors.border } },
      bottom: { style: 'thin', color: { argb: this.config.colors.border } },
      right: { style: 'thin', color: { argb: this.config.colors.border } },
    };
  }

  private styleRow(row: ExcelJS.Row, vuln: ProcessedVulnerability): void {
    let colIndex = 1;
    for (const column of this.config.columns.order) {
      if (this.config.columns.visible[column]) {
        const cell = row.getCell(colIndex);
        this.applyCellStyle(cell, column, vuln);
        this.applyBorder(cell);
        colIndex++;
      }
    }
  }

  private applyAlternatingRowColor(row: ExcelJS.Row): void {
    let colIndex = 1;
    for (const column of this.config.columns.order) {
      if (this.config.columns.visible[column]) {
        const cell = row.getCell(colIndex);
        if (column !== 'priority' && column !== 'severity') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.config.colors.background.alternatingRow },
          };
        }
        colIndex++;
      }
    }
  }

  private addData(vulnerabilities: ProcessedVulnerability[]): void {
    vulnerabilities.forEach((vuln, index) => {
      const dataMapping = this.createDataMapping(vuln);
      const rowData = this.createRowData(dataMapping);
      const row = this.worksheet.addRow(rowData);

      this.styleRow(row, vuln);

      if (this.config.layout.enableAlternatingRows && index % 2 === 1) {
        this.applyAlternatingRowColor(row);
      }
    });
  }

  private generateNotes(vuln: ProcessedVulnerability): string {
    const notes: string[] = [];

    if (vuln.isSemVerMajor && vuln.fixAvailable) {
      notes.push(t('notes.majorChangeRequired'));
    }

    if (!vuln.fixAvailable) {
      notes.push(t('notes.lookForAlternative'));
    }

    if (vuln.isDirect && ['critical', 'high'].includes(vuln.severity)) {
      notes.push(t('notes.criticalDirect'));
    }

    return notes.join(' | ');
  }

  private applyPriorityStyle(priorityCell: ExcelJS.Cell, priority: string): void {
    let fillColor: string;
    let fontColor: string;
    let bold: boolean;

    switch (priority) {
      case 'URGENT':
        fillColor = this.config.colors.priority.urgent;
        fontColor = this.config.colors.text.white;
        bold = true;
        break;
      case 'HIGH':
        fillColor = this.config.colors.priority.high;
        fontColor = this.config.colors.text.white;
        bold = true;
        break;
      case 'MEDIUM':
        fillColor = this.config.colors.priority.medium;
        fontColor = this.config.colors.text.black;
        bold = false;
        break;
      default:
        fillColor = this.config.colors.priority.low;
        fontColor = this.config.colors.text.black;
        bold = false;
    }

    priorityCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: fillColor },
    };
    priorityCell.font = { color: { argb: fontColor }, bold };
    priorityCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private applySeverityStyle(cell: ExcelJS.Cell, severity: string): void {
    let fillColor: string;
    let fontColor: string;

    switch (severity) {
      case 'critical':
        fillColor = this.config.colors.severity.critical;
        fontColor = this.config.colors.text.white;
        break;
      case 'high':
        fillColor = this.config.colors.severity.high;
        fontColor = this.config.colors.text.black;
        break;
      case 'moderate':
        fillColor = this.config.colors.severity.moderate;
        fontColor = this.config.colors.text.black;
        break;
      default:
        fillColor = this.config.colors.severity.low;
        fontColor = this.config.colors.text.black;
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: fillColor },
    };
    cell.font = { color: { argb: fontColor }, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private applyCvssStyle(cell: ExcelJS.Cell, score: number): void {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (score >= this.config.scoring.thresholds.highCvss) {
      cell.font = { color: { argb: this.config.colors.cvss.highRisk }, bold: true };
    } else if (score >= this.config.scoring.thresholds.mediumCvss) {
      cell.font = { color: { argb: this.config.colors.cvss.mediumRisk }, bold: true };
    }
  }

  private applyFixAvailableStyle(cell: ExcelJS.Cell, available: boolean): void {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = {
      color: {
        argb: available ? this.config.colors.fix.available : this.config.colors.fix.notAvailable,
      },
      bold: true,
    };
  }

  private getHeaderRowNumber(): number {
    return this.config.output.includeTitle && this.config.output.includeSummary
      ? 5
      : this.config.output.includeTitle || this.config.output.includeSummary
        ? 3
        : 1;
  }

  private applyAutoFilter(): void {
    const visibleColumnsCount = Object.values(this.config.columns.visible).filter(Boolean).length;
    const lastColumn = String.fromCharCode(64 + visibleColumnsCount);
    const headerRowNum = this.getHeaderRowNumber();

    this.worksheet.autoFilter = {
      from: `A${headerRowNum}`,
      to: `${lastColumn}${headerRowNum}`,
    };
  }

  private applyFreezePane(): void {
    const headerRowNum = this.getHeaderRowNumber();

    this.worksheet.views = [
      {
        state: 'frozen',
        xSplit: this.config.layout.freezePanes.col,
        ySplit: headerRowNum,
      },
    ];
  }

  private applyStyles(): void {
    if (this.config.layout.enableAutoFilter) {
      this.applyAutoFilter();
    }

    this.applyFreezePane();
  }

  private adjustColumnWidths(): void {
    let columnIndex = 1;

    for (const column of this.config.columns.order) {
      if (this.config.columns.visible[column]) {
        const width = this.config.columns.widths[column] || 15; // Default width
        this.worksheet.getColumn(columnIndex).width = width;
        columnIndex++;
      }
    }
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }
}
