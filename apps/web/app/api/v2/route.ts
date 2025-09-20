import { db } from "@raypx/supabase";

export async function GET() {
  const start = Date.now();
  const { data } = await db.from("user").select("*");
  const end = Date.now();
  console.log(`Time taken: ${end - start}ms`);
  return Response.json(data);
}
