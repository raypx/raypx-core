# Deployment Guide

This project supports multiple deployment scenarios with automatic configuration.

## Deployment Options

### 1. Vercel (Recommended for Web Apps)

Deploy to Vercel without any configuration changes:

```bash
# No environment variables needed
vercel --prod
```

The application will automatically use the default Next.js output mode suitable for Vercel.

### 2. Docker

For containerized deployments:

```bash
# Docker automatically sets DOCKER_BUILD=true
docker-compose up -d
```

The `standalone` output mode is automatically enabled for Docker builds.

### 3. Static Export

For static site generation:

```bash
# Set output mode to export
NEXT_OUTPUT=export pnpm run build
```

### 4. Custom Configuration

You can explicitly control the output mode:

```bash
# Force standalone mode
NEXT_OUTPUT=standalone pnpm run build

# Force default mode (Vercel-compatible)
NEXT_OUTPUT= pnpm run build
```

## Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `NEXT_OUTPUT` | `"standalone"`, `"export"`, `undefined` | `undefined` | Explicitly set Next.js output mode |
| `DOCKER_BUILD` | `"true"` | `undefined` | Automatically enables standalone mode |

## Priority Order

The output mode is determined in this order:
1. Explicit `output` option in next.config.ts
2. `NEXT_OUTPUT` environment variable
3. `DOCKER_BUILD=true` → `standalone`
4. Default (undefined) → Suitable for Vercel