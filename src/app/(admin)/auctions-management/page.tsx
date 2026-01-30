import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuctions } from "@/actions/auction.action";
import { AuctionList } from "@/app/components/admin/AuctionList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AuctionsManagementPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const auctions = await getAuctions();

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-10xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Auctions Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage auctions for stores
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auctions-management/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Auction
          </Link>
        </Button>
      </div>

      <AuctionList auctions={auctions} />
    </div>
  );
}
