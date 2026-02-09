import { NextResponse } from "next/server";
import { closeExpiredLots } from "@/actions/close-expired-lots.action";

/**
 * Auto-close lots backend job (cron).
 *
 * Runs periodically to:
 * 1. Find LIVE lots where closesAt has passed
 * 2. Close each lot (SOLD/UNSOLD), create Order + Invoice per winning buyer
 * 3. Auto-charge buyer's saved payment method (Stripe); if none or charge fails, invoice stays PENDING
 * 4. Email buyers and seller
 *
 * Schedule: vercel.json crons hit this every minute. For external cron (e.g. GitHub Actions),
 * call with GET or POST. Set CRON_SECRET in env and send it as Authorization: Bearer <CRON_SECRET>
 * or x-cron-secret header. If CRON_SECRET is set and missing/wrong, returns 401.
 */
async function handleCron(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = request.headers.get("x-cron-secret");
  const secret = process.env.CRON_SECRET;

  if (secret && secret.length > 0) {
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : cronSecret;
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

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
