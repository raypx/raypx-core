import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    name: "Raypx API Server",
    version: "v1",
    description: "Raypx platform API endpoints",
    environment: process.env.NODE_ENV,
    api: "/api/v1",
    health: "/api/v1/health",
    documentation: "https://docs.raypx.com/api",
    endpoints: {
      auth: "/api/v1/auth",
      knowledge: "/api/v1/knowledge",
      users: "/api/v1/users",
      health: "/api/v1/health",
    },
    isBun: process.env.BUN_ENV === "true",
    isNode: process.env.NODE_ENV === "production",
    isVercel: process.env.VERCEL === "true",
  })
}

// export const runtime = "nodejs"
