# npm-audit-excel

Generate beautiful Excel reports from npm audit with automatic vulnerability prioritization and extensive customization options.

![npm version](https://img.shields.io/npm/v/npm-audit-excel)
![license](https://img.shields.io/npm/l/npm-audit-excel)
![downloads](https://img.shields.io/npm/dm/npm-audit-excel)

## Features

- 🎯 **Smart Prioritization**: Automatically prioritizes vulnerabilities based on severity, CVSS score, dependency type, and fix availability
- 📊 **Excel Reports**: Generates professional Excel files with color-coding, filters, and formatted data
- 🎨 **Extensive Customization**: Configure columns, colors, layout, and scoring through config files or CLI options
- 🌍 **Multi-language**: Support for multiple languages (currently English and Spanish)
- 🚀 **Easy to Use**: Simple CLI command or programmatic API
- 📝 **Fix Commands**: Includes ready-to-use npm commands for fixing vulnerabilities
- ⚙️ **Configuration Presets**: Built-in presets for different use cases (minimal, developer, security, high-contrast)

## Installation

```bash
# Global installation
npm install -g npm-audit-excel

# Or as a dev dependency
npm install --save-dev npm-audit-excel
```

## Quick Start

```bash
# Generate a basic report
npm-audit-excel

# Use a preset configuration
npm-audit-excel --preset minimal

# Customize columns on the fly
npm-audit-excel --show-columns priority,package,severity,fixCommand

# Generate a configuration file to customize further
npm-audit-excel --generate-config
```

## CLI Usage

### Basic Options

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

### Configuration Options

```bash
# Use a configuration file
npm-audit-excel --config my-config.json

# Use a built-in preset
npm-audit-excel --preset developer

# List available presets
npm-audit-excel --list-presets

# Generate a sample configuration file
npm-audit-excel --generate-config
npm-audit-excel --generate-config custom-config.json
```

### Column Customization

```bash
# Show only specific columns
npm-audit-excel --show-columns priority,package,severity,fixCommand

# Hide specific columns (show all others)
npm-audit-excel --hide-columns cwe,advisoryUrl,notes

# Combine with presets
npm-audit-excel --preset minimal --show-columns priority,package,fixCommand
```

### Color Schemes

```bash
# Use high contrast colors
npm-audit-excel --colors highContrast

# Use custom colors (JSON format)
npm-audit-excel --colors '{"priority":{"urgent":"FF000000"}}'
```

## Configuration

### Configuration File

Create a `npm-audit-excel.config.json` file to customize your reports:

```json
{
  "columns": {
    "visible": {
      "priority": true,
      "package": true,
      "severity": true,
      "fixCommand": true,
      "notes": false
    },
    "order": ["priority", "package", "severity", "fixCommand"],
    "widths": {
      "priority": 15,
      "package": 40,
      "severity": 15,
      "fixCommand": 50
    },
    "customHeaders": {
      "package": "Vulnerable Package"
    }
  },
  "colors": {
    "priority": {
      "urgent": "FFCC0000",
      "high": "FFFF6600"
    }
  },
  "scoring": {
    "severityWeights": {
      "critical": 50,
      "high": 35
    },
    "thresholds": {
      "urgentPriority": 60
    }
  }
}
```

### Available Presets

- **`minimal`**: Shows only essential columns (priority, package, severity, fix info)
- **`developer`**: Developer-focused view with technical details
- **`security`**: Security-focused view emphasizing vulnerabilities and CVSS scores
- **`highContrast`**: High contrast colors for better accessibility

### Configuration Schema

The configuration follows a JSON schema for validation. Key sections:

#### Columns Configuration

- `visible`: Show/hide specific columns
- `order`: Define column order
- `widths`: Set column widths
- `customHeaders`: Override default column headers

#### Colors Configuration

- `priority`: Colors for priority levels (urgent, high, medium, low)
- `severity`: Colors for severity levels (critical, high, moderate, low)
- `text`: Text colors (white, black)
- `background`: Background colors (header, alternating rows)
- `cvss`: CVSS score highlighting colors
- `fix`: Fix availability colors
- `border`: Border color

#### Layout Configuration

- `rowHeights`: Title and header row heights
- `fontSizes`: Font sizes for different elements
- `textLimits`: Text truncation limits
- `freezePanes`: Freeze panes configuration
- `enableAutoFilter`: Enable/disable auto-filter
- `enableAlternatingRows`: Enable/disable alternating row colors

#### Scoring Configuration

- `severityWeights`: Points assigned to each severity level
- `bonusPoints`: Bonus points for various conditions
- `penalties`: Penalty points for various conditions
- `thresholds`: Thresholds for CVSS scores and priority categories

## Programmatic API

```typescript
import {
  VulnerabilityProcessor,
  ExcelReportGenerator,
  ConfigManager,
  DEFAULT_CONFIG,
} from 'npm-audit-excel';
import { initI18n } from 'npm-audit-excel/i18n';

// Initialize language
await initI18n('en');

// Load configuration
const configManager = ConfigManager.getInstance();
const config = await configManager.loadConfig({
  preset: 'developer',
  configFile: 'my-config.json',
});

// Process audit data
const processor = new VulnerabilityProcessor(config);
const vulnerabilities = processor.processAuditReport(auditData);

// Generate Excel report
const generator = new ExcelReportGenerator(config);
await generator.generateReport(
  vulnerabilities,
  auditData.metadata,
  'report.xlsx'
);
```

### Configuration Management

```typescript
import { ConfigManager, PRESET_CONFIGS } from 'npm-audit-excel';

const configManager = ConfigManager.getInstance();

// Load configuration with multiple sources
const config = await configManager.loadConfig({
  preset: 'security',
  configFile: './my-config.json',
  inlineConfig: {
    columns: {
      visible: { notes: false },
    },
  },
});

// Generate sample config
await configManager.generateSampleConfig('./sample-config.json');

// Get available presets
const presets = configManager.getAvailablePresets();
console.log('Available presets:', presets);
```

## Report Format

The generated Excel report includes configurable columns:

- **Priority**: URGENT, HIGH, MEDIUM, LOW (automatically calculated)
- **Score**: Numeric priority score for sorting
- **Package**: Affected package name
- **Severity**: CRITICAL, HIGH, MODERATE, LOW
- **CVSS Score**: Common Vulnerability Scoring System score
- **Dependency Type**: Direct or Indirect
- **Fix Available**: Whether a fix is available
- **Fix Version**: Version that fixes the vulnerability
- **Fix Command**: Ready-to-use npm command
- **Vulnerability**: Vulnerability description
- **CWE**: Common Weakness Enumeration
- **Affected Packages**: Number of affected packages
- **Vulnerable Range**: Vulnerable version range
- **Advisory URL**: Link to security advisory
- **Notes**: Additional context and recommendations

## Priority Calculation

The tool uses a sophisticated algorithm to prioritize vulnerabilities:

- **Base score** from configurable severity weights
- **Bonus points** for direct dependencies, available fixes, and high CVSS scores
- **Penalty points** for major version changes and complex dependency trees
- **Configurable thresholds** for priority categories

All scoring parameters can be customized through configuration.

## CLI Options Reference

| Option                     | Description                     | Example                           |
| -------------------------- | ------------------------------- | --------------------------------- |
| `-i, --input <file>`       | Input audit JSON file           | `--input audit.json`              |
| `-o, --output <file>`      | Output Excel file path          | `--output report.xlsx`            |
| `-l, --language <lang>`    | Report language (en, es)        | `--language es`                   |
| `-v, --verbose`            | Show detailed output            | `--verbose`                       |
| `-c, --config <file>`      | Configuration file path         | `--config my-config.json`         |
| `-p, --preset <preset>`    | Use preset configuration        | `--preset minimal`                |
| `--show-columns <cols>`    | Comma-separated columns to show | `--show-columns priority,package` |
| `--hide-columns <cols>`    | Comma-separated columns to hide | `--hide-columns notes,cwe`        |
| `--colors <scheme>`        | Color scheme or JSON            | `--colors highContrast`           |
| `--generate-config [file]` | Generate sample config          | `--generate-config`               |
| `--list-presets`           | List available presets          | `--list-presets`                  |

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/n0ss4/npm-audit-excel.git
cd npm-audit-excel

# Install dependencies
npm install

# The prepare script will automatically set up Husky hooks
# This enables pre-commit checks for code quality
```

### Development Commands

```bash
# Development mode - test CLI with live reload
npm run dev -- --input sample-audit.json --preset developer

# Build the project
npm run build

# Run tests
npm test
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report

# Code quality
npm run lint          # Check linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run format:check  # Check formatting
npm run type-check    # TypeScript type checking

# Validate everything (used in CI/CD)
npm run validate      # Runs type-check + lint + format:check + test
```

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks to ensure code quality:

#### Pre-commit Hook Options

Choose your preferred pre-commit configuration:

- **`pre-commit`** (default): Full checks with optimized test runs
- **`pre-commit-simple`**: Basic checks with simplified tests
- **`pre-commit-minimal`**: Fastest option - lint, format, and type-check only

To switch between configurations:

```bash
# Copy the desired configuration
cp .husky/pre-commit-minimal .husky/pre-commit

# Make it executable
chmod +x .husky/pre-commit
```

#### What the hooks do:

- **Pre-commit**: Runs lint-staged, type-check, and tests on staged files
- **Pre-push**: Runs full validation suite before pushing
- **Commit-msg**: Validates commit message format

### Project Structure

```
src/
├── cli.ts              # CLI entry point
├── index.ts            # Main library exports
├── config/             # Configuration management
│   ├── configManager.ts
│   ├── reportConfig.ts
│   └── constants.ts
├── core/               # Core functionality
│   ├── VulnerabilityProcessor.ts
│   └── ExcelReportGenerator.ts
├── i18n/               # Internationalization
│   ├── index.ts
│   └── locales/
├── types/              # TypeScript definitions
└── __tests__/          # Test files
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for specific files (useful during development)
npm test -- --testPathPattern=VulnerabilityProcessor
```

### Adding Features

1. **New Configuration Options**: Update `src/config/reportConfig.ts`
2. **New Languages**: Add locale files to `src/i18n/locales/`
3. **New Presets**: Add to `PRESET_CONFIGS` in `src/config/reportConfig.ts`
4. **New Columns**: Update types and processing logic in respective files

### Code Quality Standards

- **TypeScript**: Strict type checking enabled
- **Biome.js**: Modern linting and formatting tool
- **Jest**: Testing framework with coverage reporting
- **Husky + lint-staged**: Pre-commit hooks for quality gates

### Troubleshooting Development Issues

#### Hook Permission Issues
```bash
# Make hooks executable
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests without cache
npm test -- --no-cache
```

#### Type Errors
```bash
# Check types without emitting files
npm run type-check

# Build to see full type errors
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding a new language

1. Create a new JSON file in `src/i18n/locales/`
2. Copy the structure from `en.json`
3. Translate all strings
4. Import it in `src/i18n/index.ts`

### Adding a new preset

1. Add your preset to `PRESET_CONFIGS` in `src/config/reportConfig.ts`
2. Update the CLI help text and documentation
3. Add tests for the new preset

## License

MIT © n0ss4

## Acknowledgments

- Built with [ExcelJS](https://github.com/exceljs/exceljs)
- CLI powered by [Commander.js](https://github.com/tj/commander.js)
- Internationalization with [i18next](https://www.i18next.com/)
