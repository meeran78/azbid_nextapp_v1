import { getCategoriesForShopCarousel } from "@/actions/category-browse.action";
import { ShopByCategoryCarousel } from "@/app/components/ShopByCategoryCarousel";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export async function ShopByCategorySection() {
  const categories = await getCategoriesForShopCarousel();

  if (categories.length === 0) return null;

  return (
    <section id="shop-by-category" className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Badge
          variant="outline"
          className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30"
        >
          <Layers className="h-3.5 w-3.5 mr-1.5 inline" />
          BROWSE CATEGORIES
        </Badge>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
        Shop by <span className="text-violet-600 dark:text-violet-400 italic">Category</span>
      </h2>
      <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
        Discover amazing deals across all our product categories.
      </p>
      <ShopByCategoryCarousel categories={categories} />
    </section>
  );
}
