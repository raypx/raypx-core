# @raypx/i18n

Shared internationalization configuration and utilities for the raypx project.

## Directory Structure

```
packages/i18n/
├── src-locales/          # Source files (editable)
│   ├── en/
│   │   ├── common.json   # Common UI elements
│   │   └── docs.json     # Documentation-specific
│   └── zh/
│       ├── common.json
│       └── docs.json
├── locales/              # Built files (auto-generated)
│   ├── en.json          # Merged from src-locales/en/*.json
│   └── zh.json          # Merged from src-locales/zh/*.json
└── scripts/
    ├── build-locales.ts # Build script
    └── split-locales.ts # Split existing files into namespaces
```

## Usage

### Development Workflow

1. **Edit translations**: Modify files in `src-locales/[locale]/[namespace].json`
2. **Build merged files**: Run `pnpm build:locales`
3. **Auto-rebuild on changes**: Run `pnpm build:locales:watch`

### Scripts

```bash
# Build merged locale files
pnpm build:locales

# Build and watch for changes
pnpm build:locales:watch

# Split existing merged files into namespaces (migration helper)
pnpm split:locales
```

### In Your App

```typescript
// Use nested keys with namespace
const t = useTranslations();
const saveButton = t('common.button.save');
const docsTitle = t('docs.title');

// Or use namespace-specific hooks
const tCommon = useTranslations('common');
const saveButton = tCommon('button.save');
```

## Benefits

- **File Organization**: Split translations by namespace (common, docs, auth, etc.)
- **Collaboration**: Avoid merge conflicts by editing separate files
- **next-intl Compatible**: Maintains full compatibility with existing next-intl setup
- **Type Safety**: Preserves TypeScript autocompletion and validation
- **Build Optimization**: Single merged files for runtime performance

## Adding New Namespaces

1. Create new JSON files in `src-locales/[locale]/[namespace].json`
2. Run `pnpm build:locales` to generate merged files
3. Use in code: `t('namespace.key')`