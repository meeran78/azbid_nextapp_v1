import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSellerStores } from "@/actions/seller-dashboard.action";
import { StoresList } from "@/app/components/seller/StoresList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function SellerStoresPage() {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "SELLER") {
        redirect("/");
    }

    const stores = await getSellerStores(session.user.id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/sellers-stores" aria-label="Back to My Auctions">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Store Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your stores, update details, and view stats
                        </p>
                    </div>
                </div>
            </div>

            <StoresList stores={stores} />
        </div>
    );
}
