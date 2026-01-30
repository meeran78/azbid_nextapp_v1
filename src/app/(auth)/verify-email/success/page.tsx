import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default async function Page() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (session?.user) {
    const role = session.user.role;
    if (role === "SELLER") {
      redirect("/sellers-dashboard");
    }
    if (role === "ADMIN") {
      redirect("/admin-dashboard");
    }
    if (role === "BUYER") {
      redirect("/");
    }
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h1 className="text-3xl font-bold">Verification Email Sent</h1>
        <p className="text-muted-foreground max-w-md">
          Success! We have sent a verification link to your email. Please check your inbox and click the link to verify your account.
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}