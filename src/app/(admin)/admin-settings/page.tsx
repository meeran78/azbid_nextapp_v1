import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  FileCheck,
  ArrowRight,
  Store,
  Barcode,
  Pickaxe,
  Users,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { getAdminSettingsData } from "@/actions/admin-settings.action";
import { AdminSettingsProfileSection } from "@/app/components/admin/AdminSettingsProfileSection";
import { AdminSettingsSecuritySection } from "@/app/components/admin/AdminSettingsSecuritySection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const adminLinks = [
  { title: "Stores Management", href: "/stores-management", icon: Store },
  { title: "Lots Management", href: "/lots-management", icon: Barcode },
  { title: "Auctions Management", href: "/auctions-management", icon: Pickaxe },
  { title: "Users", href: "/users-management", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "FAQs", href: "/faqs", icon: HelpCircle },
];

export default async function AdminSettingsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p className="text-destructive font-medium">Access denied. Admin only.</p>
      </div>
    );
  }

  const data = await getAdminSettingsData();
  if (!data) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p className="text-muted-foreground">Unable to load settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, platform tools, and account security
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* 1. Profile & preferences */}
      <AdminSettingsProfileSection profile={data.profile} />

      {/* 2. Admin tools – quick links */}
      <Card>
        <CardHeader>
          <CardTitle>Platform management</CardTitle>
          <CardDescription>
            Quick access to stores, lots, auctions, users, analytics, and FAQs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {adminLinks.map(({ title, href, icon: Icon }) => (
              <Button key={href} variant="outline" className="justify-between gap-2" asChild>
                <Link href={href}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {title}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Security & account access */}
      <AdminSettingsSecuritySection />

      {/* 4. Compliance & terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Compliance & terms
          </CardTitle>
          <CardDescription>
            Review terms of service, privacy policy, and your consent records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Terms of service</p>
            <p className="text-sm">
              You accepted the platform terms when you signed up.
              {data.acceptedTermsAt && (
                <span className="text-muted-foreground ml-1">
                  Accepted on {format(new Date(data.acceptedTermsAt), "MMM d, yyyy")}.
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/terms-conditions" target="_blank" rel="noopener noreferrer">
                View terms of service
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Data export and account deletion can be requested by contacting support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
