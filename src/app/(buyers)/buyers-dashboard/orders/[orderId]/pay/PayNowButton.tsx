"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { triggerPaymentFlow } from "@/actions/payment.action";

interface PayNowButtonProps {
  invoiceId: string;
  orderTotal: number;
}

export function PayNowButton({ invoiceId, orderTotal }: PayNowButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const result = await triggerPaymentFlow(invoiceId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (result.clientSecret) {
        toast.success(
          "Payment session created. Redirecting to payment when Stripe Checkout is configured."
        );
        router.refresh();
      } else {
        toast.success("Payment initiated. Check your email for payment details.");
        router.refresh();
      }
    } catch {
      toast.error("Failed to start payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={isLoading}
      className="w-full bg-violet-600 hover:bg-violet-700"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Complete payment (${orderTotal.toFixed(2)})
    </Button>
  );
}
