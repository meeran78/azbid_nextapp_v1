import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getBuyerPayments,
  type BuyerPaymentEntry,
} from "@/actions/buyer-payment-history.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  RotateCcw,
} from "lucide-react";

const statusMeta = {
  PAID: { label: "Paid", icon: CheckCircle2, className: "bg-green-600 text-white border-transparent" },
  FAILED: { label: "Failed", icon: XCircle, className: "bg-destructive text-white border-transparent" },
  REFUNDED: { label: "Refunded", icon: RotateCcw, className: "bg-blue-600 text-white border-transparent" },
  PENDING: { label: "Awaiting payment", icon: Clock, className: "bg-amber-500 text-white border-transparent" },
} as const;

function PaymentEntryCard({ entry }: { entry: BuyerPaymentEntry }) {
  const meta = statusMeta[entry.paymentStatus];
  const StatusIcon = meta.icon;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{entry.lotTitle}</p>
            <p className="text-sm text-muted-foreground">{entry.storeName}</p>
            {entry.invoiceDisplayId && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {entry.invoiceDisplayId}
              </p>
            )}
          </div>
          <Badge className={meta.className}>
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </Badge>
        </div>

        <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="text-right">${(entry.paymentAmount ?? entry.orderTotal).toFixed(2)}</dd>
          <dt className="text-muted-foreground">Date</dt>
          <dd className="text-right">
            {entry.paymentDate ? new Date(entry.paymentDate).toLocaleString() : "—"}
          </dd>
          {entry.providerRef && (
            <>
              <dt className="text-muted-foreground">Reference</dt>
              <dd className="text-right font-mono text-xs truncate" title={entry.providerRef}>
                {entry.providerRef}
              </dd>
            </>
          )}
        </dl>

        {entry.paymentStatus === "FAILED" && entry.failureReason && (
          <p className="text-sm text-destructive">{entry.failureReason}</p>
        )}
        {entry.paymentStatus === "PENDING" && entry.requiresAction && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Your bank requires additional verification (3D Secure) to complete this payment.
          </p>
        )}

        {/* Won items this payment covers */}
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Items won</p>
          <ul className="space-y-2">
            {entry.items.map((item) => (
              <li key={item.itemId} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0">
                  {item.itemImageUrl ? (
                    <Image
                      src={item.itemImageUrl}
                      alt={item.itemTitle}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{item.itemTitle}</p>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  ${item.winningBidAmount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {(entry.paymentStatus === "FAILED" || entry.paymentStatus === "PENDING") && (
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={`/buyers-dashboard/orders/${entry.orderId}/pay`}>
              {entry.paymentStatus === "FAILED" ? "Retry payment" : "Complete payment"}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentSection({
  title,
  entries,
  emptyText,
}: {
  title: string;
  entries: BuyerPaymentEntry[];
  emptyText: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        {title} <span className="text-muted-foreground font-normal">({entries.length})</span>
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <PaymentEntryCard key={entry.orderId} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function PaymentPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");

  if (session.user.role !== "BUYER") {
    return (
      <div className="container mx-auto p-6 max-w-10xl">
        <h1 className="text-2xl font-bold">Payment</h1>
        <p className="text-muted-foreground mt-2">
          This page is available for buyer accounts.
        </p>
      </div>
    );
  }

  const { successful, failed, pending } = await getBuyerPayments();

  return (
    <div className="container mx-auto p-6 max-w-10xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          Every payment for the lots you&apos;ve won, and the items each one covers.
        </p>
      </div>

      <PaymentSection
        title="Successful Payments"
        entries={successful}
        emptyText="No successful payments yet."
      />
      <PaymentSection
        title="Failed Payments"
        entries={failed}
        emptyText="No failed payments — nothing to worry about here."
      />
      <PaymentSection
        title="Awaiting Payment"
        entries={pending}
        emptyText="No pending payments."
      />
    </div>
  );
}
