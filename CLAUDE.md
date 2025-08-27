# Claude Code Project Guidelines

## Package Manager

**This project uses Bun as the package manager.**

- Commands: `bun install`, `bun add`, `bun remove`, `bunx` (instead of `npx`)
- Workspace configuration: Defined in root `package.json` `workspaces` field
- Lock file: `bun.lockb` (binary format, faster than text-based locks)

## Build Configuration

**Important: Only `apps/` projects should have build scripts.**

- ✅ `apps/*` - Can have `build`, `dev`, `start` scripts (these are deployable applications)
- ❌ `packages/*` - Should NOT have build scripts (these are internal libraries consumed as TypeScript source)

All packages under `packages/` are consumed directly as TypeScript source files by the applications that import them. They do not need compilation or build steps.

## Testing

- Use `@raypx/testing` package for consistent testing setup across the monorepo
- Test runner: Vitest (Bun has native support for Vitest)
- Run tests: `bun test` or `vitest`

## Dependency Management

- **Catalog dependencies**: Use `catalog:` for shared dependencies managed in root `package.json` `workspaces.catalog`
- **React dependencies**: Use `catalog:react19` for React 19 related packages
- **Internal packages**: Use `workspace:*` for internal package dependencies
- Bun natively supports workspace dependencies and monorepo structure with zero configuration

## Performance Benefits

- **Installation**: 2-10x faster than npm/pnpm
- **Runtime**: Native speed for JavaScript/TypeScript execution
- **Bundling**: Built-in bundler eliminates need for separate build tools
- **Testing**: Integrated test runner reduces tooling complexity

## Code Change Validation

**Important: Always validate changes with build verification.**

After completing any code changes, especially to packages that affect the web application, run the following command to ensure no build errors:

```bash
cd apps/web && bun run build
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
