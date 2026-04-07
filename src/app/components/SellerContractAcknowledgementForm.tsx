"use client";

import { useState } from "react";
import { acknowledgeSellerContractAction } from "@/actions/seller-account-request.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function SellerContractAcknowledgementForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData();
    fd.set("token", token);
    fd.set("acknowledgementName", name);
    fd.set("accept", String(accepted));
    const result = await acknowledgeSellerContractAction(fd);
    if (result.error) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    toast.success("Acknowledgement submitted successfully.");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-6">
      <h1 className="text-2xl font-bold">Seller Contract Acknowledgement</h1>
      <p className="text-sm text-muted-foreground">
        By submitting this form, you acknowledge the seller contract details sent to your email.
      </p>
      <div className="space-y-2">
        <Label htmlFor="ackName">Full Name</Label>
        <Input id="ackName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="acceptContract"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
        />
        <Label htmlFor="acceptContract" className="leading-5">
          I acknowledge and accept the seller contract terms sent by AZ-Bid.
        </Label>
      </div>
      <Button type="submit" disabled={isSubmitting || !accepted}>
        {isSubmitting ? "Submitting..." : "Submit Acknowledgement"}
      </Button>
    </form>
  );
}
