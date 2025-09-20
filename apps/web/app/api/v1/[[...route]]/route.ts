import { createApp, vercel } from "@raypx/server";

const app = createApp({
  prefix: "/api/v1",
});

const handler = vercel(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;

export const runtime = "nodejs";
