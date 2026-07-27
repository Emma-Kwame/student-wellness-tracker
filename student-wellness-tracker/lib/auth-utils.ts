import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Every dashboard layout/page/action calls this at least once per request.
// React's cache() dedupes it per request so a single navigation only pays
// for one session round trip instead of one per layout/page that needs it.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Resolves the current user's id from the session cookie. Every server
 * action in app/actions/ calls this first — it's what makes `where: { id,
 * userId }` on every query meaningful instead of trusting a client-supplied
 * userId (which would be an IDOR waiting to happen).
 */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user.id;
}
