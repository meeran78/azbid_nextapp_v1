import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    getSellerAuctions,
    getSellerFlowStatus,
    getSellerLots,
} from "@/actions/seller-dashboard.action";
import { getSellerSoftCloseAnalytics } from "@/actions/soft-close-analytics.action";


import { AuctionsTable } from "@/app/components/seller/AuctionsTable";

import { SoftCloseAnalyticsCard } from "@/app/components/analytics/SoftCloseAnalyticsCard";
import { LotsTable } from "@/app/components/seller/LotsTable";
import { StatusFilter } from "@/app/components/seller/StatusFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Store } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SellerProfile from "@/app/components/seller/SellerProfile";
import { motion } from "framer-motion";

export default async function SellersDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; storeId?: string; auctionId?: string }>;
}) {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
        redirect("/sign-in");
    }

    if (session.user.role !== "SELLER") {
        redirect("/");
    }

    const params = await searchParams;

    const [auctions, lots, softCloseAnalytics, flowStatus] = await Promise.all([
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
        getSellerSoftCloseAnalytics(session.user.id),
        getSellerFlowStatus(session.user.id),
    ]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Auctions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your auctions and lots
                    </p>
                </div>
                {/* <Button variant="outline" size="sm" asChild>
                    <Link href="/my-auctions/stores" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Manage stores
                    </Link>
                </Button> */}
            </div>

            {/* Seller Profile */}
            <SellerProfile />

            {(!flowStatus.activeStoresCount || (!lots.length && !auctions.length)) && (
                <Alert className="border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <AlertTitle className="font-semibold">Next steps to launch your first listing</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                        {!flowStatus.activeStoresCount ? (
                            <Button asChild size="sm" variant="outline">
                                <Link href="/sellers-stores/new">Create a store</Link>
                            </Button>
                        ) : null}
                        {flowStatus.activeStoresCount && !lots.length ? (
                            <Button asChild size="sm" variant="outline">
                                <Link href="/my-auctions/lots/new">Create your first lot</Link>
                            </Button>
                        ) : null}
                        <span className="text-sm text-muted-foreground">
                            {flowStatus.pendingStoresCount > 0
                                ? "Your store is waiting for admin approval before listings can be published."
                                : "Once your store is active, you can publish lots and connect them to auctions."}
                        </span>
                    </AlertDescription>
                </Alert>
            )}

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
                            <StatusFilter
                                triggerClassName="w-[380px]"
                                options={[
                                    { value: "ALL", label: "All Status" },
                                    { value: "DRAFT", label: "Draft" },
                                    { value: "SCHEDULED", label: "Scheduled" },
                                    { value: "LIVE", label: "Live" },
                                    { value: "COMPLETED", label: "Completed" },
                                ]}
                            />
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
                                <StatusFilter
                                    triggerClassName="w-[180px]"
                                    options={[
                                        { value: "ALL", label: "All Status" },
                                        { value: "DRAFT", label: "Draft" },
                                        { value: "SCHEDULED", label: "Scheduled" },
                                        { value: "LIVE", label: "Live" },
                                        { value: "SOLD", label: "Sold" },
                                        { value: "UNSOLD", label: "Unsold" },
                                    ]}
                                />
                            </div>
                        </div>
                        <LotsTable lots={lots} />
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <SoftCloseAnalyticsCard data={softCloseAnalytics} />
                </TabsContent>
            </Tabs>
        </div>
    );
}