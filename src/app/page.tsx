import AuctionHero from "@/components/AuctionHero";
import { ActiveStoresSection } from "@/components/ActiveStoresSection";
import { ActiveLotsSection } from "@/app/components/ActiveLotsSection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import HighlightedFeature from "@/app/components/HighlightedFeature";
import SocialRedirect from "@/app/components/SocialRedirect";
import SocialMediaLinks from "@/app/components/SocialMediaLinks";
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
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AuctionHero />
      <ActiveStoresSection searchParams={searchParams} />
      <ActiveLotsSection searchParams={searchParams} />
      <HowItWorksSection />
      <HighlightedFeature />
    
      <SocialMediaLinks />
    </div>
  );
}
