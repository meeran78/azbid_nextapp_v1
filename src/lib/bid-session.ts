/**
 * Session-scoped flag: card was verified for bidding (CVC confirmed once this browser session).
 * Value is the signed-in user id so verification applies to every bid for that user until logout.
 * Cleared on sign-out so the next login requires verification again.
 */

const BID_CARD_VERIFIED_KEY = "azbid_card_verified_session";

/** Pending bid verification (PaymentIntent) so we can complete the bid after a 3DS return_url redirect. */
export const BID_VERIFY_PENDING_KEY = "azbid_bid_verify_pending";

/** True if this browser session already completed card verification for this user. */
export function getCardVerifiedForBidSession(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;
  try {
    return sessionStorage.getItem(BID_CARD_VERIFIED_KEY) === userId;
  } catch {
    return false;
  }
}

export function setCardVerifiedForBidSession(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    sessionStorage.setItem(BID_CARD_VERIFIED_KEY, userId);
  } catch {
    // ignore
  }
}

export function clearCardVerifiedForBidSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BID_CARD_VERIFIED_KEY);
  } catch {
    // ignore
  }
}
