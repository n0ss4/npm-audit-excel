# Development Setup

This document outlines the development environment setup and guidelines for contributing to npm-audit-excel.

## 🚀 Quick Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/n0ss4/npm-audit-excel.git
   cd npm-audit-excel
   npm install
   ```

2. **Setup development tools**:
   ```bash
   # Run the setup script (Unix/Linux/macOS)
   chmod +x setup-husky.sh
   ./setup-husky.sh
   
   # Or manually:
   npm run prepare
   ```

## 🔧 Development Tools

### Husky Git Hooks

We use Husky to ensure code quality and consistency:

- **pre-commit**: Runs on every commit
  - Biome.js on staged files (linting + formatting)
  - TypeScript type checking
  - Related tests

- **pre-push**: Runs before pushing
  - Full validation suite
  - Build verification
  - Additional checks for main/master branch

- **commit-msg**: Validates commit message format
  - Enforces [Conventional Commits](https://www.conventionalcommits.org/)

### Code Quality Tools

- **Biome.js**: Fast linting and formatting with TypeScript support
- **TypeScript**: Static type checking
- **Jest**: Testing framework with coverage

## 📝 Available Scripts

### Development
```bash
npm run dev                 # Run CLI in development mode
npm run dev -- --help       # See CLI options
npm run dev -- --preset minimal  # Test with preset
```

### Code Quality
```bash
npm run lint                # Run Biome.js linting
npm run lint:fix            # Fix Biome.js issues
npm run format              # Format with Biome.js
npm run format:check        # Check formatting
npm run type-check          # TypeScript type checking
npm run validate            # Run all checks
```

### Testing
```bash
npm test                    # Run tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
```

### Build
```bash
npm run build               # Build for production
```

## 🎯 Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `perf`: A code change that improves performance
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or dependencies
- `revert`: Reverts a previous commit

### Examples
```bash
feat: add configuration presets
fix(cli): resolve column parsing issue
docs: update README with new examples
refactor(config): extract constants to separate file
test: add tests for ConfigManager
chore: update dependencies
```

## 🧪 Testing Guidelines

### Test Structure
- Unit tests in `src/__tests__/`
- Test files should end with `.test.ts`
- Use descriptive test names
- Group related tests with `describe` blocks

### Coverage Requirements
- Minimum 70% coverage for branches, functions, lines, and statements
- Focus on testing public APIs and edge cases
- Mock external dependencies

### Example Test
```typescript
describe('ConfigManager', () => {
  describe('loadConfig', () => {
    it('should return default config when no options provided', async () => {
      const config = await configManager.loadConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
    });
  });
});
```

## 🎨 Code Style

### Biome.js Configuration
- Single quotes
- Semicolons
- 2 spaces indentation
- 100 character line width
- Trailing commas in ES5
- TypeScript strict mode
- No unused variables
- Prefer const over let
- No console.log in production code (warn)
- Complexity limit: 10

## 🔍 Pre-commit Checklist

Before committing, ensure:
- [ ] Code is properly formatted (Biome.js)
- [ ] No linting errors (Biome.js)
- [ ] TypeScript compiles without errors
- [ ] Tests pass
- [ ] Commit message follows convention

## 🚨 Troubleshooting

### Husky hooks not running
```bash
# Re-install husky
npx husky install

# Make hooks executable (Unix/Linux/macOS)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

### Biome.js issues
```bash
# Check for issues
npm run lint
npm run format:check

# Fix automatically
npm run lint:fix
npm run format
```

### TypeScript errors
```bash
# Check types
npm run type-check

# Build to see detailed errors
npm run build
```

### Tests failing
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- ConfigManager.test.ts

# Update snapshots if needed
npm test -- --updateSnapshot
```

### Skip hooks temporarily (use sparingly)
```bash
# Skip pre-commit hook
git commit --no-verify -m "fix: urgent hotfix"

# Skip pre-push hook
git push --no-verify
```

## 🔄 Workflow

### Feature Development
1. Create feature branch: `git checkout -b feat/new-feature`
2. Make changes with proper commits
3. Ensure all hooks pass
4. Push and create PR
5. Ensure CI passes
6. Get code review
7. Merge to main

### Hotfix Process
1. Create hotfix branch: `git checkout -b fix/critical-bug`
2. Make minimal changes
3. Ensure hooks pass
4. Fast-track review
5. Merge to main and tag

## 🚀 Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release commit: `chore: release v2.0.0`
4. Create git tag: `git tag v2.0.0`
5. Push with tags: `git push --tags`
6. Publish to npm: `npm publish`

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Biome.js Documentation](https://biomejs.dev/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Husky Git Hooks](https://typicode.github.io/husky/#/)

## 🤝 Contributing

We welcome contributions! Please:
1. Follow the development setup
2. Adhere to code style guidelines
3. Write tests for new features
4. Update documentation as needed
5. Follow the commit message convention

For major changes, please open an issue first to discuss what you would like to change.
