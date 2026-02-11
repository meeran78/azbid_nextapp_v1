import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBuyerOrderForPayment } from "@/actions/buyer-bids.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Store, User, Mail, Phone, MapPin, CreditCard, CheckCircle } from "lucide-react";
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
  const payment = order.payment;
  const isPaid =
    order.status === "PAID" || (invoice && invoice.status === "PAID");
  const seller = order.lot?.store?.owner;
  const store = order.lot?.store;

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

      {/* Seller details for winning items */}
      {store && seller && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Store className="h-5 w-5" />
              Seller & winning items from
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-muted-foreground">Store</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{seller.companyName ?? seller.name}</p>
                <p className="text-sm text-muted-foreground">Seller</p>
              </div>
            </div>
            {(seller.businessEmail ?? seller.email) && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${seller.businessEmail ?? seller.email}`}
                  className="text-violet-600 hover:underline"
                >
                  {seller.businessEmail ?? seller.email}
                </a>
              </div>
            )}
            {seller.businessPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={`tel:${seller.businessPhone}`}
                  className="text-violet-600 hover:underline"
                >
                  {seller.businessPhone}
                </a>
              </div>
            )}
            {seller.displayLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{seller.displayLocation}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Payment details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPaid && payment && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle className="h-5 w-5" />
                Payment completed
              </div>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd>${payment.amount.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Method</dt>
                  <dd>{payment.provider}</dd>
                </div>
                {payment.providerRef && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Reference</dt>
                    <dd className="font-mono text-xs truncate max-w-[180px]" title={payment.providerRef}>
                      {payment.providerRef}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          {isPaid && !payment && (
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              This order has been paid.
            </p>
          )}
          {!isPaid && (
            <p className="text-sm text-muted-foreground">
              Pending payment. Complete payment below to finalize this order.
            </p>
          )}
        </CardContent>
      </Card>

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

          {!isPaid && invoice ? (
            <div className="pt-4">
              <PayWithStripeForm
                invoiceId={invoice.id}
                returnUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/buyers-dashboard/orders/${orderId}/pay`}
                orderTotal={order.total}
                onSuccess={() => window.location.reload()}
              />
            </div>
          ) : !isPaid ? (
            <p className="text-sm text-muted-foreground pt-4">
              No invoice found for this order. Please contact support.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
