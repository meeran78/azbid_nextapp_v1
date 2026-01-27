"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SellerProfileInput, updateSellerProfileAction } from "@/actions/seller-profile.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

const formSchema = z.object({
    addressLine1: z.string().max(255).optional().nullable(),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(50).optional().nullable(),
    zipcode: z.string().max(20).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    businessPhone: z.string().max(50).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface SellerProfileFormProps {
    initialData: {
        addressLine1: string | null;
        addressLine2: string | null;
        city: string | null;
        state: string | null;
        zipcode: string | null;
        country: string | null;
        businessPhone: string | null;
        displayLocation: string | null;
    };
}

export function SellerProfileForm({ initialData }: SellerProfileFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            addressLine1: initialData.addressLine1,
            addressLine2: initialData.addressLine2,
            city: initialData.city,
            state: initialData.state ?? "VA", // default VA
            zipcode: initialData.zipcode,
            country: initialData.country ?? "USA",
            businessPhone: initialData.businessPhone,
        },
    });

    // Update form when initialData changes
    useEffect(() => {
        form.reset({
            addressLine1: initialData.addressLine1 ?? "",
            addressLine2: initialData.addressLine2 ?? "",
            city: initialData.city ?? "",
            state: initialData.state ?? "VA",
            zipcode: initialData.zipcode ?? "",
            country: initialData.country ?? "USA",
            businessPhone: initialData.businessPhone ?? "",
        });
    }, [initialData, form]);


    const onSubmit = (values: FormValues) => {
        startTransition(async () => {
            try {
                // Convert empty strings to null
                const cleanedValues = {
                    addressLine1: values.addressLine1?.trim() || null,
                    addressLine2: values.addressLine2?.trim() || null,
                    city: values.city?.trim() || null,
                    state: values.state?.trim() || null,
                    zipcode: values.zipcode?.trim() || null,
                    country: values.country?.trim() || null,
                    businessPhone: values.businessPhone?.trim() || null,
                };

                await updateSellerProfileAction(cleanedValues as SellerProfileInput);
                toast.success("Profile updated", {
                    description: "Your business address details have been saved.",
                });

                // Refresh the page to show updated data
                window.location.reload();
            } catch (err: any) {
                console.error(err);
                toast.error("Failed to update profile", {
                    description: err?.message ?? "Please try again.",
                });
            }
        });
    };

    const watchCity = form.watch("city");
    const watchState = form.watch("state");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Street address"
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
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="City"
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
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value ?? "VA"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VA">Virginia (VA)</SelectItem>
                                            <SelectItem value="MD">Maryland (MD)</SelectItem>
                                            <SelectItem value="DC">District of Columbia (DC)</SelectItem>
                                            {/* Add more states as needed */}
                                            {/* <SelectItem value="AL">Alabama (AL)</SelectItem>
                                            <SelectItem value="AK">Alaska (AK)</SelectItem>
                                            <SelectItem value="AZ">Arizona (AZ)</SelectItem>
                                            <SelectItem value="AR">Arkansas (AR)</SelectItem>
                                            <SelectItem value="CA">California (CA)</SelectItem>
                                            <SelectItem value="CO">Colorado (CO)</SelectItem>
                                            <SelectItem value="CT">Connecticut (CT)</SelectItem>
                                            <SelectItem value="DE">Delaware (DE)</SelectItem>
                                            <SelectItem value="FL">Florida (FL)</SelectItem>
                                            <SelectItem value="GA">Georgia (GA)</SelectItem>
                                            <SelectItem value="HI">Hawaii (HI)</SelectItem>
                                            <SelectItem value="ID">Idaho (ID)</SelectItem>
                                            <SelectItem value="IL">Illinois (IL)</SelectItem>
                                            <SelectItem value="IN">Indiana (IN)</SelectItem>
                                            <SelectItem value="IA">Iowa (IA)</SelectItem>
                                            <SelectItem value="KS">Kansas (KS)</SelectItem>
                                            <SelectItem value="KY">Kentucky (KY)</SelectItem>
                                            <SelectItem value="LA">Louisiana (LA)</SelectItem>
                                            <SelectItem value="ME">Maine (ME)</SelectItem>
                                            <SelectItem value="MA">Massachusetts (MA)</SelectItem>
                                            <SelectItem value="MI">Michigan (MI)</SelectItem>
                                            <SelectItem value="MN">Minnesota (MN)</SelectItem>
                                            <SelectItem value="MS">Mississippi (MS)</SelectItem>
                                            <SelectItem value="MO">Missouri (MO)</SelectItem>
                                            <SelectItem value="MT">Montana (MT)</SelectItem>
                                            <SelectItem value="NE">Nebraska (NE)</SelectItem>
                                            <SelectItem value="NV">Nevada (NV)</SelectItem>
                                            <SelectItem value="NH">New Hampshire (NH)</SelectItem>
                                            <SelectItem value="NJ">New Jersey (NJ)</SelectItem>
                                            <SelectItem value="NM">New Mexico (NM)</SelectItem>
                                            <SelectItem value="NY">New York (NY)</SelectItem>
                                            <SelectItem value="NC">North Carolina (NC)</SelectItem>
                                            <SelectItem value="ND">North Dakota (ND)</SelectItem>
                                            <SelectItem value="OH">Ohio (OH)</SelectItem>
                                            <SelectItem value="OK">Oklahoma (OK)</SelectItem>
                                            <SelectItem value="OR">Oregon (OR)</SelectItem>
                                            <SelectItem value="PA">Pennsylvania (PA)</SelectItem>
                                            <SelectItem value="RI">Rhode Island (RI)</SelectItem>
                                            <SelectItem value="SC">South Carolina (SC)</SelectItem>
                                            <SelectItem value="SD">South Dakota (SD)</SelectItem>
                                            <SelectItem value="TN">Tennessee (TN)</SelectItem>
                                            <SelectItem value="TX">Texas (TX)</SelectItem>
                                            <SelectItem value="UT">Utah (UT)</SelectItem>
                                            <SelectItem value="VT">Vermont (VT)</SelectItem>
                                            <SelectItem value="WA">Washington (WA)</SelectItem>
                                            <SelectItem value="WV">West Virginia (WV)</SelectItem>
                                            <SelectItem value="WI">Wisconsin (WI)</SelectItem>
                                            <SelectItem value="WY">Wyoming (WY)</SelectItem> */}

                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="zipcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Zip Code</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Zip code"
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
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Country"
                                        {...field}
                                        value={field.value ?? "USA"}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="businessPhone"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Business Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Business phone"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Shown to buyers on your store and lot pages where appropriate.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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