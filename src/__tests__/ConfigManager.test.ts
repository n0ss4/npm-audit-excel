import fs from 'node:fs/promises';
import { ConfigManager, DEFAULT_CONFIG } from '../config';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const testConfigPath = './test-config.json';

  beforeEach(() => {
    configManager = ConfigManager.getInstance();
  });

  afterEach(async () => {
    try {
      await fs.unlink(testConfigPath);
    } catch {
      // File might not exist
    }
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('loadConfig', () => {
    it('should return default config when no options provided', async () => {
      const config = await configManager.loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should apply preset configuration', async () => {
      const config = await configManager.loadConfig({ preset: 'minimal' });

      // Minimal preset should hide most columns
      expect(config.columns.visible.priority).toBe(true);
      expect(config.columns.visible.package).toBe(true);
      expect(config.columns.visible.notes).toBe(false);
      expect(config.columns.visible.cwe).toBe(false);
    });

    it('should load config from file', async () => {
      const testConfig = {
        columns: {
          visible: {
            priority: true,
            package: true,
            severity: false,
          },
        },
      };

      await fs.writeFile(testConfigPath, JSON.stringify(testConfig));

      const config = await configManager.loadConfig({ configFile: testConfigPath });
      expect(config.columns.visible.severity).toBe(false);
    });

    it('should merge inline configuration', async () => {
      const inlineConfig = {
        layout: {
          enableAutoFilter: false,
        },
      } as Partial<import('../config').ReportConfig>;

      const config = await configManager.loadConfig({ inlineConfig });
      expect(config.layout.enableAutoFilter).toBe(false);
    });

    it('should prioritize configurations correctly: preset < file < inline', async () => {
      const fileConfig = {
        columns: {
          visible: {
            priority: false, // Override preset
          },
        },
      };

      const inlineConfig = {
        columns: {
          visible: {
            package: false, // Override file and preset
          },
        },
      } as Partial<import('../config').ReportConfig>;

      await fs.writeFile(testConfigPath, JSON.stringify(fileConfig));

      const config = await configManager.loadConfig({
        preset: 'minimal', // Sets priority: true
        configFile: testConfigPath, // Sets priority: false
        inlineConfig, // Sets package: false
      });

      expect(config.columns.visible.priority).toBe(false); // From file
      expect(config.columns.visible.package).toBe(false); // From inline
    });
  });

  describe('generateSampleConfig', () => {
    it('should generate a valid configuration file', async () => {
      await configManager.generateSampleConfig(testConfigPath);

      const fileContent = await fs.readFile(testConfigPath, 'utf-8');
      const config = JSON.parse(fileContent);

      expect(config).toHaveProperty('columns');
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('layout');
      expect(config).toHaveProperty('scoring');
      expect(config).toHaveProperty('output');
    });
  });

  describe('getAvailablePresets', () => {
    it('should return all available presets', () => {
      const presets = configManager.getAvailablePresets();
      expect(presets).toContain('minimal');
      expect(presets).toContain('developer');
      expect(presets).toContain('security');
      expect(presets).toContain('highContrast');
    });
  });

  describe('applyPreset', () => {
    it('should apply preset configuration to current config', () => {
      configManager.applyPreset('minimal');
      const config = configManager.getConfig();

      expect(config.columns.visible.notes).toBe(false);
      expect(config.columns.visible.priority).toBe(true);
    });

    it('should throw error for unknown preset', () => {
      expect(() => {
        // @ts-expect-error Testing invalid preset name
        configManager.applyPreset('nonexistent');
      }).toThrow('Unknown preset: nonexistent');
    });
  });

  describe('validation', () => {
    it('should validate color formats', async () => {
      const invalidConfig = {
        colors: {
          priority: {
            urgent: 'invalid-color',
          },
        },
      };

      await fs.writeFile(testConfigPath, JSON.stringify(invalidConfig));

      // Should not throw but warn instead
      await expect(configManager.loadConfig({ configFile: testConfigPath })).resolves.toBeDefined();
    });

    it('should validate column names', async () => {
      const invalidConfig = {
        columns: {
          visible: {
            invalidColumn: true,
          },
        },
      };

      await fs.writeFile(testConfigPath, JSON.stringify(invalidConfig));

      await expect(configManager.loadConfig({ configFile: testConfigPath })).resolves.toBeDefined();
    });
  });
});
