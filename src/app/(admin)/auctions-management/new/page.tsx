import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuctionForm } from "@/app/components/admin/AuctionForm";
import { getStoresForAdmin } from "@/actions/auction.action";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewAuctionPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const stores = await getStoresForAdmin();

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-10xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/auctions-management">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auctions
        </Link>
      </Button>

      <AuctionForm stores={stores} />
    </div>
  );
}
