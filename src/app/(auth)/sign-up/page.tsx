"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWith } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { signUpEmailAction } from "@/actions/signUpEmail.action";
import { motion } from "framer-motion";
import { ShoppingBag, Store, Shield, Check } from "lucide-react";
import { SignInOauthButton } from "@/app/components/SignInOauthButton";
import { useRef } from "react";
import LoginCompanyInfo, { type LoginCompanyInfoRef } from "@/app/components/admin/LoginCompanyInfo";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminkey = searchParams.get("adminkey");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const companyInfoRef = useRef<LoginCompanyInfoRef>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BUYER" as "BUYER" | "SELLER" | "ADMIN", // Add role with default
  });

  const rolediv = [
    {
      value: "BUYER",
      label: "Buyer",
      icon: ShoppingBag,
      description: "Bid on auctions",
      color: "from-blue-500 to-blue-600",
    },
    {
      value: "SELLER",
      label: "Seller",
      icon: Store,
      description: "List items to sell",
      color: "from-purple-500 to-purple-600",
    }
  ]
  if (adminkey === "falah2026") {
    rolediv.push({
      value: "ADMIN",
      label: "Admin",
      icon: Shield,
      description: "Manage platform",
      color: "from-amber-500 to-orange-600",
    });
  }

  const validateForm = async () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain uppercase, lowercase, and a number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!acceptedTerms) {
      errors.terms = "You must accept the terms and conditions";
    }

    if (!formData.role) {
      errors.role = "Please select an account type";
    }

    if (formData.role === "SELLER" && companyInfoRef.current) {
      const isValid = await companyInfoRef.current.trigger();
      if (!isValid) {
        errors.companyInfo = "Please fill out all required company information.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setValidationErrors({});

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    // Validate company info when role is SELLER
    if (formData.role === "SELLER") {
      const isValid = await companyInfoRef.current?.trigger();
      if (!isValid) {
        setValidationErrors((prev) => ({
          ...prev,
          companyInfo: "Please fill out all required company information.",
        }));
        return;
      }
    }
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("role", formData.role);
      formDataObj.append("acceptedTerms", acceptedTerms ? "true" : "false");

      if (formData.role === "SELLER" && companyInfoRef.current) {
        const companyInfo = companyInfoRef.current.getValues();
        formDataObj.append("companyName", companyInfo.companyName?.trim() ?? "");
        formDataObj.append("companyDescription", companyInfo.companyDescription?.trim() ?? "");
        formDataObj.append("companyLocationDescription", companyInfo.companyLocationDescription?.trim() ?? "");
        formDataObj.append("addressLine1", companyInfo.addressLine1?.trim() ?? "");
        formDataObj.append("addressLine2", companyInfo.addressLine2?.trim() ?? "");
        formDataObj.append("city", companyInfo.city?.trim() ?? "");
        formDataObj.append("state", companyInfo.state?.trim() ?? "");
        formDataObj.append("zipcode", companyInfo.zipcode?.trim() ?? "");
        formDataObj.append("country", companyInfo.country?.trim() ?? "");
        formDataObj.append("businessPhone", companyInfo.businessPhone?.trim() ?? "");
      }

      const result = await signUpEmailAction(formDataObj);
      const error = result?.error ?? null;

      if (error) {
        setError(error);
        toast.error(error);
      } else {
        setSuccess(true);
        toast.success("Account created successfully. Please check your email to verify your account.");
        router.push("/sign-up/success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }

  };


  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <div>
                <h2 className="text-2xl font-bold">Account Created!</h2>
                <p className="text-muted-foreground mt-2">
                  Please check your email to verify your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create {formData.role === "BUYER" ? "Buyer" : formData.role === "SELLER" ? "Seller" : "Admin"} Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to start bidding on amazing auctions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/*<div className="flex flex-col gap-2 space-y-2 mb-4">
            <SignInOauthButton provider="google" signUp={false} /> 
          </div>
          <div className="flex flex-col gap-2 space-y-2 mb-4">
            <SignInOauthButton provider="github" signUp={false} /> 
          </div> */}

          {/* <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={validationErrors.name ? "border-red-500" : ""}
                disabled={isLoading || isGoogleLoading}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
                disabled={isLoading || isGoogleLoading}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={validationErrors.password ? "border-red-500" : ""}
                disabled={isLoading || isGoogleLoading}
              />
              {validationErrors.password && (
                <p className="text-sm text-red-500">{validationErrors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className={validationErrors.confirmPassword ? "border-red-500" : ""}
                disabled={isLoading || isGoogleLoading}
              />
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>
                Account Type <span className="text-red-500">*</span>
              </Label>
              <div className={`grid grid-cols-1 ${adminkey ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 "`}>
                {rolediv.map((roleOption) => {
                  const Icon = roleOption.icon;
                  const isSelected = formData.role === roleOption.value;

                  return (
                    <motion.button
                      key={roleOption.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, role: roleOption.value as any }));
                        if (validationErrors.role) {
                          setValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.role;
                            return newErrors;
                          });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${isSelected
                        ? `border-primary bg-gradient-to-br ${roleOption.color} text-white shadow-lg`
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                        }`}
                      disabled={isLoading || isGoogleLoading}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isSelected ? 1 : 0.9,
                          opacity: isSelected ? 1 : 0.7,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center space-y-2 word-wrap"
                      >
                        <div className={`p-2 rounded-full ${isSelected ? "bg-white/20" : "bg-muted"
                          }`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <span className={`font-semibold text-sm ${isSelected ? "text-white" : "text-foreground"
                          }`}>
                          {roleOption.label}
                        </span>
                        <span className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"
                          }`}>
                          {roleOption.description}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="absolute top-2 right-2"
                          >
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>  {validationErrors.role && (
                <p className="text-sm text-red-500">{validationErrors.role}</p>
              )}
              {formData.role === "SELLER" && (
                <div className="text-sm text-muted-foreground space-y-2 mt-4 mb-4 ">
                  {/* <span className="text-red-500">*</span> */}
                  <p className="text-sm text-muted-foreground text-center text-gray-500">Seller accounts are subject to approval. Please fill out the following information to complete your account creation.</p>
                  <LoginCompanyInfo ref={companyInfoRef} />
                </div>
              )}{validationErrors.companyInfo && (
                <p className="text-sm text-red-500 mt-2">{validationErrors.companyInfo}</p>
              )}

            </div>
            {/* Terms and Conditions Checkbox */}
            <div className="space-y-2">

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked === true);
                    if (validationErrors.terms) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.terms;
                        return newErrors;
                      });
                    }
                  }}
                  className={validationErrors.terms ? "border-red-500" : ""}
                  disabled={isLoading || isGoogleLoading}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I accept the{" "}
                  <Link
                    href="/terms-conditions"
                    target="_blank"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-red-500">*</span>
                </Label>
              </div>
              {validationErrors.terms && (
                <p className="text-sm text-red-500">{validationErrors.terms}</p>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading
                ? "Creating Account..."
                : `Create ${formData.role === "BUYER" ? "Buyer" : formData.role === "SELLER" ? "Seller" : "Admin"} Account`
              }
            </Button>

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/sign-in"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}