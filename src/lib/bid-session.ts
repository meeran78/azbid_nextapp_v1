/**
 * Session-scoped flag: card was verified for bidding (CVC confirmed once).
 * Cleared on logout so the next login requires CVC again.
 */

const BID_CARD_VERIFIED_KEY = "azbid_card_verified_session";

export function getCardVerifiedForBidSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(BID_CARD_VERIFIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCardVerifiedForBidSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BID_CARD_VERIFIED_KEY, "1");
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
