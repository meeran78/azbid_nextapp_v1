import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuctionForm } from "@/app/components/admin/AuctionForm";
import { getAuction, getStoresForAdmin } from "@/actions/auction.action";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditAuctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { id } = await params;
  const [auction, stores] = await Promise.all([
    getAuction(id),
    getStoresForAdmin(),
  ]);

  if (!auction) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-10xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/auctions-management">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auctions
        </Link>
      </Button>

      <AuctionForm
        initialData={{
          id: auction.id,
          storeId: auction.storeId,
          title: auction.title,
          description: auction.description,
          buyersPremium: auction.buyersPremium,
          auctionDisplayId: auction.auctionDisplayId,
          status: auction.status,
          startAt: auction.startAt,
          endAt: auction.endAt,
          softCloseEnabled: auction.softCloseEnabled,
          softCloseWindowSec: auction.softCloseWindowSec,
          softCloseExtendSec: auction.softCloseExtendSec,
          softCloseExtendLimit: auction.softCloseExtendLimit,
        }}
        stores={stores}
      />
    </div>
  );
}
