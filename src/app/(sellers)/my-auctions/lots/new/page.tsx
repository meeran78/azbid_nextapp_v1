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
import { ItemFormCard } from "@/app/components/seller/ItemFormCard";

// Generate human-friendly lot ID
function generateLotId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `LOT-${year}-${random}`;
}

export default function CreateLotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const auctionId = searchParams.get("auctionId");

  const [isLoading, setIsLoading] = useState(false);
  const [lotId] = useState(generateLotId());
  const [stores, setStores] = useState<any[]>([]);
  const [error, setError] = useState("");

  // Set default closing date to tomorrow
  const defaultClosesAt = new Date();
  defaultClosesAt.setDate(defaultClosesAt.getDate() + 1);
  defaultClosesAt.setHours(18, 0, 0, 0); // 6 PM

  const form = useForm<CreateLotFormData>({
    resolver: zodResolver(createLotSchema),
    defaultValues: {
      lotId,
      title: `Lot ${lotId}`,
      description: "",
      storeId: storeId || "",
      auctionId: auctionId || null,
      closesAt: defaultClosesAt,
      removalStartAt: null,
      inspectionAt: null,
      startPrice: 0,
      reservePrice: null,
      items: [
        {
          title: "",
          category: "Other",
          condition: "Used – Good",
          retailPrice: null,
          reservePrice: null,
          description: "",
          images: [],
        },
      ],
      disclaimerAccepted: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch stores on mount
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("/api/seller/stores");
        if (response.ok) {
          const data = await response.json();
          setStores(data);
          
          // If storeId is in URL and not in form, set it
          if (storeId && !form.getValues("storeId")) {
            form.setValue("storeId", storeId);
          }
        } else {
          toast.error("Failed to load stores");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast.error("Failed to load stores");
      }
    }
    fetchStores();
  }, [storeId, form]);

  const onSubmit = async (data: CreateLotFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Upload images first
      const uploadedImageUrls: Record<number, string[]> = {};

      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (item.images && item.images.length > 0) {
          const urls: string[] = [];
          for (const image of item.images) {
            try {
              const formData = new FormData();
              formData.append("file", image.file);

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
              // Continue with other images even if one fails
            }
          }
          uploadedImageUrls[i] = urls;
        }
      }

      // Prepare data for server action (serialize dates and replace images with URLs)
      const serverData = {
        title: data.title,
        description: data.description,
        storeId: data.storeId,
        auctionId: data.auctionId,
        closesAt: data.closesAt.toISOString(),
        removalStartAt: data.removalStartAt?.toISOString() || null,
        inspectionAt: data.inspectionAt?.toISOString() || null,
        startPrice: data.startPrice,
        reservePrice: data.reservePrice,
        items: data.items.map((item, index) => ({
          title: item.title,
          category: item.category,
          condition: item.condition,
          retailPrice: item.retailPrice,
          reservePrice: item.reservePrice,
          description: item.description,
          imageUrls: uploadedImageUrls[index] || [],
        })),
        disclaimerAccepted: data.disclaimerAccepted,
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
        toast.success("Lot Created!", {
          description: "Your lot has been created successfully.",
          duration: 3000,
        });

        setTimeout(() => {
          router.push(`/sellers-dashboard/lots/${result.lot?.id}`);
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
    // For now, just save as draft with same submission
    // You can add a status field later
    onSubmit(data);
  };

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
          <h1 className="text-3xl font-bold">Create New Lot</h1>
          <p className="text-muted-foreground mt-1">
            Add a new lot with items to your auction
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="lotId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot ID</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted" />
                      </FormControl>
                      <FormDescription>
                        Auto-generated lot identifier
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

                {/* Starting Price */}
                <FormField
                  control={form.control}
                  name="startPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Starting Price <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-7"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reserve Price */}
                <FormField
                  control={form.control}
                  name="reservePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserve Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-7"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                          />
                        </div>
                      </FormControl>
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
                        <FormLabel>Inspection Date & Time</FormLabel>
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
                        <FormDescription>
                          Must be before closing date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="removalStartAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Removal Start Date & Time</FormLabel>
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
                        <FormDescription>
                          Must be after closing date
                        </FormDescription>
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
                        category: "Other",
                        condition: "Used – Good",
                        retailPrice: null,
                        reservePrice: null,
                        description: "",
                        images: [],
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