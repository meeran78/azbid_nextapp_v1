import { notFound } from "next/navigation";
import Link from "next/link";
import { getItemsByCategory } from "@/actions/category-browse.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { CategoryItemsGrid } from "@/app/components/CategoryItemsGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: categoryId } = await params;
  const [data, favouriteItemIds, watchedItemIds] = await Promise.all([
    getItemsByCategory(categoryId),
    getUserFavouriteItemIds(),
    getUserWatchedItemIds(),
  ]);

  if (!data) notFound();

  const { category, items } = data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* <Button variant="ghost" asChild className="mb-6">
        <Link href="/#shop-by-category">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to categories
        </Link>
      </Button> */}

      <div className="border-b pb-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {items.length} item{items.length !== 1 ? "s" : ""} with bidding
        </p>
      </div>

      <CategoryItemsGrid
        items={items}
        favouriteItemIds={favouriteItemIds}
        watchedItemIds={watchedItemIds}
      />
    </div>
  );
}
