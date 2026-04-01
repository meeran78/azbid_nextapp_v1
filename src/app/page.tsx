import AuctionHero from "@/components/AuctionHero";
import {
  type HeroSlide,
} from "@/app/components/hero-slides";
import { getFeaturedSellersForHero } from "@/actions/public-seller.action";
import { ActiveStoresSection } from "@/components/ActiveStoresSection";
import { ActiveLotsSection } from "@/app/components/ActiveLotsSection";
import { ShopByCategorySection } from "@/app/components/ShopByCategorySection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import HighlightedFeature from "@/app/components/HighlightedFeature";
// import SocialRedirect from "@/app/components/SocialRedirect";
import SocialMediaLinks from "@/app/components/SocialMediaLinks";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80";

type HomeSearchParams = {
  q?: string;
  status?: string;
  location?: string;
  lot_q?: string;
  lot_status?: string;
  lot_location?: string;
  lot_item?: string;
  lot_category?: string;
};

type HomeProps = {
  searchParams: Promise<HomeSearchParams> | HomeSearchParams;
};

export default async function Home({ searchParams }: HomeProps) {
  const featuredSellers = await getFeaturedSellersForHero(6);
  const sellerSlides: HeroSlide[] = featuredSellers.map((s) => ({
    id: `seller-${s.sellerId}`,
    title: s.sellerName,
    subtitle: s.storeName,
    mediaType: "image" as const,
    mediaUrl: s.sellerImageUrl ?? HERO_FALLBACK_IMAGE,
    storeId: s.storeId,
    sellerId: s.sellerId,
    sellerName: s.sellerName,
    sellerImageUrl: s.sellerImageUrl,
    sellerLocation: s.sellerLocation,
    itemImageUrls: s.itemImageUrls,
    auctionClosingAt: s.auctionClosingAt,
    ctaHref: `/stores/${s.storeId}`,
    ctaLabel: "Start Bidding",
  }));
  const heroSlides: HeroSlide[] = sellerSlides;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AuctionHero slides={heroSlides} />
      <ActiveStoresSection searchParams={searchParams} />    
      <ShopByCategorySection />
      <HowItWorksSection />
      <HighlightedFeature />    
      <SocialMediaLinks />
    </div>
  );
}
