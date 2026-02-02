"use client";

import { useTransition, useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import {
  createAuctionAction,
  updateAuctionAction,
  getLotsByStoreForAdmin,
  type AuctionInput,
} from "@/actions/auction.action";

const auctionFormSchema = z
  .object({
    storeId: z.string().min(1, "Store is required"),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional().nullable(),
    buyersPremium: z.string().max(1000).optional().nullable(),
    status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]),
    startAt: z.string().min(1, "Start date is required"),
    endAt: z.string().min(1, "End date is required"),
    softCloseEnabled: z.boolean().default(true),
    softCloseWindowSec: z.coerce.number().min(0).default(120),
    softCloseExtendSec: z.coerce.number().min(0).default(60),
    softCloseExtendLimit: z.coerce.number().min(0).default(10),
  })
  .refine(
    (d) => {
      if (d.startAt && d.endAt) {
        return new Date(d.endAt) > new Date(d.startAt);
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endAt"] }
  );

type AuctionFormValues = z.infer<typeof auctionFormSchema>;

interface Store {
  id: string;
  name: string;
}

type StoreLot = {
  id: string;
  title: string;
  lotDisplayId: string | null;
  status: string;
  _count: { items: number };
};

type AuctionLotItem = {
  id: string;
  title: string;
  description: string | null;
  condition: string | null;
  startPrice: number;
  reservePrice: number | null;
  retailPrice: number | null;
  imageUrls?: string[];
  category: { name: string } | null;
};

type AuctionLot = {
  id: string;
  title: string;
  lotDisplayId: string | null;
  status: string;
  items: AuctionLotItem[];
};

function AuctionLotsAndItems({ lots }: { lots: AuctionLot[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lots & Items ({lots.length} lots)
        </CardTitle>
        <CardDescription>
          Lots associated with this auction and their items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {lots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No lots associated with this auction.
          </p>
        ) : (
        lots.map((lot) => (
          <Collapsible key={lot.id} defaultOpen={lots.length <= 3} className="group">
            <div className="rounded-lg border">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lot.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {lot.lotDisplayId || lot.id.slice(0, 8)} · {lot.status}
                      </p>
                    </div>
                    <Badge variant="outline">{lot.items.length} items</Badge>
                  </div>
                  <Link
                    href={`/lots-management/${lot.id}`}
                    className="text-sm text-primary hover:underline shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </Link>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t px-4 py-3 space-y-2 bg-muted/30">
                  {lot.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items</p>
                  ) : (
                    lot.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-2 px-3 rounded-md bg-background border text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{item.title}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                            {item.category && (
                              <span>{item.category.name}</span>
                            )}
                            {item.condition && (
                              <span>· {item.condition}</span>
                            )}
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <span>· {item.imageUrls.length} image{item.imageUrls.length !== 1 ? "s" : ""}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="font-medium">
                            ${item.startPrice.toFixed(2)}
                          </span>
                          {item.reservePrice != null && (
                            <span className="text-xs text-muted-foreground block">
                              Reserve ${item.reservePrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))
        )}
      </CardContent>
    </Card>
  );
}

interface AuctionFormProps {
  initialData?: {
    id: string;
    storeId: string;
    title: string;
    description: string | null;
    status: string;
    startAt: Date;
    endAt: Date;
    softCloseEnabled: boolean;
    softCloseWindowSec: number;
    softCloseExtendSec: number;
    softCloseExtendLimit: number;
    buyersPremium?: string | null;
    auctionDisplayId?: string | null;
    lots?: AuctionLot[];
  };
  stores: Store[];
}

export function AuctionForm({ initialData, stores }: AuctionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [storeLots, setStoreLots] = useState<StoreLot[]>([]);
  const [selectedLotIds, setSelectedLotIds] = useState<Set<string>>(new Set());
  const [lotsLoading, setLotsLoading] = useState(false);
  const isEditing = !!initialData;

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionFormSchema) as Resolver<AuctionFormValues>,
    defaultValues: {
      storeId: initialData?.storeId ?? "" as string,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      buyersPremium: initialData?.buyersPremium ?? "",
      status: (initialData?.status ?? "DRAFT") as AuctionFormValues["status"],
      startAt: initialData?.startAt
        ? new Date(initialData.startAt).toISOString().slice(0, 16)
        : "",
      endAt: initialData?.endAt
        ? new Date(initialData.endAt).toISOString().slice(0, 16)
        : "",
      softCloseEnabled: initialData?.softCloseEnabled ?? true,
      softCloseWindowSec: initialData?.softCloseWindowSec ?? 120,
      softCloseExtendSec: initialData?.softCloseExtendSec ?? 60,
      softCloseExtendLimit: initialData?.softCloseExtendLimit ?? 10,
    },
  });

  const storeId = useWatch({ control: form.control, name: "storeId", defaultValue: "" }) as string;

  // Load store lots when store is selected (both new and edit)
  // Create: only available lots (auctionId: null). Edit: available + lots already in this auction
  useEffect(() => {
    if (storeId) {
      setLotsLoading(true);
      getLotsByStoreForAdmin(storeId, isEditing && initialData ? { forAuctionId: initialData.id } : undefined)
        .then((lots) => {
          setStoreLots(lots);
          // When editing same store, pre-select lots already associated with this auction
          if (isEditing && initialData?.lots && storeId === initialData.storeId) {
            const associatedIds = new Set(initialData.lots.map((l) => l.id));
            setSelectedLotIds(associatedIds);
          } else {
            setSelectedLotIds(new Set());
          }
        })
        .catch(() => {
          setStoreLots([]);
          setSelectedLotIds(new Set());
        })
        .finally(() => setLotsLoading(false));
    } else {
      setStoreLots([]);
      setSelectedLotIds(new Set());
    }
  }, [storeId, isEditing, initialData?.id, initialData?.lots]);

  const toggleLotSelection = (lotId: string) => {
    setSelectedLotIds((prev) => {
      const next = new Set(prev);
      if (next.has(lotId)) {
        next.delete(lotId);
      } else {
        next.add(lotId);
      }
      return next;
    });
  };

  const onSubmit = async (values: AuctionFormValues) => {
    startTransition(async () => {
      try {
        const data: AuctionInput = {
          storeId: values.storeId,
          title: values.title,
          description: values.description?.trim() || null,
          buyersPremium: values.buyersPremium?.trim() || null,
          status: values.status,
          startAt: new Date(values.startAt),
          endAt: new Date(values.endAt),
          softCloseEnabled: values.softCloseEnabled,
          softCloseWindowSec: values.softCloseWindowSec,
          softCloseExtendSec: values.softCloseExtendSec,
          softCloseExtendLimit: values.softCloseExtendLimit,
        };

        if (isEditing && initialData) {
          await updateAuctionAction(initialData.id, data, Array.from(selectedLotIds));
          toast.success("Auction updated", {
            description: "The auction has been updated successfully.",
          });
        } else {
          await createAuctionAction(data, Array.from(selectedLotIds));
          toast.success("Auction created", {
            description: "The auction has been created successfully.",
          });
        }

        router.push("/auctions-management");
        router.refresh();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to save auction.";
        toast.error("Error", { description: message });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Auction" : "Create New Auction"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update auction information"
            : "Add a new auction for a store"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="storeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Store <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={stores.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={stores.length === 0 ? "No active stores" : "Select store"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The store that owns this auction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {storeId && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">{isEditing ? "Associated Lots" : "Associate Lots"}</h4>
                <FormDescription>
                  {isEditing
                    ? "Select lots from this store. Only available lots (not in another auction) can be added."
                    : "Select available lots from this store. Lots already in another auction are not shown."}
                </FormDescription>
                {lotsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading lots...</p>
                ) : storeLots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lots found for this store.</p>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {storeLots.map((lot) => (
                      <div
                        key={lot.id}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLotIds.has(lot.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleLotSelection(lot.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedLotIds.has(lot.id)}
                            onCheckedChange={() => toggleLotSelection(lot.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{lot.title}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {lot.lotDisplayId || lot.id.slice(0, 8)} · {lot.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm text-muted-foreground">
                            {lot._count.items} item{lot._count.items !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedLotIds.size > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedLotIds.size} lot{selectedLotIds.size !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spring 2025 Auction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this auction..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && initialData?.auctionDisplayId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Auction Display ID</label>
                <Input
                  value={initialData.auctionDisplayId}
                  readOnly
                  className="bg-muted font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated unique identifier (read-only)
                </p>
              </div>
            )}

            {isEditing && (
              <AuctionLotsAndItems lots={initialData?.lots ?? []} />
            )}

            {!isEditing && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium">Auction Display ID</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Will be auto-generated as FL-YYYY-XXXXXX when created
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="buyersPremium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer&apos;s Premium</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 15% buyer's premium applies to all lots"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Free text describing the buyer&apos;s premium for this auction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date & Time <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date & Time ( Must be after start date )<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    {/* <FormDescription>
                      Must be after start date
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium">Soft Close Settings</h4>
              <FormField
                control={form.control}
                name="softCloseEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable soft close</FormLabel>
                      <FormDescription>
                        Extend auction when bids come in near closing time
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("softCloseEnabled") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <FormField
                    control={form.control}
                    name="softCloseWindowSec"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Window (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Seconds before close to trigger</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="softCloseExtendSec"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extend (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Seconds to extend per bid</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="softCloseExtendLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Extensions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Maximum number of extensions</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Auction"
                    : "Create Auction"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
