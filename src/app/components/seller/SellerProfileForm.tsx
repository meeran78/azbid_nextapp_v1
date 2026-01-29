"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SellerProfileInput, updateSellerProfileAction } from "@/actions/seller-profile.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { US_STATES } from "@/lib/constants/us-states";

const formSchema = z.object({
    companyName: z.string().min(1, "Company name is required").max(255),
    companyRegistrationNumber: z.string().max(50).optional().nullable(),
    companyDescription: z.string().min(1, "Company description is required").max(2000),
    companyLocationDescription: z.string().min(1, "Company location description is required").max(500),
    addressLine1: z.string().min(1, "Address Line 1 is required").max(255),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State/Province is required").max(50),
    zipcode: z.string().min(1, "ZIP/Postal code is required").max(20),
    country: z.string().min(1, "Country is required").max(100),
    businessPhone: z.string().min(1, "Company phone is required").max(50),
    businessEmail: z.string().max(255).optional().nullable(),
    businessWebsite: z.string().max(500).optional().nullable(),
    businessDescription: z.string().max(2000).optional().nullable(),
    newsLetterEmailSubscription: z.boolean().optional().nullable(),
    newsLetterSMSSubscription: z.boolean().optional().nullable(),
  });

type FormValues = z.infer<typeof formSchema>;

interface SellerProfileFormProps {
  initialData: {
    companyName: string | null;
    companyRegistrationNumber: string | null;
    companyDescription: string | null;
    companyLogo: string | null;
    companyLocationDescription: string | null;
    newsLetterEmailSubscription: boolean | null;
    newsLetterSMSSubscription: boolean | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    country: string | null;
    businessPhone: string | null;
    businessEmail: string | null;
    businessWebsite: string | null;
    businessDescription: string | null;
    displayLocation: string | null;
  };
}

export function SellerProfileForm({ initialData }: SellerProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: initialData.companyName ?? "",
      companyRegistrationNumber: initialData.companyRegistrationNumber ?? "",
      companyDescription: initialData.companyDescription ?? "",
      companyLocationDescription: initialData.companyLocationDescription ?? "",
      addressLine1: initialData.addressLine1 ?? "",
      addressLine2: initialData.addressLine2 ?? "",
      city: initialData.city ?? "",
      state: initialData.state ?? "VA",
      zipcode: initialData.zipcode ?? "",
      country: initialData.country ?? "United States",
      businessPhone: initialData.businessPhone ?? "",
      businessEmail: initialData.businessEmail ?? "",
      businessWebsite: initialData.businessWebsite ?? "",
      businessDescription: initialData.businessDescription ?? "",
      newsLetterEmailSubscription: initialData.newsLetterEmailSubscription ?? false,
      newsLetterSMSSubscription: initialData.newsLetterSMSSubscription ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      companyName: initialData.companyName ?? "",
      companyRegistrationNumber: initialData.companyRegistrationNumber ?? "",
      companyDescription: initialData.companyDescription ?? "",
      companyLocationDescription: initialData.companyLocationDescription ?? "",
      addressLine1: initialData.addressLine1 ?? "",
      addressLine2: initialData.addressLine2 ?? "",
      city: initialData.city ?? "",
      state: initialData.state ?? "VA",
      zipcode: initialData.zipcode ?? "",
      country: initialData.country ?? "United States",
      businessPhone: initialData.businessPhone ?? "",
      businessEmail: initialData.businessEmail ?? "",
      businessWebsite: initialData.businessWebsite ?? "",
      businessDescription: initialData.businessDescription ?? "",
      newsLetterEmailSubscription: initialData.newsLetterEmailSubscription ?? false,
      newsLetterSMSSubscription: initialData.newsLetterSMSSubscription ?? false,
    });
  }, [initialData, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const cleanedValues: SellerProfileInput = {
          companyName: values.companyName?.trim() || null,
          companyRegistrationNumber: values.companyRegistrationNumber?.trim() || null,
          companyDescription: values.companyDescription?.trim() || null,
          companyLocationDescription: values.companyLocationDescription?.trim() || null,
          addressLine1: values.addressLine1?.trim() || null,
          addressLine2: values.addressLine2?.trim() || null,
          city: values.city?.trim() || null,
          state: values.state?.trim() || null,
          zipcode: values.zipcode?.trim() || null,
          country: values.country?.trim() || null,
          businessPhone: values.businessPhone?.trim() || null,
          businessEmail: values.businessEmail?.trim() || null,
          businessWebsite: values.businessWebsite?.trim() || null,
          businessDescription: values.businessDescription?.trim() || null,
          newsLetterEmailSubscription: values.newsLetterEmailSubscription ?? null,
          newsLetterSMSSubscription: values.newsLetterSMSSubscription ?? null,
        };

        await updateSellerProfileAction(cleanedValues);
        toast.success("Profile updated", {
          description: "Your company information has been saved.",
        });
        window.location.reload();
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to update profile", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      }
    });
  };

  const watchCity = form.watch("city");
  const watchState = form.watch("state");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Information</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your company. This information will be reviewed before approval.
          </p>

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter your store name" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Description <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you sell (antiques, electronics, etc.)"
                    {...field}
                    value={field.value ?? ""}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyLocationDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Location Description<span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Brief description of your store location"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyRegistrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Registration Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Optional registration number"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apartment, suite, etc. (optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP/Postal Code <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP/Postal code" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    defaultValue="United States"
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="United States" >United States</SelectItem>

                      {/* <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Other">Other</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="businessPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Phone <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Business phone number"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Required for buyer contact.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Business email (optional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://your-website.com (optional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional business details (optional)"
                    {...field}
                    value={field.value ?? ""}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="newsLetterEmailSubscription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Subscribe to email newsletter</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newsLetterSMSSubscription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Subscribe to SMS updates</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Display Location</p>
          <p className="text-sm">
            {watchCity || watchState
              ? [watchCity, watchState].filter(Boolean).join(", ")
              : initialData.displayLocation || "Not set"}
          </p>
          <p className="text-xs text-muted-foreground">
            This is shown to buyers as your business location.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}