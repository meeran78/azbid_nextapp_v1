import { SendVerificationEmailForm } from "@/components/SendVerificationEmailForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const error = params.error;

  if (!error) {
    redirect("/verify-email/success");
  }

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Verify Email</h1>
      </div>

      <p className="text-destructive">
        <span className="capitalize">
          {error.replace(/_/g, " ").replace(/-/g, " ")}
        </span>{" "}
        - Please request a new verification email.
      </p>

      <SendVerificationEmailForm />

      <Button variant="link" asChild>
        <Link href="/sign-in">Back to Sign In</Link>
      </Button>
    </div>
  );
}