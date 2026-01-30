"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { approveLotAction, rejectLotAction } from "@/actions/admin-lot.action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, Eye, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

const LOT_STATUSES = ["DRAFT", "SCHEDULED", "LIVE", "SOLD", "UNSOLD", "RESEND"] as const;
const PAGE_SIZE = 10;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    SCHEDULED: "outline",
    LIVE: "default",
    SOLD: "default",
    UNSOLD: "secondary",
    RESEND: "destructive",
};

type LotWithRelations = {
    id: string;
    title: string;
    lotDisplayId: string | null;
    status: string;
    adminNotes: string | null;
    closesAt: Date;
    createdAt: Date;
    store: {
        name: string;
        owner: { name: string; email: string };
    };
    _count: { items: number };
};

interface LotsManagementClientProps {
    lots: LotWithRelations[];
    totalCount: number;
    page: number;
    statusFilter: string;
    searchQuery: string;
}

export function LotsManagementClient({
    lots,
    totalCount,
    page,
    statusFilter,
    searchQuery,
}: LotsManagementClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [rejectLotId, setRejectLotId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const updateParams = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.set("page", "1");
        router.push(`/lots-management?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ search: localSearch.trim() });
    };

    const handleStatusChange = (value: string) => {
        updateParams({ status: value === "all" ? "" : value });
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(newPage));
        router.push(`/lots-management?${params.toString()}`);
    };

    const handleApprove = async (lotId: string) => {
        setIsSubmitting(true);
        try {
            const result = await approveLotAction(lotId);
            if (result.error) toast.error(result.error);
            else {
                toast.success("Lot approved and is now LIVE");
                router.refresh();
            }
        } catch (err) {
            toast.error("Failed to approve lot");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectLotId || !adminNotes.trim()) {
            toast.error("Please provide admin notes when rejecting");
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await rejectLotAction(rejectLotId, adminNotes);
            if (result.error) toast.error(result.error);
            else {
                toast.success("Lot rejected. Seller has been notified.");
                setRejectLotId(null);
                setAdminNotes("");
                router.refresh();
            }
        } catch (err) {
            toast.error("Failed to reject lot");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canReview = (status: string) => status === "SCHEDULED";

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Lot Listing ({totalCount} total)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Review, approve, or send back lots submitted by sellers
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by Lot ID or Seller name..."
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary">Search</Button>
                        </form>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Label className="whitespace-nowrap text-muted-foreground">Status:</Label>
                            <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    {LOT_STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {lots.length === 0 ? (
                        <p className="text-muted-foreground py-12 text-center">
                            No lots found. Try adjusting your filters or search.
                        </p>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
                                <Table className="min-w-[900px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot ID</TableHead>
                                    <TableHead>Lot Title</TableHead>
                                    <TableHead>Seller Name</TableHead>
                                    <TableHead>Scheduled / Close Date</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Admin Notes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lots.map((lot) => (
                                    <TableRow key={lot.id}>
                                        <TableCell className="font-mono text-sm">
                                            {lot.lotDisplayId || lot.id.slice(0, 8)}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={lot.title}>
                                            {lot.title}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{lot.store.owner.name}</p>
                                                <p className="text-xs text-muted-foreground">{lot.store.owner.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div>
                                                <p>Submitted: {new Date(lot.createdAt).toLocaleDateString()}</p>
                                                <p className="text-muted-foreground">
                                                    Closes: {new Date(lot.closesAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{lot._count.items}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusColors[lot.status] ?? "outline"}>{lot.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lot.adminNotes ? (
                                                <div className="max-w-[200px]">
                                                    <p className="text-sm line-clamp-2 text-amber-700 dark:text-amber-400" title={lot.adminNotes}>
                                                        {lot.adminNotes}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-wrap items-center justify-end gap-1">
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={`/lots-management/${lot.id}`}>
                                                        <Eye className="h-4 w-4 mr-1" /> Review
                                                    </Link>
                                                </Button>
                                                {canReview(lot.status) && (
                                                    <>
                                                        <Button size="sm" variant="default" onClick={() => handleApprove(lot.id)} disabled={isSubmitting}>
                                                            <Check className="h-4 w-4 mr-1" /> Make Live
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setRejectLotId(lot.id)} disabled={isSubmitting}>
                                                            <X className="h-4 w-4 mr-1" /> Send Back
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                                </Table>
                            </div>

                            {/* Mobile: card layout */}
                            <div className="md:hidden space-y-4 p-4">
                                {lots.map((lot) => (
                                    <Card key={lot.id}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {lot.lotDisplayId || lot.id.slice(0, 8)}
                                                </span>
                                                <Badge variant={statusColors[lot.status] ?? "outline"}>{lot.status}</Badge>
                                            </div>
                                            <p className="font-medium">{lot.title}</p>
                                            <p className="text-sm text-muted-foreground">{lot.store.owner.name}</p>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <p>Submitted: {new Date(lot.createdAt).toLocaleDateString()}</p>
                                                <p>Closes: {new Date(lot.closesAt).toLocaleString()}</p>
                                                <p>{lot._count.items} item(s)</p>
                                            </div>
                                            {lot.adminNotes && (
                                                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-sm">
                                                    <p className="font-medium text-amber-800 dark:text-amber-300">Admin Notes:</p>
                                                    <p className="line-clamp-2 text-muted-foreground">{lot.adminNotes}</p>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/lots-management/${lot.id}`}>
                                                        <Eye className="h-4 w-4 mr-1" /> Review
                                                    </Link>
                                                </Button>
                                                {canReview(lot.status) && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleApprove(lot.id)} disabled={isSubmitting}>
                                                            <Check className="h-4 w-4 mr-1" /> Make Live
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setRejectLotId(lot.id)} disabled={isSubmitting}>
                                                            <X className="h-4 w-4 mr-1" /> Send Back
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (hasPrevPage) handlePageChange(page - 1); }} className={!hasPrevPage ? "pointer-events-none opacity-50" : ""} />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                                .map((p, idx, arr) => (
                                    <PaginationItem key={p}>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2">…</span>}
                                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }} isActive={p === page}>{p}</PaginationLink>
                                    </PaginationItem>
                                ))}
                            <PaginationItem>
                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (hasNextPage) handlePageChange(page + 1); }} className={!hasNextPage ? "pointer-events-none opacity-50" : ""} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <Dialog open={!!rejectLotId} onOpenChange={() => setRejectLotId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Send Back (Resend) Lot</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Provide admin notes. The seller will receive these notes via email.</p>
                    <div className="space-y-2">
                        <Label htmlFor="adminNotes">Admin Notes *</Label>
                        <Textarea id="adminNotes" placeholder="Explain why the lot is being rejected..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} required />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectLotId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!adminNotes.trim() || isSubmitting}>Send Back & Notify Seller</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}