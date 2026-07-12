"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { signUpAdminAction } from "@/actions/signUpAdmin.action";

export default function AdminSignUpPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationKey: "",
  });

  useEffect(() => {
    if (!isPending && session?.user) {
      const role = session.user.role;
      if (role === "ADMIN") router.replace("/admin-dashboard");
      else if (role === "SELLER") router.replace("/sellers-dashboard");
      else router.replace("/");
    }
  }, [session, isPending, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please enter a valid email address";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!formData.registrationKey.trim()) errors.registrationKey = "Admin registration key is required";
    if (!acceptedTerms) errors.terms = "You must accept the terms and conditions";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("password", formData.password);
      fd.append("registrationKey", formData.registrationKey);
      fd.append("acceptedTerms", acceptedTerms ? "true" : "false");
      const result = await signUpAdminAction(fd);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Admin account created. Please verify your email.");
        router.push("/sign-up/success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-background/90 px-5 py-4 shadow-lg border border-border flex items-center gap-3">
            <Spinner className="size-5" />
            <span className="text-sm font-medium">Creating your account...</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create Admin Account</CardTitle>
            <CardDescription className="text-center">
              Requires a valid admin registration key. Contact an existing admin if you don&apos;t have one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} />
                {validationErrors.password && <p className="text-sm text-red-500">{validationErrors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} />
                {validationErrors.confirmPassword && <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationKey">Admin Registration Key</Label>
                <Input
                  id="registrationKey"
                  type="password"
                  value={formData.registrationKey}
                  onChange={(e) => setFormData((p) => ({ ...p, registrationKey: e.target.value }))}
                />
                {validationErrors.registrationKey && <p className="text-sm text-red-500">{validationErrors.registrationKey}</p>}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(v === true)} />
                <Label htmlFor="terms" className="text-sm font-normal leading-5">
                  I accept the{" "}
                  <Link href="/terms-conditions" target="_blank" className="text-primary underline underline-offset-4">Terms and Conditions</Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-primary underline underline-offset-4">Privacy Policy</Link>.
                </Label>
              </div>
              {validationErrors.terms && <p className="text-sm text-red-500">{validationErrors.terms}</p>}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/sign-in" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
