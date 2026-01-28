"use client";

import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { cn } from "@/components/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface CategoryImageUploadProps {
  imageUrl: string | null;
  onChange: (imageUrl: string | null) => void;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
}

export function CategoryImageUpload({
  imageUrl,
  onChange,
  onFileChange,
  disabled = false,
}: CategoryImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create preview URL when file is selected
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Use preview URL if file is selected, otherwise use imageUrl
  const displayUrl = previewUrl || imageUrl;

  const handleFileSelect = useCallback(
    (file: File) => {
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

      setSelectedFile(file);
      onFileChange?.(file);
      // Don't upload yet, just store the file
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

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

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    onFileChange?.(null);
    onChange(null);
  }, [onChange, onFileChange]);

  return (
    <div className="space-y-4">
      {displayUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="relative h-48 w-48 rounded-lg overflow-hidden border-2 border-primary">
            <Image
              src={displayUrl}
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
          {selectedFile && (
            <p className="text-xs text-muted-foreground mt-2">
              Image will be uploaded when you save the category
            </p>
          )}
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
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="file"
            id="category-image-upload"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />
          <label
            htmlFor="category-image-upload"
            className={cn(
              "cursor-pointer flex flex-col items-center gap-2",
              disabled && "cursor-not-allowed"
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Click to upload or drag and drop
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