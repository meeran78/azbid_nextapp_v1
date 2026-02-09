"use client";

import { useState } from "react";
import { createConnectAccountLink } from "@/actions/stripe-connect.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CheckCircle, Loader2 } from "lucide-react";

type Status =
  | { connected: true; accountId: string }
  | { connected: false; hasAccount?: boolean; error?: string };

export function PayoutsConnectCard({ status }: { status: Status }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const returnUrl = `${base}/my-auctions/payouts`;
      const result = await createConnectAccountLink(returnUrl, returnUrl);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (status.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Stripe connected
          </CardTitle>
          <CardDescription>
            You will receive payouts to your connected Stripe account when buyers pay for your sold items.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Connect Stripe for payouts
          </CardTitle>
          <CardDescription>
            {status.hasAccount
              ? "Complete onboarding in Stripe to start receiving payouts."
              : "Connect your Stripe account to receive seller payouts. You will be redirected to Stripe to complete setup."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : status.hasAccount ? (
              "Complete Stripe onboarding"
            ) : (
              "Connect Stripe"
            )}
          </Button>
        </CardContent>
      </Card>
  );
}
