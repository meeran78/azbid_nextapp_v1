import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings as SettingsIcon, CreditCard, FileCheck, ArrowRight } from "lucide-react";
import { getBuyerSettingsData } from "@/actions/buyer-settings.action";
import { BuyerSettingsProfileSection } from "@/app/components/buyer/BuyerSettingsProfileSection";
import { BuyerSettingsNotificationsSection } from "@/app/components/buyer/BuyerSettingsNotificationsSection";
import { BuyerSettingsSecuritySection } from "@/app/components/buyer/BuyerSettingsSecuritySection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function BuyerSettingsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const data = await getBuyerSettingsData();
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
          <h1 className="text-3xl font-bold">Buyer Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, notifications, payment methods, and account security
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* 1. Profile & preferences */}
      <BuyerSettingsProfileSection profile={data.profile} />

      {/* 2. Bidding notifications */}
      <BuyerSettingsNotificationsSection initialPrefs={data.notificationPrefs} />

      {/* 3. Payment methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved payment methods
          </CardTitle>
          <CardDescription>
            Add or remove cards used for bidding and paying for won auctions. A valid card is required to place bids.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/buyers-dashboard/payment-methods">
              Manage payment methods
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 4. Security & account access */}
      <BuyerSettingsSecuritySection />

      {/* 5. Compliance */}
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
              <Link href="/terms" target="_blank" rel="noopener noreferrer">
                View terms of service
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy policy
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Data export and account deletion can be requested from the same account section or by contacting support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
