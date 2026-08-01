/**
 * The cron job that actually closes lots (closeExpiredLots) only ever looks at
 * Lot.closesAt — never Auction.endAt. A lot's own closesAt can be pushed later than
 * its auction's endAt by soft-close extensions (see bid.action.ts), so Auction.endAt
 * alone is not a safe "this lot is still biddable" signal.
 *
 * Use the later of the two as the countdown target so the UI never shows "closing
 * now" while a lot is still actually accepting bids.
 */
export function reconcileAuctionEndAt(
  lotClosesAt: Date,
  auctionEndAt: Date | null | undefined
): Date {
  if (!auctionEndAt) return lotClosesAt;
  return auctionEndAt.getTime() > lotClosesAt.getTime() ? auctionEndAt : lotClosesAt;
}
