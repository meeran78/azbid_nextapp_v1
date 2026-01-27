"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/components/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface CategoryImageUploadProps {
  imageUrl: string | null;
  onChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function CategoryImageUpload({
  imageUrl,
  onChange,
  disabled = false,
}: CategoryImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please select an image file.",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Image must be less than 10MB.",
        });
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "categories");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const result = await response.json();
        onChange(result.url);
        toast.success("Image uploaded", {
          description: "Category image has been uploaded successfully.",
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Upload failed", {
          description: error.message || "Failed to upload image. Please try again.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect, disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(async () => {
    if (imageUrl && imageUrl.includes("cloudinary")) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
        const publicId = publicIdWithExt;

        const response = await fetch(
          `/api/upload?public_id=${encodeURIComponent(publicId)}&resource_type=image`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          console.error("Failed to delete from Cloudinary");
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    onChange(null);
  }, [imageUrl, onChange]);

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative h-48 w-48 rounded-lg overflow-hidden border-2 border-primary">
            <Image
              src={imageUrl}
              alt="Category image"
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            id="category-image-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <label
            htmlFor="category-image-upload"
            className={cn(
              "cursor-pointer flex flex-col items-center gap-2",
              (disabled || isUploading) && "cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isUploading
                  ? "Uploading..."
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP, GIF up to 10MB
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}