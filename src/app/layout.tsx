import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { unstable_cache } from "next/cache";
import "./globals.css";

//Components
import Header from "@/components/Header";
import { CategoryNavBar } from "@/app/components/CategoryNavBar";
import Footer from "@/components/Footer";
import { AiChat } from "@/components/AiChat";
import { BidVerificationResume } from "@/app/components/stripe/BidVerificationResume";

//Shandcn UI Components
import { Toaster } from "@/components/ui/sonner";
import { getLiveScheduledAuctionsCount } from "@/actions/auction.action";

// Cache for 60 s so every page load doesn't hit the DB.
const getCachedAuctionCount = unstable_cache(
  () => getLiveScheduledAuctionsCount(),
  ["live-auction-count"],
  { revalidate: 60 }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AzBid - Online Auction Platform",
  description: "Experience the future of online auctions. Bid smarter, win better.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const liveAuctionCount = await getCachedAuctionCount();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header liveAuctionCount={liveAuctionCount} />
        <CategoryNavBar />
        <BidVerificationResume />
        {children}
        <Footer />
        <AiChat />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
