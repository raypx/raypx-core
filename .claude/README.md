# Claude Code Configuration

This directory contains Claude Code configuration files for the project.

## Files Overview

### Team Configuration (Committed to Git)
- `settings.template.json` - Template configuration with recommended settings
- `README.md` - This documentation file

### Personal Configuration (Not in Git)
- `settings.local.json` - Personal settings, automatically generated
- `auth.json` - Authentication tokens (never commit)
- `cache/` - Claude Code cache directory
- `logs/` - Claude Code logs

## Setup Instructions

1. **First time setup:**
   ```bash
   # Copy template to local settings
   cp .claude/settings.template.json .claude/settings.local.json

   # Customize your personal settings as needed
   ```

2. **Team members should:**
   - Use the template as a starting point
   - Add personal preferences to `settings.local.json`
   - Never commit personal settings to Git

## Security Guidelines

- ✅ **Safe to commit**: Template files, documentation
- ❌ **Never commit**: Personal settings, auth tokens, cache files
- 🔒 **Protected paths**: `.env*`, `secrets/*`, `private/*`

## Recommended Permissions

The template includes:
- ✅ Git operations, package management, testing
- ❌ Destructive operations, system commands
- ❓ File operations (will prompt for confirmation)

## Troubleshooting

If Claude can't access certain files:
1. Check `sandbox.filesystem.read.deny` in your settings
2. Verify file paths are correct
3. Restart Claude Code after configuration changes