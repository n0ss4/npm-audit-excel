#!/bin/bash

# Husky setup script for npm-audit-excel
set -e  # Exit on any error

echo "🐶 Setting up Husky for npm-audit-excel..."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to handle errors
handle_error() {
    echo "❌ Error: $1"
    echo "Please fix the issue and try again."
    exit 1
}

# Check if Node.js is installed
if ! command_exists node; then
    handle_error "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/"
fi

# Check if npm is available
if ! command_exists npm; then
    handle_error "npm is not available. Please ensure npm is properly installed with Node.js"
fi

# Check if git is available
if ! command_exists git; then
    handle_error "git is not installed or not in PATH. Please install git"
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    handle_error "Not a git repository. Please run this script from the project root directory"
fi

echo "✅ Environment checks passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if ! npm install; then
    handle_error "Failed to install dependencies. Please check your npm configuration"
fi

# Initialize husky
echo "🔧 Initializing Husky..."
if ! npx husky install; then
    handle_error "Failed to initialize Husky. This might be due to permission issues"
fi

# Make hooks executable (Unix/Linux/macOS)
if [ "$OS" != "Windows_NT" ]; then
    echo "🔐 Setting executable permissions for hooks..."
    
    # Check if hook files exist before making them executable
    hooks=("pre-commit" "pre-push" "commit-msg")
    for hook in "${hooks[@]}"; do
        if [ -f ".husky/$hook" ]; then
            chmod +x ".husky/$hook"
            echo "  ✅ Made .husky/$hook executable"
        else
            echo "  ⚠️  Warning: .husky/$hook not found"
        fi
    done
    
    # Make alternative pre-commit hooks executable
    alt_hooks=("pre-commit-simple" "pre-commit-minimal")
    for hook in "${alt_hooks[@]}"; do
        if [ -f ".husky/$hook" ]; then
            chmod +x ".husky/$hook"
            echo "  ✅ Made .husky/$hook executable"
        fi
    done
    
    # Make husky.sh executable if it exists
    if [ -f ".husky/_/husky.sh" ]; then
        chmod +x ".husky/_/husky.sh"
        echo "  ✅ Made .husky/_/husky.sh executable"
    fi
fi

echo ""
echo "✅ Husky setup complete!"
echo ""
echo "📋 Configured hooks:"
echo "  • pre-commit:  Runs Biome lint, format, type-check, and tests"
echo "  • pre-push:    Runs full validation suite"
echo "  • commit-msg:  Validates commit message format"
echo ""
echo "🎯 Available pre-commit configurations:"
echo "  • pre-commit          - Full checks (default)"
echo "  • pre-commit-simple   - Basic checks"
echo "  • pre-commit-minimal  - Lint + type-check only"
echo ""
echo "💡 To switch configurations:"
echo "  cp .husky/pre-commit-minimal .husky/pre-commit"
echo "  chmod +x .husky/pre-commit"
echo ""
echo "🔍 Verify setup:"
echo "  git add . && git commit -m 'test: verify hooks' --dry-run"
echo ""
echo "🎉 You're all set! Happy coding!"
