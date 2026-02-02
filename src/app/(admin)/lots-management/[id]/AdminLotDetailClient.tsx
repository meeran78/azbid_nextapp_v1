"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rejectLotAction } from "@/actions/admin-lot.action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Package, Calendar } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Item {
  id: string;
  title: string;
  description: string | null;
  condition: string | null;
  startPrice: number;
  reservePrice: number | null;
  retailPrice: number | null;
  imageUrls: string[];
  category: { name: string } | null;
}

interface Lot {
  id: string;
  title: string;
  description: string | null;
  status: string;
  closesAt: string;
  inspectionAt: string | null;
  removalStartAt: string | null;
  adminNotes: string | null;
  store: { name: string; owner: { name: string; email: string } };
  auction: { title: string; status: string } | null;
  items: Item[];
}

export function AdminLotDetailClient({ lot }: { lot: Lot }) {
  const router = useRouter();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast.error("Please provide admin notes when rejecting");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await rejectLotAction(lot.id, adminNotes);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lot rejected. Seller has been notified.");
        setRejectDialogOpen(false);
        setAdminNotes("");
        router.push("/lots-management");
        router.refresh();
      }
    } catch (err) {
      toast.error("Failed to reject lot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReview = lot.status === "SCHEDULED";

  return (
    <>
      <div className="space-y-6">
        {/* Lot info */}
        <Card>
          <CardHeader>
            <CardTitle>Lot Details</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={lot.status === "SCHEDULED" ? "secondary" : "default"}>
                {lot.status}
              </Badge>
              {lot.auction && (
                <Badge variant="outline">Auction: {lot.auction.title}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lot.description && (
              <p className="text-muted-foreground">{lot.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Closes: {new Date(lot.closesAt).toLocaleString()}</span>
              </div>
              {lot.inspectionAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Inspection: {new Date(lot.inspectionAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            {lot.adminNotes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-sm font-medium">Previous Admin Notes:</p>
                <p className="text-sm text-muted-foreground">{lot.adminNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items ({lot.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {lot.items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <h3 className="font-semibold">Item {idx + 1}: {item.title}</h3>
                  {item.category && (
                    <Badge variant="outline">{item.category.name}</Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span>Condition: {item.condition || "N/A"}</span>
                  <span>Start: ${item.startPrice.toFixed(2)}</span>
                  {item.reservePrice != null && (
                    <span>Reserve: ${item.reservePrice.toFixed(2)}</span>
                  )}
                  {item.retailPrice != null && (
                    <span>Retail: ${item.retailPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Image gallery + zoom */}
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Images</p>
                    <div className="flex flex-wrap gap-2">
                      {item.imageUrls.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setZoomImage(url)}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary"
                        >
                          <Image
                            src={url}
                            alt={`${item.title} - ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Approve / Reject */}
        {canReview && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Reject (Send Back)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Lot</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Provide admin notes. The seller will receive these notes via email.
          </p>
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes *</Label>
            <Textarea
              id="adminNotes"
              placeholder="Explain why the lot is being rejected and what the seller needs to fix..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!adminNotes.trim() || isSubmitting}
            >
              Reject & Notify Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image zoom dialog */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-2">
          {zoomImage && (
            <div className="relative w-full aspect-square">
              <Image
                src={zoomImage}
                alt="Zoomed"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}