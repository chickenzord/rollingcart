# VSCode Setup for Rollingcart

This directory contains VSCode workspace settings for the Rollingcart project.

## Required Extensions

Install the following VSCode extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Provides real-time linting for JavaScript/JSX files
   - Auto-fixes issues on save
   - Install: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux), type "Extensions: Install Extensions", search for "ESLint"
   - Or visit: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

2. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Provides autocomplete for Tailwind CSS classes
   - Shows CSS preview on hover
   - Install: Same process as above, search for "Tailwind CSS IntelliSense"
   - Or visit: https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss

## What's Configured

### ESLint Integration
- **Auto-fix on save**: ESLint will automatically fix fixable issues when you save a file
- **Real-time feedback**: See linting errors and warnings as you type
- **React-specific rules**: Configured for React 17+ (no need to import React)
- **Hooks rules**: Enforces React Hooks best practices
- **Accessibility**: Warns about common accessibility issues

### Code Formatting
- JavaScript/JSX files are formatted by ESLint
- Auto-format on save is enabled
- Consistent code style across the project

## Manual Linting

You can also run linting manually from the terminal:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## Troubleshooting

### ESLint not working?

1. **Reload VSCode**: Press `Cmd+Shift+P` / `Ctrl+Shift+P` and select "Developer: Reload Window"
2. **Check ESLint output**: View → Output → Select "ESLint" from dropdown
3. **Verify extension is installed**: Check Extensions sidebar (`Cmd+Shift+X` / `Ctrl+Shift+X`)

### Auto-fix not working on save?

1. Check that `editor.codeActionsOnSave` is enabled in settings
2. Make sure the ESLint extension is enabled for JavaScript/JSX files
3. Restart VSCode

### Wrong formatter being used?

The `.vscode/settings.json` file configures ESLint as the default formatter for JS/JSX files. If another formatter is being used, check your user settings don't override this.
