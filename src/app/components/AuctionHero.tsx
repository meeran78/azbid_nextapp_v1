'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StartBiddingButton } from "./StartBiddingButton";
export default function AuctionHero() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <section className="relative h-[650px] w-full overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/auction_video.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-4xl text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-2xl md:text-6xl lg:text-7xl font-extrabold tracking-tight transition-all duration-1000 ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}
          >
            Bid High, Win Big, Smile Bigger
          </motion.h1>

          <p
            className={`mt-6 text-lg md:text-xl text-gray-200 transition-all duration-1000 delay-200
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}
          >
            Discover premium auctions in real-time. Secure bidding. Instant wins.
          </p>

          <div
            className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-400
              ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
          >

            <StartBiddingButton />
            <button className="rounded-xl border border-white/30 px-8 py-4 text-lg font-semibold hover:bg-white/10 transition">
              View Auctions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
