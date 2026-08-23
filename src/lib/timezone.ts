import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * All auction/lot schedule fields (Auction.startAt/endAt, Lot.closesAt/inspectionAt/
 * removalStartAt) are entered and displayed in Eastern Time regardless of the browser's
 * local timezone. This keeps auction timing unambiguous across sellers, buyers, and admins
 * in different timezones. Storage remains a plain UTC instant (Prisma DateTime) — only the
 * entry/display layer is pinned to this zone.
 */
export const AUCTION_TIME_ZONE = "America/New_York";

/**
 * Format a stored UTC instant as the wall-clock value an <input type="datetime-local">
 * expects ("yyyy-MM-ddTHH:mm"), representing that instant's Eastern Time.
 */
export function toEasternInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return formatInTimeZone(d, AUCTION_TIME_ZONE, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Parse an <input type="datetime-local"> value ("yyyy-MM-ddTHH:mm", no zone) as Eastern
 * Time wall-clock and return the equivalent UTC instant.
 */
export function fromEasternInputValue(value: string): Date {
  return fromZonedTime(value, AUCTION_TIME_ZONE);
}

/**
 * Format a stored UTC instant for display, always in Eastern Time with an explicit
 * zone abbreviation (EST/EDT) so it reads unambiguously for viewers in other timezones.
 */
export function formatEastern(
  date: Date | string,
  pattern = "MMM d, yyyy h:mm a"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(d, AUCTION_TIME_ZONE, `${pattern} zzz`);
}
