import { NextResponse } from "next/server"

export async function GET() {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "0.1.0",
      services: {
        api: "healthy",
      },
    }

    // Optional: Add database health check
    // if (db) {
    //   try {
    //     await db.$queryRaw`SELECT 1`;
    //     health.services.database = 'healthy';
    //   } catch (error) {
    //     health.services.database = 'unhealthy';
    //     health.status = 'degraded';
    //   }
    // }

    return NextResponse.json(health, {
      status: health.status === "ok" ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 },
    )
  }
}
