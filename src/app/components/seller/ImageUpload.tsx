"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/components/lib/utils";

interface ImageFile {
  file?: File; // Make file optional for existing images
  preview: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: ImageFile[] = [];
      const remainingSlots = maxImages - images.length;

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          if (file.type.startsWith("image/")) {
            if (file.size <= 5 * 1024 * 1024) {
              const preview = URL.createObjectURL(file);
              newImages.push({ file, preview });
            }
          }
        });

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
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
          id="image-upload"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled || images.length >= maxImages}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className={cn(
            "cursor-pointer flex flex-col items-center gap-2",
            (disabled || images.length >= maxImages) && "cursor-not-allowed"
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP up to 5MB each ({images.length}/{maxImages})
            </p>
          </div>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-100 group-hover:opacity-100 transition-opacity shadow-md"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  title="Delete image"
                >
                  <X className="h-4 w-4" />
                </Button>
                {image.file && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}