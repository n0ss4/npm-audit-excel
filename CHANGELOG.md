# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-08-02

### Added
- **🎨 Extensive Configuration System**: Complete customization of reports through config files
- **⚙️ Configuration Presets**: Built-in presets (minimal, developer, security, highContrast)
- **📋 Dynamic Column Management**: Show/hide and reorder columns via CLI or config
- **🌈 Custom Color Schemes**: Full color customization with validation
- **📐 Layout Customization**: Configurable row heights, fonts, and spacing
- **🎯 Advanced Scoring**: Customizable priority calculation with configurable weights
- **📄 Configuration Management**: Generate, validate, and manage config files
- **🔧 Enhanced CLI**: New options for real-time customization

### Enhanced CLI Options
- `--config <file>`: Use configuration file
- `--preset <preset>`: Apply built-in configuration presets
- `--show-columns <columns>`: Show only specified columns
- `--hide-columns <columns>`: Hide specified columns
- `--colors <scheme>`: Apply color schemes
- `--generate-config [file]`: Generate sample configuration
- `--list-presets`: List available presets

### Breaking Changes
- `VulnerabilityProcessor` now requires a configuration object
- `ExcelReportGenerator` now requires a configuration object
- All magic numbers and strings moved to constants

### Improved
- **Code Organization**: All magic numbers and strings centralized in constants
- **Type Safety**: Enhanced TypeScript interfaces for configuration
- **Validation**: JSON schema validation for configuration files
- **Documentation**: Comprehensive README with examples
- **Maintainability**: Cleaner, more modular code structure

### Technical Improvements
- Introduced `ConfigManager` singleton for configuration handling
- Added comprehensive configuration merging logic
- Implemented JSON schema validation
- Created preset system for common use cases
- Enhanced error handling and user feedback

### Configuration Features
- **Column Management**: Show/hide, reorder, resize, and rename columns
- **Color Customization**: Full ARGB color support with presets
- **Layout Control**: Row heights, font sizes, freeze panes, auto-filter
- **Scoring Algorithm**: Customizable weights, bonuses, penalties, and thresholds
- **Output Options**: Title, summary, timestamp, and worksheet customization

### Developer Experience
- New programmatic API for configuration management
- Type-safe configuration interfaces
- Runtime validation with helpful error messages
- Extensive test coverage for new features
- JSON schema for IDE support and validation

## [1.0.0] - 2025-08-01

### Added
- Initial release
- Generate Excel reports from npm audit JSON
- Smart vulnerability prioritization algorithm
- Multi-language support (English and Spanish)
- CLI interface with multiple options
- Programmatic API for integration
- Color-coded severity levels
- Automatic fix command generation
- GitHub Actions for CI/CD and npm publishing
