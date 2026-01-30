"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Save, User, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "@/lib/auth-client";
import { ChangePasswordForm } from "@/app/components/ChangePasswordForm";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  emailVerified: boolean;
}

export default function Settings() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
          });
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      await updateUser({
        name: formData.name,
        fetchOptions: {
          onRequest: () => {
            setSaving(true);
          },
          onResponse: () => {
            setSaving(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to update profile");
            setSaving(false);
          },
          onSuccess: () => {
            toast.success("Profile updated successfully");
            router.refresh();
            setSaving(false);
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-10xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-6 max-w-10xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-10xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex items-center gap-2 py-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{getRoleDisplay(userData.role)}</span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={userData.id} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input
                value={formatDate(userData.createdAt)}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="flex items-center gap-2 py-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  {userData.banned ? "Banned" : "Active"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-semibold text-foreground">Account Actions</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    toast.info("Download Account Data feature coming soon");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Account Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => {
                    toast.error("Delete Account feature coming soon");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}