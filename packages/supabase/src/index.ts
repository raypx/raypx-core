import { createClient } from "@supabase/supabase-js";
import { envs } from "./envs";

const env = envs();

export const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
