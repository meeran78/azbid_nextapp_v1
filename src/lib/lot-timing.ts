/**
 * The cron job that actually closes lots (closeExpiredLots) only ever looks at
 * Auction.endAt — never Lot.closesAt. All lots in an auction share one closing clock
 * (Auction.endAt), extended by soft-close bids (see bid.action.ts); Lot.closesAt is
 * the seller-entered value from before the lot was attached to an auction and is not
 * kept in sync afterward, so on its own it is not a safe "this lot is still biddable"
 * signal — nor is it guaranteed to be earlier than Auction.endAt.
 *
 * Use the later of the two as the countdown target so the UI never shows "closing
 * now" while a lot is still actually accepting bids. (This can still under-state the
 * real close time if closesAt was set later than endAt — see approveLotAction, which
 * blocks that combination at approval time.)
 */
export function reconcileAuctionEndAt(
  lotClosesAt: Date,
  auctionEndAt: Date | null | undefined
): Date {
  if (!auctionEndAt) return lotClosesAt;
  return auctionEndAt.getTime() > lotClosesAt.getTime() ? auctionEndAt : lotClosesAt;
}
