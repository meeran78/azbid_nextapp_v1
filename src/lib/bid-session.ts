/**
 * Pending bid verification (PaymentIntent) so we can complete the bid after a 3DS
 * return_url redirect. "Verified" state itself lives server-side on User.cardVerifiedAt
 * (see payment.action.ts / bid.action.ts) — placeBidAction is the source of truth for
 * whether a buyer still needs to verify, not anything tracked client-side.
 */
export const BID_VERIFY_PENDING_KEY = "azbid_bid_verify_pending";
