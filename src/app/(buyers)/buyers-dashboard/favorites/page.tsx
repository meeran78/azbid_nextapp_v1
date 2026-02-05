import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBuyerFavouriteItems } from "@/actions/item-favourite.action";
import { getBuyerWatchedItems } from "@/actions/item-watch.action";
import { BuyerFavouritesList } from "@/app/components/buyer/BuyerFavouritesList";
import { BuyerWatchlist } from "@/app/components/buyer/BuyerWatchlist";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Gavel } from "lucide-react";

export default async function BuyersFavoritesPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "BUYER") {
    redirect("/");
  }

  const [favouriteItems, watchedItems] = await Promise.all([
    getBuyerFavouriteItems(),
    getBuyerWatchedItems(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
      <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground mt-1">
          Manage your favourite items, watchlist, and bids
          </p>
       
      
      </div>

      <Tabs defaultValue="favourites" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="favourites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favourites ({favouriteItems.length})
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Watchlist ({watchedItems.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="favourites" className="space-y-4">
          <BuyerFavouritesList items={favouriteItems} />
        </TabsContent>
        <TabsContent value="watchlist" className="space-y-4">
          <BuyerWatchlist items={watchedItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}