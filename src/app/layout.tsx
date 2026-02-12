import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

//Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";

//Shandcn UI Components
import { Toaster } from "@/components/ui/sonner";
import { getLiveScheduledAuctionsCount } from "@/actions/auction.action";

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
  const liveAuctionCount = await getLiveScheduledAuctionsCount();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header liveAuctionCount={liveAuctionCount} />
        {children}
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
