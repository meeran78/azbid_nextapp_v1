import { NextResponse } from "next/server";
import { closeExpiredLots } from "@/actions/close-expired-lots.action";

/**
 * Cron endpoint to close expired lots (soft close auto-close).
 * Call this periodically (e.g. every minute) via Vercel Cron, GitHub Actions, or external cron.
 *
 * Protection: Pass CRON_SECRET in Authorization header (Bearer token) or x-cron-secret header.
 * Set CRON_SECRET in env to enable. If not set, endpoint returns 401.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");
  const secret = process.env.CRON_SECRET;

  if (secret && secret.length > 0) {
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : cronSecret;
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await closeExpiredLots();
    return NextResponse.json({
      success: true,
      closed: result.closed,
      errors: result.errors,
    });
  } catch (error) {
    console.error("close-expired-lots cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
