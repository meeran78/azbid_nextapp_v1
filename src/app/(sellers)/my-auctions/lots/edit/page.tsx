"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Package, Plus, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { createLotSchema, CreateLotFormData } from "@/lib/validations/lot.schema";
import { createLotAction } from "@/actions/create-lot.action";
import { getLotAction } from "@/actions/get-lot.action";
import { ItemFormCard } from "@/app/components/seller/ItemFormCard";
import { truncate } from "node:fs";

export default function EditLotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lotId = searchParams.get("lotId");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLot, setIsLoadingLot] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [error, setError] = useState("");

  const form = useForm<CreateLotFormData>({
    resolver: zodResolver(createLotSchema),
    defaultValues: {
      lotId: "",
      title: "",
      description: "",
      storeId: "",
      auctionId: null,
      lotDisplayId: null,
      closesAt: new Date(),
      removalStartAt: null,
      inspectionAt: null,
      items: [],
      disclaimerAccepted: false,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load lot data and stores on mount
  useEffect(() => {
    async function loadData() {
      if (!lotId) {
        toast.error("Lot ID is required");
        router.push("/my-auctions");
        return;
      }

      setIsLoadingLot(true);
      try {
        // Load lot data
        const lotResult = await getLotAction(lotId);

        if (lotResult.error || !lotResult.lot) {
          toast.error(lotResult.error || "Failed to load lot");
          router.push("/my-auctions");
          return;
        }

        const lot = lotResult.lot;

        // Load stores
        const storesResponse = await fetch("/api/seller/stores");
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData);
        }

        // Convert existing images from URLs to form format
        // For existing images, we'll use objects with just preview (no file)
        const itemsWithImages = lot.items.map((item) => ({
          title: item.title,
          categoryId: item.categoryId || null,
          condition: item.condition || "Used – Good",
          startPrice: item.startPrice,
          retailPrice: item.retailPrice || null,
          reservePrice: item.reservePrice || null,
          description: item.description || "",
          // Convert image URLs to form format (existing images have preview only, no file)
          images: item.imageUrls.map((url) => ({
            preview: url,
            // No file property - this indicates it's an existing image
          } as any)),
          videos: [], // Videos not stored in DB yet
        }));

        // Populate form with lot data
        form.reset({
          lotId: lot.id,
          title: lot.title,
          description: lot.description || "",
          storeId: lot.storeId,
          auctionId: lot.auctionId || null,
          status: lot.status,
          lotDisplayId: lot.lotDisplayId || null,
          closesAt: new Date(lot.closesAt),
          removalStartAt: lot.inspectionAt ? new Date(lot.inspectionAt) : null, // Note: schema uses inspectionAt
          inspectionAt: lot.inspectionAt ? new Date(lot.inspectionAt) : null,
          items: itemsWithImages,
          disclaimerAccepted: true, // Assume accepted if lot exists
          isDraft: lot.status === "DRAFT",
        });
      } catch (error) {
        console.error("Error loading lot:", error);
        toast.error("Failed to load lot data");
        router.push("/my-auctions");
      } finally {
        setIsLoadingLot(false);
      }
    }

    loadData();
  }, [lotId, router, form]);

  const onSubmit = async (data: CreateLotFormData, isDraft: boolean = false) => {
    console.log("data", data);
    console.log("isDraft", isDraft);
    setIsLoading(true);
    setError("");

    try {
      // Upload images and videos first
      const uploadedImageUrls: Record<number, string[]> = {};
      const uploadedVideoUrls: Record<number, string[]> = {};

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];

        // Upload images
        if (item.images && item.images.length > 0) {
          const urls: string[] = [];
          for (const image of item.images) {
            // Check if image has a file property (new upload) or just preview (existing image)
            if (image.file) {
              // New image - upload it
              try {
                const formData = new FormData();
                formData.append("file", image.file);
                formData.append("folder", "auctions/lots");

                const response = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                if (response.ok) {
                  const result = await response.json();
                  urls.push(result.url);
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to upload image");
                }
              } catch (uploadError: any) {
                console.error("Image upload error:", uploadError);
                toast.error(`Failed to upload image: ${uploadError.message}`);
              }
            } else if (image.preview) {
              // Existing image - use the preview URL directly
              urls.push(image.preview);
            }
          }
          uploadedImageUrls[i] = urls;
        }

        // Upload videos
        if (item.videos && item.videos.length > 0) {
          const urls: string[] = [];
          for (const video of item.videos) {
            if (video.file) {
              // New video - upload it
              try {
                const formData = new FormData();
                formData.append("file", video.file);
                formData.append("folder", "auctions/lots");

                const response = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                if (response.ok) {
                  const result = await response.json();
                  urls.push(result.url);
                } else {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to upload video");
                }
              } catch (uploadError: any) {
                console.error("Video upload error:", uploadError);
                toast.error(`Failed to upload video: ${uploadError.message}`);
              }
            } else if (video.preview) {
              // Existing video - use the preview URL directly
              urls.push(video.preview);
            }
          }
          uploadedVideoUrls[i] = urls;
        }
      }

      // Prepare data for server action
      const serverData = {
        lotId: data.lotId, // Include lotId for updates
        title: data.title,
        description: data.description,
        storeId: data.storeId,
        auctionId: data.auctionId,
        lotDisplayId: data.lotDisplayId,
        closesAt: data.closesAt.toISOString(),
        removalStartAt: data.removalStartAt?.toISOString() || null,
        inspectionAt: data.inspectionAt?.toISOString() || null,
        items: data.items.map((item, index) => ({
          title: item.title,
          categoryId: item.categoryId,
          condition: item.condition,
          startPrice: item.startPrice,
          retailPrice: item.retailPrice,
          reservePrice: item.reservePrice,
          description: item.description,
          imageUrls: uploadedImageUrls[index] || [],
          videoUrls: uploadedVideoUrls[index] || [],
        })),
        disclaimerAccepted: data.disclaimerAccepted,
        isDraft: isDraft,
      };

      const result = await createLotAction(serverData);

      if (result.error) {
        const errorMessage = result.details
          ? `${result.error}: ${JSON.stringify(result.details)}`
          : result.error;
        setError(errorMessage);
        toast.error("Error", {
          description: result.error,
          duration: 5000,
        });
      } else {
        toast.success(isDraft ? "Draft Saved!" : "Lot Updated!", {
          description: isDraft
            ? "Your draft has been saved. You can continue editing it later."
            : "Your lot has been updated successfully.",
          duration: 3000,
        });

        setTimeout(() => {
          router.push(`/my-auctions`);
        }, 1000);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      const errorMessage = error.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const data = form.getValues();
    await onSubmit(data, true);
  };

  if (isLoadingLot) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading lot data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/my-auctions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Auctions
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Lot</h1>
          <p className="text-muted-foreground mt-1">
            Update your lot details and items
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(form.getValues(), false) }} className="space-y-6">
            {/* <form  onSubmit={form.handleSubmit((formData: CreateLotFormData) => onSubmit(formData, false) )} className="space-y-6"> */}

            {/* Lot Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Lot Details
                </CardTitle>
                <CardDescription>
                  Basic information about your lot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lot ID (Read-only) */}
                <FormField
                  control={form.control}
                  name="lotDisplayId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot ID</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormDescription>
                        Lot identifier
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Lot Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Lot Title <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lot title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Store Selection */}
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
                            <SelectValue placeholder={stores.length === 0 ? "Loading stores..." : "Select a store"} />
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
                        {stores.length === 0 && "Please create a store first"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lot Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your lot (500-2000 characters)..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/2000 characters (minimum 500)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date/Time Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="closesAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Closing Date & Time <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={
                              field.value
                                ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(e.target.value ? new Date(e.target.value) : new Date())
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inspectionAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspection Date & Time ( Must be after closing date )</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={
                              field.value
                                ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? new Date(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="removalStartAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Removal Start Date & Time ( Must be after closing date )</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={
                              field.value
                                ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? new Date(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Items</CardTitle>
                    <CardDescription>
                      Add items to this lot (at least one required)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        title: "",
                        categoryId: null,
                        condition: "Used – Good",
                        startPrice: 0,
                        retailPrice: null,
                        reservePrice: null,
                        description: "",
                        images: [],
                        videos: [],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <ItemFormCard
                    key={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Disclaimer Section */}
            <Card>
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All items are sold AS-IS, WHERE-IS, with no guarantees or
                    warranties expressed or implied. The seller is responsible
                    for accurate descriptions. Auction terms apply.
                  </AlertDescription>
                </Alert>
                <FormField
                  control={form.control}
                  name="disclaimerAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I acknowledge and accept the disclaimer{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-background border-t p-4 -mx-6 -mb-6 rounded-b-lg shadow-lg">
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading || stores.length === 0}>
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Publishing..." : "Publish Lot"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}