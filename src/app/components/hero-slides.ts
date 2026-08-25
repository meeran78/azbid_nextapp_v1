/** Shared hero slide type for server and client. */

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Upcoming (not-yet-started) auction this slide announces. */
  auctionStartAt?: string | null;
  storeId?: string;
  storeLocation?: string | null;
};
