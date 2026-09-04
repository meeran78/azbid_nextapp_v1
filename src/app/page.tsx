import AuctionHero from "@/components/AuctionHero";
import {
  type HeroSlide,
} from "@/app/components/hero-slides";
import { getFeaturedAuctions, getUpcomingAuctionsForHero } from "@/actions/featured-auctions.action";
import { FeaturedAuctionsSection } from "@/app/components/FeaturedAuctionsSection";
import { ActiveLotsSection } from "@/app/components/ActiveLotsSection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import HighlightedFeature from "@/app/components/HighlightedFeature";
// import SocialRedirect from "@/app/components/SocialRedirect";
import SocialMediaLinks from "@/app/components/SocialMediaLinks";

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80";

type HomeSearchParams = {
  lot_view?: string;
  lot_q?: string;
  lot_status?: string;
  lot_location?: string;
  lot_item?: string;
  lot_store?: string;
  lot_page?: string;
  lot_per_page?: string;
};

type HomeProps = {
  searchParams: Promise<HomeSearchParams> | HomeSearchParams;
};

export default async function Home({ searchParams }: HomeProps) {
  const [upcomingAuctions, featuredAuctions] = await Promise.all([
    getUpcomingAuctionsForHero(),
    getFeaturedAuctions(10),
  ]);
  const heroSlides: HeroSlide[] = upcomingAuctions.map((a) => ({
    id: `auction-${a.id}`,
    title: a.title,
    subtitle: a.description ?? "Bid smarter, win better — reserve your spot for this upcoming auction.",
    mediaType: "image" as const,
    mediaUrl: a.imageUrl ?? HERO_FALLBACK_IMAGE,
    storeId: a.storeId,
    storeLocation: a.storeLocation,
    auctionStartAt: a.startAt.toISOString(),
    ctaHref: `/stores/${a.storeId}`,
    ctaLabel: "Get Started",
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    <AuctionHero slides={heroSlides} /> 
      <FeaturedAuctionsSection auctions={featuredAuctions} />
      <ActiveLotsSection searchParams={searchParams} />
      <HowItWorksSection />
      <HighlightedFeature />    
      <SocialMediaLinks />
    </div>
  );
}
