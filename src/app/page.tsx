import AuctionHero from "@/components/AuctionHero";
import { ActiveStoresSection } from "@/components/ActiveStoresSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AuctionHero />
      <ActiveStoresSection />
    </div>
  );
}
