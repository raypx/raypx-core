# Docker Deployment Guide

This guide covers how to deploy the RayPX web application using Docker.

## Output Mode Configuration

The Next.js application supports different output modes for different deployment scenarios:

### Environment Variables

- `NEXT_OUTPUT` - Explicitly set output mode (`"standalone"` | `"export"` | undefined)
- `DOCKER_BUILD` - When set to `"true"`, automatically enables standalone mode

### Deployment Scenarios

- **Docker**: Uses `standalone` output (automatically enabled via `DOCKER_BUILD=true`)
- **Vercel**: Uses default output (no environment variable needed)
- **Static Export**: Set `NEXT_OUTPUT=export`

## Quick Start

### Production Deployment

1. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f web
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development with Docker

1. **Use the development compose file:**
   ```bash
   cd apps/web
   docker-compose -f docker-compose.dev.yml up
   ```

## Docker Files

- `apps/web/Dockerfile` - Main production Dockerfile (monorepo-aware)
- `apps/web/Dockerfile.standalone` - Standalone Dockerfile for the web app only
- `docker-compose.yml` - Production Docker Compose configuration
- `apps/web/docker-compose.dev.yml` - Development Docker Compose configuration
- `.dockerignore` - Files and directories to exclude from Docker build context

## Environment Variables

Make sure to configure your environment variables in `.env` file at the project root. The Docker container will automatically load these variables.

## Build Script

Use the provided build script for convenience:
```bash
./scripts/docker-build.sh
```

## Configuration

The Next.js application is configured with `output: "standalone"` to enable Docker deployment with minimal dependencies.

## Volumes and Data

- Application runs on port 3000
- No persistent volumes are configured by default
- Database and Redis services are commented out in docker-compose.yml - uncomment if needed

## Troubleshooting

### Build Issues
- Ensure Docker has enough memory allocated (4GB+ recommended)
- Check that all environment variables are properly set
- Verify that the build works locally first: `cd apps/web && pnpm run build`

### Runtime Issues
- Check container logs: `docker-compose logs web`
- Verify environment variables are properly loaded
- Ensure required external services (database, Redis) are accessible

## Security Notes

- The application runs as a non-root user (`nextjs`)
- Environment files (.env) are excluded from Docker context
- Make sure to use environment variables for sensitive configuration