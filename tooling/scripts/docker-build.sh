#!/bin/bash

# Docker build script for RayPX web application

set -e

echo "🐳 Building Docker image for RayPX Web App"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker-compose build web

echo "✅ Docker image built successfully!"
echo ""
echo "🚀 To start the application, run:"
echo "   docker-compose up -d"
echo ""
echo "🔍 To view logs, run:"
echo "   docker-compose logs -f web"
echo ""
echo "🛑 To stop the application, run:"
echo "   docker-compose down"