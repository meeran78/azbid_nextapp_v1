/**
 * Shared hero slide data and type for server and client.
 * Kept in a non-client file so the server can safely import and spread DEFAULT_HERO_SLIDES.
 */

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Seller spotlight slide: show seller image/name/location and link to store */
  storeId?: string;
  sellerId?: string;
  sellerName?: string;
  sellerImageUrl?: string | null;
  sellerLocation?: string | null;
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    title: "Bid High, Win Big, Smile Bigger",
    subtitle:
      "Discover premium auctions in real-time. Secure bidding. Instant wins.",
    mediaType: "video",
    mediaUrl: "/videos/auction_video.mp4",
  },
  {
    id: "2",
    title: "Live Auctions, Real Excitement",
    subtitle:
      "Join thousands of bidders. Every bid counts. Every win matters.",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80",
  },
  {
    id: "3",
    title: "Your Next Treasure Awaits",
    subtitle:
      "From collectibles to rare finds—place your bid and take it home.",
    mediaType: "image",
    mediaUrl:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1920&q=80",
  },
];
