import Link from "next/link";
import { getCategoriesForShopCarousel } from "@/actions/category-browse.action";
import { CategoryNavList } from "@/app/components/CategoryNavList";

export async function CategoryNavBar() {
  const categories = await getCategoriesForShopCarousel();
  if (categories.length === 0) return null;

  return (
    <div className="border-b border-border bg-background">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 text-sm">
        <CategoryNavList categories={categories} />
        <Link
          href="/browse-categories"
          className="ml-auto whitespace-nowrap font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          Explore Categories
        </Link>
      </nav>
    </div>
  );
}
