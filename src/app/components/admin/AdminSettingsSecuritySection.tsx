"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/app/components/ChangePasswordForm";

export function AdminSettingsSecuritySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security & account access
        </CardTitle>
        <CardDescription>
          Change your password and manage how you sign in. Admin accounts should use strong passwords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="flex items-center gap-2 font-medium mb-2">
            <KeyRound className="h-4 w-4" />
            Change password
          </h4>
          <ChangePasswordForm />
        </div>
        <p className="text-sm text-muted-foreground">
          Forgot your password? Use the &quot;Forgot password&quot; link on the sign-in page to reset it via email.
        </p>
      </CardContent>
    </Card>
  );
}
