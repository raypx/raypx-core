# Claude Code Project Guidelines

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

## Git Commit Guidelines

**Git commit messages must not contain Claude or AI assistance references.**

- Keep commit messages professional and focused on the technical changes
- Do not include phrases like "Generated with Claude Code", "Co-Authored-By: Claude", or similar AI assistance attributions
- Record Claude assistance details in this CLAUDE.md file instead of commit messages
- Commit messages should follow conventional commit format and describe the actual changes made
