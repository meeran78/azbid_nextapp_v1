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

export default async function BuyersDashboardPage() {
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
        <h1 className="text-3xl font-bold">Buyers Dashboard</h1>
        
      </div>


    </div>
  );
}