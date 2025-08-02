#!/bin/bash

echo "🔧 Husky Hook Switcher"
echo ""
echo "Available pre-commit hook versions:"
echo "1. Standard (optimized with fallback)"
echo "2. Simple (basic tests)"
echo "3. Minimal (guaranteed to work)"
echo ""

read -p "Choose version (1-3): " choice

case $choice in
    1)
        echo "✅ Using standard pre-commit hook"
        # Current version is already the standard one
        ;;
    2)
        echo "✅ Switching to simple pre-commit hook"
        cp .husky/pre-commit-simple .husky/pre-commit
        chmod +x .husky/pre-commit
        ;;
    3)
        echo "✅ Switching to minimal pre-commit hook"
        cp .husky/pre-commit-minimal .husky/pre-commit
        chmod +x .husky/pre-commit
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "🎉 Hook updated successfully!"
