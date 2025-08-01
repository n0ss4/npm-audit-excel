# Contributing to npm-audit-excel

First off, thank you for considering contributing to npm-audit-excel! It's people like you that make npm-audit-excel such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a branch: `git checkout -b my-feature`
4. Make your changes
5. Run tests: `npm test`
6. Run linter: `npm run lint`
7. Build: `npm run build`
8. Commit your changes: `git commit -am 'Add some feature'`
9. Push to the branch: `git push origin my-feature`
10. Create a Pull Request

## Style Guide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new functionality

## Adding a New Language

To add support for a new language:

1. Create a new JSON file in `src/i18n/locales/` (e.g., `fr.json` for French)
2. Copy the structure from `en.json`
3. Translate all strings to the new language
4. Import the new locale in `src/i18n/index.ts`
5. Add the language code to the README documentation
6. Create a Pull Request with your changes

Example for adding French support:

```typescript
// src/i18n/index.ts
import fr from './locales/fr.json';

// Add to resources
resources: {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr }  // New language
}
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
