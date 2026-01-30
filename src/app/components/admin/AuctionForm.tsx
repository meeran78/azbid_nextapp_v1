"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
  createAuctionAction,
  updateAuctionAction,
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
  };
  stores: Store[];
}

export function AuctionForm({ initialData, stores }: AuctionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionFormSchema) as Resolver<AuctionFormValues>,
    defaultValues: {
      storeId: initialData?.storeId ?? "",
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
          await updateAuctionAction(initialData.id, data);
          toast.success("Auction updated", {
            description: "The auction has been updated successfully.",
          });
        } else {
          await createAuctionAction(data);
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
                    value={field.value}
                    disabled={stores.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                      End Date & Time <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      Must be after start date
                    </FormDescription>
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
