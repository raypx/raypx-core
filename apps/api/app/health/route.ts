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

    return NextResponse.json(health, {
      status: health.status === "ok" ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error || "Health check failed",
      },
      { status: 500 },
    )
  }
}
