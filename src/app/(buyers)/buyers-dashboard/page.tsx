import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BuyersDashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "BUYER") {
    redirect("/");
  }
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold underline text-center text-primary">Buyers Dashboard</h1>
      </div>
    );
  }