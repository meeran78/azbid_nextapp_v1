/** Shared hero slide type for server and client. */

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  itemImageUrls?: string[];
  auctionClosingAt?: string | null;
  /** Seller spotlight slide: show seller image/name/location and link to store */
  storeId?: string;
  sellerId?: string;
  sellerName?: string;
  sellerImageUrl?: string | null;
  sellerLocation?: string | null;
};

