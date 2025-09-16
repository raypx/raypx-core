# Claude Code Project Guidelines

## Quick Start

**Start development environment:**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

**Project Structure:**
```
raypx/
├── apps/web/          # Main Next.js application
├── apps/docs/         # Documentation site
├── packages/          # Shared packages (consumed as TypeScript source)
│   ├── ui/           # UI components with shadcn/ui
│   ├── db/           # Database layer with Drizzle ORM
│   ├── auth/         # Authentication utilities
│   └── shared/       # Shared utilities and types
└── .cursor/rules/     # AI coding assistant rules
```

## Package Manager

**This project uses pnpm as the package manager.**

- Commands: `pnpm install`, `pnpm add`, `pnpm remove`, `pnpx` (instead of `npx`)
- Workspace configuration: Defined in `pnpm-workspace.yaml` and root `package.json` `workspaces` field
- Lock file: `pnpm-lock.yaml` (human-readable format)

## Build Configuration

**Important: Only `apps/` projects should have build scripts.**

- ✅ `apps/*` - Can have `build`, `dev`, `start` scripts (these are deployable applications)
- ❌ `packages/*` - Should NOT have build scripts (these are internal libraries consumed as TypeScript source)

All packages under `packages/` are consumed directly as TypeScript source files by the applications that import them. They do not need compilation or build steps.

## Testing

- Use `@raypx/testing` package for consistent testing setup across the monorepo
- Test runner: Vitest (pnpm has excellent support for Vitest)
- Run tests: `pnpm test` or `vitest`

## Dependency Management

- **Catalog dependencies**: Use `catalog:` for shared dependencies managed in root `package.json` `workspaces.catalog`
- **React dependencies**: Use `catalog:react19` for React 19 related packages
- **Internal packages**: Use `workspace:*` for internal package dependencies
- pnpm natively supports workspace dependencies and monorepo structure with excellent performance

## Performance Benefits

- **Installation**: Faster than npm with efficient dependency resolution
- **Storage efficiency**: Uses symlinks and hard links to save disk space
- **Workspace support**: Excellent monorepo support with workspace protocols
- **Lock file**: Fast and reliable dependency resolution

## Code Change Validation

**Important: Always validate changes with build verification.**

After completing any code changes, especially to packages that affect the web application, run the following command to ensure no build errors:

```bash
cd apps/web && pnpm run build
```

This validation step should be performed:
- After modifying package structure or architecture
- After updating imports/exports in shared packages
- After refactoring components or services
- Before committing significant changes

The build process verifies TypeScript compilation, dependency resolution, and ensures all routes/pages can be properly generated. This helps catch integration issues early and maintains project stability.

## Code Comments

**All comments in this project should be written in English.**

- Use clear, descriptive English comments for code documentation
- This ensures consistency and readability across the entire codebase
- Applies to all files: TypeScript, JavaScript, JSX, TSX, configuration files, and database schemas
- Database schema comments, index names, and migration comments should also be in English

## Development Workflow

### Local Development
```bash
# Start development with turbo
pnpm dev                    # Start all apps in development mode
pnpm dev --filter web       # Start only web app
pnpm dev --filter docs      # Start only docs app

# Database operations
pnpm --filter @raypx/db run db:migrate    # Run database migrations
pnpm --filter @raypx/db run db:studio     # Open Drizzle Studio
pnpm --filter @raypx/db run db:seed       # Seed database with test data

# Testing
pnpm test                   # Run all tests
pnpm test --filter web      # Test specific package
pnpm test --watch          # Watch mode
pnpm test --coverage       # With coverage report
```

### Code Quality
```bash
# Linting and formatting
pnpm check                  # Run Biome linting
pnpm format                # Format code with Biome

# Type checking
pnpm build --dry-run       # Type check without building
```

## Debugging and Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear all caches and reinstall
pnpm clean && rm -rf node_modules && pnpm install

# Clear Next.js cache
rm -rf apps/web/.next

# Clear turbo cache
pnpm turbo clean
```

**Database Issues:**
```bash
# Reset database (development only)
pnpm --filter @raypx/db run db:reset

# Check database connection
pnpm --filter @raypx/db run db:check
```

**TypeScript Errors:**
```bash
# Restart TypeScript server in your editor
# Check for circular dependencies
# Verify all packages are properly built
```

### Performance Optimization

**Development:**
- Use `--turbopack` flag for faster dev builds
- Enable `experimental.webpackBuildWorker` in Next.js config
- Use `pnpm dev --filter` to run only needed packages

**Production:**
- Enable `experimental.optimizeCss` in Next.js config
- Use `ANALYZE=true pnpm build` to analyze bundle size
- Implement proper caching strategies

## Environment Configuration

### Development Environment
```bash
# Copy environment template
cp .env.example .env.local

# Required variables:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
```

### Claude Code Configuration

**Automatic Setup:**
The project automatically creates and maintains local Claude Code settings during installation with an interactive progress display:
- `.claude/settings.json` - Shared team configuration (checked into git)
- `.claude/settings.local.json` - Personal local overrides (gitignored)

**Enhanced Installation Experience:**
- 🔧 **Interactive Progress Bar**: Visual feedback using listr2 task runner
- ⚙️ **Step-by-Step Display**: Clear indication of each setup phase
- 💡 **Contextual Messages**: Helpful tips based on the action performed
- ⏱️ **Timing Information**: Shows duration for each step

**Intelligent Merging:**
The setup script uses `deepmerge` to intelligently combine settings:
- **First time**: Creates local settings from base settings
- **Updates**: Merges base settings with your local customizations
- **Arrays**: Concatenates and deduplicates (e.g., permissions.allow)
- **Objects**: Deep merges with local taking priority
- **Preserves**: All your custom environment variables and settings

**Manual Setup:**
```bash
# If you need to recreate local settings
cp .claude/settings.json .claude/settings.local.json
```

**Customization Examples:**
```json
{
  "permissions": {
    "allow": [
      // Base permissions are automatically included
      "Bash(yarn:*)",          // Add your preferred tools
      "Bash(npm:*)",
      "WebFetch(domain:my-custom-domain.com)"
    ]
  },
  "env": {
    "MY_CUSTOM_VAR": "local-value",
    "DEBUG": "true"
  }
}
```

### Production Checklist
- [ ] Environment variables configured in deployment platform
- [ ] Database migrations run successfully
- [ ] SSL certificates valid
- [ ] CDN configured for static assets
- [ ] Monitoring and error tracking enabled

## Git Commit Guidelines

**Git commit messages must not contain Claude or AI assistance references.**

- Keep commit messages professional and focused on the technical changes
- Do not include phrases like "Generated with Claude Code", "Co-Authored-By: Claude", or similar AI assistance attributions
- Record Claude assistance details in this CLAUDE.md file instead of commit messages
- Commit messages should follow conventional commit format and describe the actual changes made

### Commit Format
```
feat: add user authentication system
fix: resolve database connection timeout
docs: update API documentation
refactor: optimize database queries
test: add integration tests for auth flow
```

## AI Assistant Configuration

This project includes comprehensive AI coding assistant rules in `.cursor/rules/`:

- **nextjs.mdc** - Next.js + React development patterns
- **drizzle.mdc** - Database ORM best practices
- **security.mdc** - Security guidelines and validation
- **tailwind.mdc** - Styling and responsive design
- **api.mdc** - API design and implementation
- **i18n.mdc** - Internationalization with next-intl
- **ui.mdc** - Component system with shadcn/ui
- **typescript.mdc** - Type safety and modern TypeScript
- **monorepo.mdc** - Workspace management with pnpm
- **deployment.mdc** - Environment and deployment configuration

These rules provide context-aware assistance and ensure consistency across the codebase.
