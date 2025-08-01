# npm-audit-excel

Generate beautiful Excel reports from npm audit with automatic vulnerability prioritization and multi-language support.

![npm version](https://img.shields.io/npm/v/npm-audit-excel)
![license](https://img.shields.io/npm/l/npm-audit-excel)
![downloads](https://img.shields.io/npm/dm/npm-audit-excel)

## Features

- 🎯 **Smart Prioritization**: Automatically prioritizes vulnerabilities based on severity, CVSS score, dependency type, and fix availability
- 📊 **Excel Reports**: Generates professional Excel files with color-coding, filters, and formatted data
- 🌍 **Multi-language**: Support for multiple languages (currently English and Spanish)
- 🚀 **Easy to Use**: Simple CLI command or programmatic API
- 🎨 **Visual Indicators**: Color-coded severity levels and priority categories
- 📝 **Fix Commands**: Includes ready-to-use npm commands for fixing vulnerabilities

## Installation

```bash
# Global installation
npm install -g npm-audit-excel

# Or as a dev dependency
npm install --save-dev npm-audit-excel
```

## Usage

### CLI

```bash
# Run npm audit and generate Excel report
npm-audit-excel

# Use existing audit JSON file
npm-audit-excel --input audit-report.json

# Specify output file
npm-audit-excel --output my-report.xlsx

# Generate report in Spanish
npm-audit-excel --language es

# Verbose output
npm-audit-excel --verbose
```

### Programmatic API

```typescript
import { VulnerabilityProcessor, ExcelReportGenerator } from 'npm-audit-excel';
import { initI18n } from 'npm-audit-excel/i18n';

// Initialize language
await initI18n('en');

// Process audit data
const processor = new VulnerabilityProcessor();
const vulnerabilities = processor.processAuditReport(auditData);

// Generate Excel report
const generator = new ExcelReportGenerator();
await generator.generateReport(vulnerabilities, auditData.metadata, 'report.xlsx');
```

## Report Format

The generated Excel report includes:

- **Priority**: URGENT, HIGH, MEDIUM, LOW (automatically calculated)
- **Score**: Numeric priority score for sorting
- **Package**: Affected package name
- **Severity**: CRITICAL, HIGH, MODERATE, LOW
- **CVSS Score**: Common Vulnerability Scoring System score
- **Dependency Type**: Direct or Indirect
- **Fix Available**: Whether a fix is available
- **Fix Version**: Version that fixes the vulnerability
- **Fix Command**: Ready-to-use npm command
- **And more...**

## Priority Calculation

The tool uses a sophisticated algorithm to prioritize vulnerabilities:

- **Base score** from severity (Critical: 40, High: 30, Moderate: 20, Low: 10)
- **+15 points** for direct dependencies
- **+10 points** for available fixes
- **+5-10 points** for high CVSS scores (7+)
- **-5 points** for major version changes
- **-2 points per affected package** (up to -10)

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Input audit JSON file | Run `npm audit` |
| `--output` | `-o` | Output Excel file path | `npm-audit-report.xlsx` |
| `--language` | `-l` | Report language (en, es) | `en` |
| `--verbose` | `-v` | Show detailed output | `false` |

## Development

```bash
# Clone the repository
git clone https://github.com/n0ss4/npm-audit-excel.git
cd npm-audit-excel

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev -- --input sample-audit.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding a new language

1. Create a new JSON file in `src/i18n/locales/`
2. Copy the structure from `en.json`
3. Translate all strings
4. Import it in `src/i18n/index.ts`

## License

MIT © n0ss4

## Acknowledgments

- Built with [ExcelJS](https://github.com/exceljs/exceljs)
- CLI powered by [Commander.js](https://github.com/tj/commander.js)
- Internationalization with [i18next](https://www.i18next.com/)
