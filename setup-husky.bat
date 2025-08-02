@echo off
setlocal EnableDelayedExpansion

echo 🐶 Setting up Husky for npm-audit-excel...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not available
    echo Please ensure npm is properly installed with Node.js
    echo.
    pause
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Not a git repository
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo ✅ Environment checks passed
echo.

echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    echo Please check your npm configuration and try again
    echo.
    pause
    exit /b 1
)

echo 🔧 Initializing Husky...
npx husky install
if errorlevel 1 (
    echo ❌ Error: Failed to initialize Husky
    echo This might be due to permission issues or corrupted installation
    echo.
    pause
    exit /b 1
)

REM Check if hooks were created successfully
if not exist ".husky\pre-commit" (
    echo ⚠️  Warning: pre-commit hook not found
    echo You may need to manually create the hooks
)
if not exist ".husky\pre-push" (
    echo ⚠️  Warning: pre-push hook not found
)
if not exist ".husky\commit-msg" (
    echo ⚠️  Warning: commit-msg hook not found
)

echo.
echo ✅ Husky setup complete!
echo.
echo 📋 Configured hooks:
echo   • pre-commit:  Runs Biome lint, format, type-check, and tests
echo   • pre-push:    Runs full validation suite
echo   • commit-msg:  Validates commit message format
echo.
echo 🎯 Available pre-commit configurations:
echo   • pre-commit          - Full checks (default)
echo   • pre-commit-simple   - Basic checks
echo   • pre-commit-minimal  - Lint + type-check only
echo.
echo 💡 To switch configurations:
echo   copy .husky\pre-commit-minimal .husky\pre-commit
echo.
echo 🎉 You're all set! Happy coding!
echo.
pause
