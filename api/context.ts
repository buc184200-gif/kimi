import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  sessionId?: string;
};

function generateSessionId(): string {
  return "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Get or generate session ID for anonymous cart
  const cookieHeader = opts.req.headers.get("cookie") || "";
  const sessionMatch = cookieHeader.match(/sessionId=([^;]+)/);
  if (sessionMatch) {
    ctx.sessionId = sessionMatch[1];
  }

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}

export { generateSessionId };
