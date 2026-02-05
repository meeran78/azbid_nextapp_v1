"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateStoreAction } from "@/actions/create-store.action";
import { deleteLotItemImagesAction } from "@/actions/delete-lot.action";

export interface StoreForEdit {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

interface StoreEditDialogProps {
  store: StoreForEdit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function StoreEditDialog({
  store,
  open,
  onOpenChange,
  onSuccess,
}: StoreEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (store && open) {
      setFormData({
        name: store.name,
        description: store.description ?? "",
        logoUrl: store.logoUrl ?? "",
      });
      setValidationErrors({});
    }
  }, [store, open]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Store name is required";
    else if (formData.name.trim().length < 2) errors.name = "Store name must be at least 2 characters";
    else if (formData.name.trim().length > 100) errors.name = "Store name must be less than 100 characters";
    if (formData.description && formData.description.length > 500) errors.description = "Description must be less than 500 characters";
    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) errors.logoUrl = "Please enter a valid URL";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", { description: "Please select an image (JPEG, PNG, WEBP, GIF)." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Image must be less than 10MB." });
      return;
    }
    setIsUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "stores/logos");
      const response = await fetch("/api/upload", { method: "POST", body: fd });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }
      const result = await response.json();
      setFormData((prev) => ({ ...prev, logoUrl: result.url }));
      setValidationErrors((prev) => ({ ...prev, logoUrl: undefined }));
      toast.success("Logo uploaded");
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logoUrl) return;
    const urlToRemove = formData.logoUrl;
    setIsRemovingLogo(true);
    try {
      if (urlToRemove.includes("cloudinary.com")) {
        const result = await deleteLotItemImagesAction([urlToRemove]);
        if (result.error) {
          toast.error("Failed to delete image from Cloudinary", { description: result.error });
          return;
        }
      }
      setFormData((prev) => ({ ...prev, logoUrl: "" }));
      setValidationErrors((prev) => ({ ...prev, logoUrl: undefined }));
      toast.success("Logo removed");
    } catch (err: any) {
      toast.error("Failed to remove logo", { description: err.message });
    } finally {
      setIsRemovingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setValidationErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("description", formData.description.trim());
      fd.append("logoUrl", formData.logoUrl.trim());
      const { error } = await updateStoreAction(store.id, fd);
      if (error) {
        toast.error("Error", { description: error });
        return;
      }
      toast.success("Store updated");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Store
          </DialogTitle>
          <DialogDescription>
            Update your store name, description, and logo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Store Name <span className="text-red-500">*</span></Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="My Store"
              disabled={isLoading}
              className={validationErrors.name ? "border-red-500" : ""}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe your store..."
              rows={3}
              disabled={isLoading}
              className={validationErrors.description ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/500</p>
            {validationErrors.description && (
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Store Logo</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.logoUrl}
                onChange={(e) => setFormData((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="URL or upload"
                disabled={isLoading}
                className={validationErrors.logoUrl ? "border-red-500" : ""}
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || isUploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
            </div>
            {validationErrors.logoUrl && <p className="text-sm text-red-500">{validationErrors.logoUrl}</p>}
            {formData.logoUrl && isValidUrl(formData.logoUrl) && (
              <div className="relative inline-block mt-2">
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-16 h-16 object-cover rounded-lg border"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
                  onClick={handleRemoveLogo}
                  disabled={isLoading || isRemovingLogo}
                >
                  {isRemovingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
