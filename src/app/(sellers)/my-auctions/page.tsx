import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {

    getSellerStores,
    getSellerAuctions,
    getSellerLots,
} from "@/actions/seller-dashboard.action";

import { AuctionsTable } from "@/app/components/seller/AuctionsTable";
import { LotsTable } from "@/app/components/seller/LotsTable";
import { StoresList } from "@/app/components/seller/StoresList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SellerProfile from "@/app/components/seller/SellerProfile";
import { motion } from "framer-motion";

export default async function SellersDashboardPage({
    searchParams,
}: {
    searchParams: { status?: string; storeId?: string; auctionId?: string };
}) {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "SELLER") {
        redirect("/");
    }

    // Await searchParams before accessing its properties
    const params = await searchParams;

    const [stores, auctions, lots] = await Promise.all([

        getSellerStores(session.user.id),
        getSellerAuctions(
            session.user.id,
            params.status,
            params.storeId
        ),
        getSellerLots(
            session.user.id,
            params.status,
            params.storeId,
            params.auctionId
        ),
    ]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Auctions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your stores, auctions, and lots
                    </p>
                </div>
            </div>

            {/* Seller Profile */}
            <SellerProfile />
            {/* Stores Section */}
            <StoresList stores={stores} />

            {/* Auctions and Lots Tabs */}
            <Tabs defaultValue="lots" className="w-full space-y-4 space-x-4">
                <TabsList className="relative">
                    {["lots", "auctions", "analytics"].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="relative"
                        >
                            {tab.toUpperCase()}



                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="auctions" className="space-y-4">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Auctions</h2>
                            <Select defaultValue="ALL">
                                <SelectTrigger className="w-[380px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="LIVE">Live</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AuctionsTable auctions={auctions} />
                    </div>
                </TabsContent>

                <TabsContent value="lots" className="space-y-4">
                    <div className="bg-card rounded-lg border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold">Lots</h2>
                            <div className="flex items-center gap-3">
                                <Button asChild size="sm">
                                    <Link href="/my-auctions/lots/new">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create New Lot
                                    </Link>
                                </Button>
                                <Select defaultValue="ALL">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Status</SelectItem>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                        <SelectItem value="LIVE">Live</SelectItem>
                                        <SelectItem value="SOLD">Sold</SelectItem>
                                        <SelectItem value="UNSOLD">Unsold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <LotsTable lots={lots} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}