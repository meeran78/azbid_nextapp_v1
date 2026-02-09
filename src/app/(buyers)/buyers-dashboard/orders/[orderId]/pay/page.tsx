import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBuyerOrderForPayment } from "@/actions/buyer-bids.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";
import { PayWithStripeForm } from "@/app/components/stripe/PayWithStripeForm";

export default async function BuyerOrderPayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getBuyerOrderForPayment(orderId);

  if (!order) notFound();

  const invoice = order.invoice;
  const isPaid =
    order.status === "PAID" || (invoice && invoice.status === "PAID");

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <Button variant="ghost" asChild size="sm" className="-ml-2">
        <Link href="/buyers-dashboard/bids">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Bids
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">Complete payment</h1>
        <p className="text-muted-foreground mt-1">
          Lot: {order.lot.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {order.orderItems.map((oi) => {
              const img = oi.item.imageUrls?.[0];
              return (
                <li
                  key={oi.id}
                  className="flex gap-3 items-center border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="relative w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                    {img ? (
                      <Image
                        src={img}
                        alt={oi.item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{oi.item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${oi.total.toFixed(2)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Buyer&apos;s premium</span>
              <span>${order.buyerPremium.toFixed(2)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {isPaid ? (
            <p className="text-sm text-green-600 font-medium pt-4">
              This order has been paid.
            </p>
          ) : invoice ? (
            <div className="pt-4">
              <PayWithStripeForm
                invoiceId={invoice.id}
                returnUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/buyers-dashboard/orders/${orderId}/pay`}
                orderTotal={order.total}
                onSuccess={() => window.location.reload()}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pt-4">
              No invoice found for this order. Please contact support.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
