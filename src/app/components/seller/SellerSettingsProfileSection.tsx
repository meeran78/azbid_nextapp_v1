"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "@/lib/auth-client";
import type { SellerSettingsProfile } from "@/actions/seller-settings.action";

export function SellerSettingsProfileSection({ profile }: { profile: SellerSettingsProfile }) {
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUser({
        name,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Profile updated");
            setSaving(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message ?? "Failed to update profile");
            setSaving(false);
          },
        },
      });
    } catch {
      toast.error("Failed to update profile");
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile & preferences
        </CardTitle>
        <CardDescription>
          Update your display name and account details. Email is managed by your sign-in provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seller-name">Display name</Label>
          <Input
            id="seller-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} readOnly className="bg-muted cursor-not-allowed" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={profile.role} readOnly className="bg-muted cursor-not-allowed" />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
