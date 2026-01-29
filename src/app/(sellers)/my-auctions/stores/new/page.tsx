"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Building2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createStoreAction } from "@/actions/create-store.action";

export default function CreateStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    commissionPct: "0",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Store name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Store name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Store name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      errors.logoUrl = "Please enter a valid URL";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("description", formData.description.trim());
      formDataObj.append("logoUrl", formData.logoUrl.trim());    
      formDataObj.append("status", formData.status);

      const { error, store } = await createStoreAction(formDataObj);

      if (error) {
        setError(error);
        toast.error("Error", {
          description: error,
          duration: 4000,
        });
      } else {
        toast.success("Store Created!", {
          description: "Your store has been created successfully.",
          duration: 3000,
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/sellers-dashboard");
        }, 1000);
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href="/my-auctions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Auctions
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Store</h1>
          <p className="text-muted-foreground mt-1">
            Set up your store to start listing auctions and lots
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to create your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Store Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="My Awesome Store"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className={
                    validationErrors.name ? "border-red-500" : ""
                  }
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your store..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isLoading}
                  rows={4}
                  className={
                    validationErrors.description ? "border-red-500" : ""
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
                {validationErrors.description && (
                  <p className="text-sm text-red-500">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
                    }
                    disabled={isLoading}
                    className={
                      validationErrors.logoUrl ? "border-red-500" : ""
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading}
                    title="Upload Logo"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional: URL to your store logo image
                </p>
                {validationErrors.logoUrl && (
                  <p className="text-sm text-red-500">
                    {validationErrors.logoUrl}
                  </p>
                )}
                {formData.logoUrl && isValidUrl(formData.logoUrl) && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Logo Preview:
                    </p>
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ACTIVE" | "SUSPENDED") =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Active stores can create auctions and lots
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Creating Store..." : "Create Store"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}