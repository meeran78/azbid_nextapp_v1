/**
 * Business rules for bid increments (non-negotiable).
 * - If starting bid / current highest bid is $0 → minimum next bid increment = $1
 * - If current highest bid reaches $10 → minimum increment = $2
 * - Scale continues up to $1000+
 * User cannot override; all bids must be >= getMinimumNextBid(currentPrice).
 */

const INCREMENT_TIERS: { maxPrice: number; increment: number }[] = [
  { maxPrice: 0, increment: 1 },
  { maxPrice: 9.99, increment: 1 },
  { maxPrice: 24.99, increment: 2 },
  { maxPrice: 49.99, increment: 5 },
  { maxPrice: 99.99, increment: 5 },
  { maxPrice: 249.99, increment: 10 },
  { maxPrice: 499.99, increment: 25 },
  { maxPrice: 999.99, increment: 50 },
  { maxPrice: Number.POSITIVE_INFINITY, increment: 100 },
];

/**
 * Returns the minimum bid increment in dollars for a given current (or starting) price.
 * Rules apply automatically; user cannot override.
 */
export function getMinimumIncrement(currentPrice: number): number {
  const price = Math.max(0, Number(currentPrice));
  const tier = INCREMENT_TIERS.find((t) => price <= t.maxPrice);
  return tier?.increment ?? 100;
}

/**
 * Returns the minimum allowed next bid (current price + minimum increment).
 * All bids must be >= this value and greater than the current highest bid.
 */
export function getMinimumNextBid(currentPrice: number): number {
  const price = Math.max(0, Number(currentPrice));
  const increment = getMinimumIncrement(price);
  return roundToTwoDecimals(price + increment);
}

function roundToTwoDecimals(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Validates that a bid amount is valid: greater than current price and aligned with minimum increment.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateBidAmount(
  amount: number,
  currentPrice: number
): { valid: true } | { valid: false; error: string } {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: "Invalid bid amount." };
  }
  const price = Math.max(0, Number(currentPrice));
  if (amount <= price) {
    const minNext = getMinimumNextBid(price);
    return {
      valid: false,
      error: `Bid must be greater than current price. Minimum bid is $${minNext.toFixed(2)}.`,
    };
  }
  const minNext = getMinimumNextBid(price);
  if (amount < minNext) {
    const increment = getMinimumIncrement(price);
    return {
      valid: false,
      error: `Minimum bid is $${minNext.toFixed(2)} (current $${price.toFixed(2)} + $${increment} minimum increment).`,
    };
  }
  return { valid: true };
}
