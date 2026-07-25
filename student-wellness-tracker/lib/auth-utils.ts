import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Resolves the current user's id from the session cookie. Every server
 * action in app/actions/ calls this first — it's what makes `where: { id,
 * userId }` on every query meaningful instead of trusting a client-supplied
 * userId (which would be an IDOR waiting to happen).
 */
export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user.id;
}
