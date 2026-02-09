import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConnectAccountStatus } from "@/actions/stripe-connect.action";
import { PayoutsConnectCard } from "@/app/components/seller/PayoutsConnectCard";

export default async function PayoutsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect("/sign-in");
  if (session.user.role !== "SELLER") redirect("/");

  const status = await getConnectAccountStatus(session.user.id);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Payouts</h1>
      <p className="text-muted-foreground mb-6">
        Connect Stripe to receive payouts when your items sell. The platform collects payment, deducts buyer premium and commission, then transfers your share to your connected account.
      </p>
      <PayoutsConnectCard status={status} />
    </div>
  );
}
