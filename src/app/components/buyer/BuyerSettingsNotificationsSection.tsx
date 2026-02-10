"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { updateBuyerNotificationPrefs } from "@/actions/buyer-settings.action";
import type { BuyerNotificationPrefs } from "@/actions/buyer-settings.action";

export function BuyerSettingsNotificationsSection({
  initialPrefs,
}: {
  initialPrefs: BuyerNotificationPrefs;
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await updateBuyerNotificationPrefs(prefs);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Notification preferences saved");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Bidding notifications
        </CardTitle>
        <CardDescription>
          Choose when we email you about your bids and auction activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>When someone outbids you</Label>
            <p className="text-sm text-muted-foreground">
              Get an email when your bid is no longer the highest.
            </p>
          </div>
          <Switch
            checked={prefs.notifyOnOutbid}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, notifyOnOutbid: v }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>When you win an auction</Label>
            <p className="text-sm text-muted-foreground">
              Get an email when the lot closes and you are the winning bidder.
            </p>
          </div>
          <Switch
            checked={prefs.notifyOnWin}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, notifyOnWin: v }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Lot ending soon</Label>
            <p className="text-sm text-muted-foreground">
              Reminder when a lot you’re bidding on is closing soon (e.g. last 10 minutes).
            </p>
          </div>
          <Switch
            checked={prefs.notifyOnLotEndingSoon}
            onCheckedChange={(v) => setPrefs((p) => ({ ...p, notifyOnLotEndingSoon: v }))}
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
