module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/cli.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/test/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  // Performance optimizations
  maxWorkers: '50%',
  // Clear mocks between tests
  clearMocks: true,
  // Automatically restore mock state between every test
  restoreMocks: true,
  // Verbose output for CI
  verbose: process.env.CI === 'true',
  // Fail fast in CI
  bail: process.env.CI === 'true' ? 1 : 0,
};
