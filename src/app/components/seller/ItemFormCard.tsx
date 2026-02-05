"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "./ImageUpload";
import { Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { CreateLotFormData } from "@/lib/validations/lot.schema";

interface ItemFormCardProps {
  /** Current position in the list (0-based). Order # shown is index + 1. */
  index: number;
  /** Total number of items (used for move down and display). */
  totalCount: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

interface Category {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export function ItemFormCard({ index, totalCount, onRemove, canRemove, onMoveUp, onMoveDown }: ItemFormCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const form = useFormContext<CreateLotFormData>();

  const handleConfirmRemove = useCallback(() => {
    setDeleteDialogOpen(false);
    onRemove(index);
  }, [index, onRemove]);

  const item = form.watch(`items.${index}`);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.filter((cat: Category) => cat.status === "ACTIVE"));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">Item #{index + 1}</span>
              {totalCount > 1 && (
                <span className="text-xs font-normal text-muted-foreground">
                  of {totalCount}
                </span>
              )}
              {item?.title && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {item.title}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-1">
              {onMoveUp && index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMoveUp(index);
                  }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  title="Move up"
                  aria-label="Move item up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
              {onMoveDown && index < totalCount - 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMoveDown(index);
                  }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  title="Move down"
                  aria-label="Move item down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {canRemove && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()} onPointerDownOutside={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove this item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Item #{index + 1}
                          {item?.title ? ` "${item.title}"` : ""} will be removed from the lot. Save the form to update the lot. You can add another item if needed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirmRemove();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove item
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`items.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Item Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`items.${index}.categoryId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name={`items.${index}.condition`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Condition <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Used – Good">Used – Good</SelectItem>
                        <SelectItem value="Used – Fair">Used – Fair</SelectItem>
                        <SelectItem value="Salvage">Salvage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`items.${index}.startPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Starting Price <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="-mx-2 pl-7 px-6"
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

              <FormField
                control={form.control}
                name={`items.${index}.retailPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Price </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="-mx-2 pl-7 px-6"
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

              <FormField
                control={form.control}
                name={`items.${index}.reservePrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reserve Price ( Must be ≤ retail price )</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute  top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="-mx-2 pl-7 px-6"
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
            </div>

            <FormField
              control={form.control}
              name={`items.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`items.${index}.images`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Images (At least one image is required) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <ImageUpload
                      images={field.value || []}
                      onChange={(images) => {
                        field.onChange(images);
                        form.setValue(`items.${index}.images`, images, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      maxImages={10}
                      itemIndex={index}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 10 images per item (max 10MB each)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}