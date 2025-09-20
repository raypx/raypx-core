import { auth, toNextJsHandler } from "@raypx/auth/server";

const handler = toNextJsHandler(auth);

export const { GET, POST } = handler;
