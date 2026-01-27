"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { createCategoryAction, updateCategoryAction } from "@/actions/category.action";
import { CategoryImageUpload } from "./CategoryImageUpload";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url("Invalid URL").optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: "ACTIVE" | "INACTIVE";
  };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      imageUrl: initialData?.imageUrl ?? null,
      status: initialData?.status ?? "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? "",
        imageUrl: initialData.imageUrl ?? null,
        status: initialData.status,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    startTransition(async () => {
      try {
        const data = {
          ...values,
          description: values.description?.trim() || null,
          imageUrl: values.imageUrl?.trim() || null,
        };

        if (isEditing && initialData) {
          await updateCategoryAction(initialData.id, data);
          toast.success("Category updated", {
            description: "The category has been updated successfully.",
          });
        } else {
          await createCategoryAction(data);
          toast.success("Category created", {
            description: "The category has been created successfully.",
          });
        }

        router.push("/admin-dashboard/categories");
        router.refresh();
      } catch (error: any) {
        console.error("Category form error:", error);
        toast.error("Error", {
          description: error.message || "Failed to save category. Please try again.",
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Category" : "Create New Category"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update category information"
            : "Add a new category for organizing auction items"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electronics, Jewelry" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for this category
                  </FormDescription>
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
                      placeholder="Brief description of this category..."
                      rows={4}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help sellers understand this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <CategoryImageUpload
                      imageUrl={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image representing this category (optional)
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
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Inactive categories won't appear in category selection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  ? "Update Category"
                  : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}