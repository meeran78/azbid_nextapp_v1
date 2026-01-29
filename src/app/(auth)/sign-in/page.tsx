"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWith } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { signInEmailAction } from "@/actions/signInEmail.action";
import { SignInOauthButton } from "@/app/components/SignInOauthButton";
import { MagicLinkLoginForm } from "@/app/components/MagicLinkForm";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

   
    try {
       // Create FormData from the form values
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

      const { error, errorCode } = await signInEmailAction(formData);

      if (error) {
        toast.error(error);
        setIsLoading(false);
        
        // Show specific toast based on error code
        switch (errorCode) {
          case "USER_NOT_FOUND":
            toast.error("User Not Found", {
              description: "No account found with this email. Would you like to sign up?",
              action: {
                label: "Sign Up",
                onClick: () => router.push("/sign-up"),
              },
              duration: 5000,
            });
            break;
          case "INVALID_CREDENTIALS":
            toast.error("Invalid Credentials", {
              description: "The email or password you entered is incorrect.",
              duration: 4000,
            });
            break;
          case "TOO_MANY_REQUESTS":
            toast.error("Too Many Attempts", {
              description: "Please wait a few minutes before trying again.",
              duration: 5000,
            });
            break;
          case "EMAIL_REQUIRED":
          case "PASSWORD_REQUIRED":
            toast.warning("Missing Information", {
              description: error,
              duration: 3000,
            });
            break;
          default:
            toast.error("Sign In Failed", {
              description: error,
              duration: 4000,
            });
        }
      } else {
        // Success toast
        toast.success("Welcome Back!", {
          description: "You've been successfully signed in.",
          duration: 3000,
        });
        
       
        // Small delay before redirect for better UX
        // Use window.location for full page reload to ensure session is refreshed
        // This ensures cookies are properly read and session updates
        // setTimeout(() => {
        //   window.location.href = "/";
        // }, 1000);
         // Wait for session to update, then redirect based on role
         setTimeout(async () => {
          try {
            // Fetch session directly from Better Auth API
            const response = await fetch("/api/auth/get-session", {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (response.ok) {
              const sessionData = await response.json();
              const userRole = sessionData?.user?.role;
              
              if (userRole === "SELLER") {
                window.location.href = "/sellers-dashboard";
              }  else if (userRole === "ADMIN") {
                window.location.href = "/admin-dashboard";
              } else {
                window.location.href = "/";
              }
            } else {
              // Fallback to home if session fetch fails
              window.location.href = "/";
            }
          } catch (err) {
            console.error("Error fetching session:", err);
            // Fallback to home if session fetch fails
            window.location.href = "/";
          }
        }, 1000);
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error("Sign In Error", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex flex-col gap-2 space-y-2 mb-4">
            <SignInOauthButton provider="google" signUp={false} /> 
          </div>
          <div className="flex flex-col gap-2 space-y-2 mb-4">
            <SignInOauthButton provider="github" signUp={false} /> 
          </div> */}
          {/* <MagicLinkLoginForm /> */}

          {/* <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/sign-up"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}