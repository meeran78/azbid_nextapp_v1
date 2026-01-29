"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { US_STATES } from "@/lib/constants/us-states";
import { COUNTRIES } from "@/lib/constants/countries";
import { forwardRef, useImperativeHandle } from "react";

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  companyDescription: z.string().min(1, "Company description is required").max(2000),
  companyLocationDescription: z.string().max(500).optional().nullable(),
  addressLine1: z.string().min(1, "Address Line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/Province is required").max(50),
  zipcode: z.string().min(1, "ZIP/Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  businessPhone: z.string().min(1, "Country is required").max(15),
});

type FormValues = z.infer<typeof formSchema>;

export type LoginCompanyInfoRef = {
  trigger: () => Promise<boolean>;
  getValues: () => FormValues;
};

const LoginCompanyInfo = forwardRef<LoginCompanyInfoRef>((_, ref) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyDescription: "",
      companyLocationDescription: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipcode: "",
      country: "US",
      businessPhone: "",
    },
  });
  useImperativeHandle(ref, () => ({
    trigger: () => form.trigger(),
    getValues: () => form.getValues(),
  }));

  return (
    <Form {...form}>
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div>
          <h3 className="text-base font-medium">Company Information</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about your company. This information will be reviewed before approval.
          </p>
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your company name"
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
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what you sell (antiques, electronics, etc.)"
                  {...field}
                  value={field.value ?? ""}
                  rows={3}
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
              <FormLabel>Company Location Description </FormLabel>
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

        <div className="space-y-4">
          <h3 className="text-base font-medium">Company Address <span className="text-red-500">*</span></h3>
          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 <span className="text-red-500">*</span></FormLabel>
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

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City <span className="text-red-500">*</span></FormLabel>
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
                        {form.watch("country") === "US" ? (
                          US_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value={field.value ?? ""}>
                            {field.value || "State/Province"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ZIP/Postal code"
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
                    <FormLabel>Country <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "US") {
                          form.setValue("state", "");
                        }
                      }}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="businessPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Phone <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Business phone number"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
});

LoginCompanyInfo.displayName = "LoginCompanyInfo";

export default LoginCompanyInfo;