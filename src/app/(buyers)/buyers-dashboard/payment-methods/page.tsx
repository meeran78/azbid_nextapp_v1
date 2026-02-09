import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SaveCardForm } from "@/app/components/stripe/SaveCardForm";

export default function PaymentMethodsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-10xl">
      <Button variant="ghost" asChild size="sm" className="-ml-2">
        <Link href="/buyers-dashboard/bids">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Bids
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Payment methods</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Save a card to pay for won auctions automatically (charge later).
        </p>
      </div>
      <SaveCardForm />
    </div>
  );
}
