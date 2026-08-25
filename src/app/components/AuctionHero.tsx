'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { AUCTION_TIME_ZONE } from "@/lib/timezone";
import { type HeroSlide } from "./hero-slides";

type AuctionHeroProps = {
  slides: HeroSlide[];
};

export default function AuctionHero({ slides }: AuctionHeroProps) {
  const [show, setShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const heroSlides = slides;
  const currentSlide = heroSlides[activeIndex];

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
  };

  if (!currentSlide) {
    return null;
  }

  const startDate = currentSlide.auctionStartAt ? new Date(currentSlide.auctionStartAt) : null;
  const dateLabel = startDate ? formatInTimeZone(startDate, AUCTION_TIME_ZONE, "MMMM d") : null;
  const timeLabel = startDate ? formatInTimeZone(startDate, AUCTION_TIME_ZONE, "h:mm a") : null;

  return (
    <section className="relative h-[650px] w-full overflow-hidden">
      {currentSlide.mediaType === "video" ? (
        <video
          key={currentSlide.id}
          className="absolute top-0 left-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={currentSlide.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          key={currentSlide.id}
          className="absolute top-0 left-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${currentSlide.mediaUrl}")` }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="max-w-3xl text-center text-white">
          {dateLabel && (
            <p
              key={`eyebrow-${currentSlide.id}`}
              className={`text-sm md:text-base uppercase tracking-widest text-violet-300 font-medium transition-all duration-1000
                ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              `}
            >
              Next Auction on {dateLabel}
            </p>
          )}

          <motion.h1
            key={`title-${currentSlide.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`mt-3 text-3xl md:text-6xl font-extrabold tracking-tight transition-all duration-1000 ease-out
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}
          >
            {timeLabel ? <>Auction starts at {timeLabel}</> : currentSlide.title}
          </motion.h1>

          <p
            key={`subtitle-${currentSlide.id}`}
            className={`mt-6 text-lg md:text-xl text-gray-200 transition-all duration-1000 delay-200
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}
          >
            {currentSlide.subtitle}
          </p>

          {currentSlide.storeLocation && (
            <div
              className={`mt-3 inline-flex items-center gap-2 text-gray-300 text-sm transition-all duration-1000 delay-200
                ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
              `}
            >
              <MapPin className="h-4 w-4 text-violet-300" />
              <span>{currentSlide.storeLocation}</span>
            </div>
          )}

          <div
            className={`mt-10 flex justify-center transition-all duration-1000 delay-400
              ${show ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
          >
            <Link
              href={currentSlide.ctaHref ?? "/live-auctions"}
              className="rounded-xl bg-violet-600 text-white px-10 py-4 text-lg font-semibold hover:bg-violet-700 transition inline-block"
            >
              {currentSlide.ctaLabel ?? "Get Started"}
            </Link>
          </div>
        </div>
      </div>

      {heroSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex ? "bg-white" : "bg-white/45"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
