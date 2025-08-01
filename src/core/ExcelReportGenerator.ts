import ExcelJS from 'exceljs';
import { ProcessedVulnerability, AuditReport } from '../types';
import { t } from '../i18n';

export class ExcelReportGenerator {
  private readonly workbook: ExcelJS.Workbook;
  private readonly worksheet: ExcelJS.Worksheet;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet(t('title'));
  }

  async generateReport(
    vulnerabilities: ProcessedVulnerability[],
    metadata: AuditReport['metadata'],
    outputPath: string
  ): Promise<void> {
    this.addTitle();
    this.addSummary(vulnerabilities.length, metadata);
    this.addHeaders();
    this.addData(vulnerabilities);
    this.applyStyles();
    this.adjustColumnWidths();
    
    await this.workbook.xlsx.writeFile(outputPath);
  }

  private addTitle(): void {
    const titleRow = this.worksheet.addRow([
      `${t('title')} - ${new Date().toLocaleString()}`
    ]);
    
    this.worksheet.mergeCells('A1:P1');
    titleRow.getCell(1).font = { size: 16, bold: true };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;
  }

  private addSummary(total: number, metadata: AuditReport['metadata']): void {
    const summary = t('summary', {
      total,
      critical: metadata.vulnerabilities.critical,
      high: metadata.vulnerabilities.high,
      moderate: metadata.vulnerabilities.moderate,
      low: metadata.vulnerabilities.low
    });

    const summaryRow = this.worksheet.addRow([summary]);
    this.worksheet.mergeCells('A3:P3');
    summaryRow.getCell(1).font = { size: 12, italic: true };
    summaryRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Add empty row for spacing
    this.worksheet.addRow([]);
  }

  private addHeaders(): void {
    const headers = [
      t('headers.priority'),
      t('headers.score'),
      t('headers.package'),
      t('headers.severity'),
      t('headers.cvss'),
      t('headers.dependencyType'),
      t('headers.fixAvailable'),
      t('headers.fixVersion'),
      t('headers.majorChange'),
      t('headers.vulnerability'),
      t('headers.cwe'),
      t('headers.affectedPackages'),
      t('headers.vulnerableRange'),
      t('headers.fixCommand'),
      t('headers.advisoryUrl'),
      t('headers.notes')
    ];

    const headerRow = this.worksheet.addRow(headers);
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4788' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headerRow.height = 25;
  }

  private addData(vulnerabilities: ProcessedVulnerability[]): void {
    vulnerabilities.forEach((vuln, index) => {
      const notes = this.generateNotes(vuln);
      
      const row = this.worksheet.addRow([
        t(`priority.${vuln.priorityCategory.toLowerCase()}`),
        vuln.priorityScore,
        vuln.package,
        t(`severity.${vuln.severity}`),
        vuln.cvssScore > 0 ? vuln.cvssScore : '-',
        vuln.isDirect ? t('dependencyType.direct') : t('dependencyType.indirect'),
        vuln.fixAvailable ? t('boolean.available') : t('boolean.notAvailable'),
        vuln.fixVersion,
        vuln.isSemVerMajor ? t('boolean.yes') : t('boolean.no'),
        this.truncate(vuln.vulnerabilityTitle, 80),
        vuln.cwe,
        vuln.effectsCount,
        vuln.range,
        vuln.fixCommand || t('commands.noFixAvailable'),
        vuln.advisoryUrl,
        notes
      ]);

      // Apply priority styling
      this.applyPriorityStyle(row.getCell(1), row.getCell(2), vuln.priorityCategory);
      
      // Apply severity styling
      this.applySeverityStyle(row.getCell(4), vuln.severity);
      
      // Apply CVSS styling
      this.applyCvssStyle(row.getCell(5), vuln.cvssScore);
      
      // Apply fix available styling
      this.applyFixAvailableStyle(row.getCell(7), vuln.fixAvailable);
      
      // Apply borders to all cells
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });

      // Apply alternating row colors
      if (index % 2 === 1) {
        row.eachCell((cell, colNumber) => {
          // Don't override priority and severity colors
          if (colNumber !== 1 && colNumber !== 4) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' }
            };
          }
        });
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

  private applyPriorityStyle(
    priorityCell: ExcelJS.Cell,
    scoreCell: ExcelJS.Cell,
    priority: string
  ): void {
    let fillColor: string;
    let fontColor: string;
    let bold: boolean;

    switch (priority) {
      case 'URGENT':
        fillColor = 'FF8B0000';
        fontColor = 'FFFFFFFF';
        bold = true;
        break;
      case 'HIGH':
        fillColor = 'FFFF4500';
        fontColor = 'FFFFFFFF';
        bold = true;
        break;
      case 'MEDIUM':
        fillColor = 'FFFFD700';
        fontColor = 'FF000000';
        bold = false;
        break;
      default:
        fillColor = 'FF98FB98';
        fontColor = 'FF000000';
        bold = false;
    }

    priorityCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: fillColor }
    };
    priorityCell.font = { color: { argb: fontColor }, bold };
    priorityCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    scoreCell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private applySeverityStyle(cell: ExcelJS.Cell, severity: string): void {
    let fillColor: string;
    let fontColor: string;

    switch (severity) {
      case 'critical':
        fillColor = 'FFFF0000';
        fontColor = 'FFFFFFFF';
        break;
      case 'high':
        fillColor = 'FFFFA500';
        fontColor = 'FF000000';
        break;
      case 'moderate':
        fillColor = 'FFFFFF00';
        fontColor = 'FF000000';
        break;
      default:
        fillColor = 'FF90EE90';
        fontColor = 'FF000000';
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: fillColor }
    };
    cell.font = { color: { argb: fontColor }, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private applyCvssStyle(cell: ExcelJS.Cell, score: number): void {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    if (score >= 9) {
      cell.font = { color: { argb: 'FFFF0000' }, bold: true };
    } else if (score >= 7) {
      cell.font = { color: { argb: 'FFFF4500' }, bold: true };
    }
  }

  private applyFixAvailableStyle(cell: ExcelJS.Cell, available: boolean): void {
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.font = {
      color: { argb: available ? 'FF008000' : 'FFFF0000' },
      bold: true
    };
  }

  private applyStyles(): void {
    // Apply auto filter
    this.worksheet.autoFilter = {
      from: 'A5',
      to: 'P5'
    };

    // Freeze panes to keep headers visible
    this.worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 5 }
    ];
  }

  private adjustColumnWidths(): void {
    const columnWidths = [
      { column: 1, width: 12 },   // Priority
      { column: 2, width: 8 },    // Score
      { column: 3, width: 35 },   // Package
      { column: 4, width: 12 },   // Severity
      { column: 5, width: 8 },    // CVSS
      { column: 6, width: 15 },   // Dependency Type
      { column: 7, width: 15 },   // Fix Available
      { column: 8, width: 20 },   // Fix Version
      { column: 9, width: 14 },   // Major Change
      { column: 10, width: 50 },  // Vulnerability
      { column: 11, width: 15 },  // CWE
      { column: 12, width: 18 },  // Affected Packages
      { column: 13, width: 25 },  // Vulnerable Range
      { column: 14, width: 45 },  // Fix Command
      { column: 15, width: 40 },  // Advisory URL
      { column: 16, width: 25 }   // Notes
    ];

    columnWidths.forEach(({ column, width }) => {
      this.worksheet.getColumn(column).width = width;
    });
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
