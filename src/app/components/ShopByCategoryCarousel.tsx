"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ShopCategory } from "@/actions/category-browse.action";
import { Package } from "lucide-react";

type ShopByCategoryCarouselProps = {
  categories: ShopCategory[];
};

export function ShopByCategoryCarousel({ categories }: ShopByCategoryCarouselProps) {
  return (
    <div className="relative w-full px-10 md:px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {categories.map((cat) => (
            <CarouselItem
              key={cat.id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Link
                href={`/categories/${cat.id}`}
                className="group block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[4/3] sm:aspect-[3/4] bg-muted overflow-hidden">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-zinc-800/60">
                      <Package className="h-16 w-16 text-white/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-sm">
                    {cat.itemCount}+ items
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg md:text-xl leading-tight mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {cat.description || `Browse ${cat.name} items.`}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-0 size-10 rounded-full border-2 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-400/50 hover:text-violet-700 dark:hover:text-violet-300 focus-visible:ring-violet-500 disabled:opacity-50"
          aria-label="Previous categories"
        />
        <CarouselNext
          className="right-0 size-10 rounded-full border-2 bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-400/50 hover:text-violet-700 dark:hover:text-violet-300 focus-visible:ring-violet-500 disabled:opacity-50"
          aria-label="Next categories"
        />
      </Carousel>
    </div>
  );
}
