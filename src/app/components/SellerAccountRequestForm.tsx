"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { submitSellerAccountRequestAction } from "@/actions/seller-account-request.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function SellerAccountRequestForm() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [country, setCountry] = useState("USA");
  const [emailError, setEmailError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);

    if (!isLoggedIn) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (!acceptedTerms) {
        toast.error("You must accept the terms and conditions.");
        return;
      }
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("companyName", companyName);
    fd.set("companyRegistrationNumber", companyRegistrationNumber);
    fd.set("addressLine1", addressLine1);
    fd.set("addressLine2", addressLine2);
    fd.set("city", city);
    fd.set("state", state);
    fd.set("zipcode", zipcode);
    fd.set("country", country);
    if (!isLoggedIn) {
      fd.set("password", password);
      fd.set("confirmPassword", confirmPassword);
      fd.set("acceptedTerms", acceptedTerms ? "true" : "false");
    }

    const result = await submitSellerAccountRequestAction(fd);
    if (result.error) {
      const msg = result.error;
      if (
        result.code === "EMAIL_TAKEN" ||
        result.code === "REQUEST_EXISTS" ||
        msg.includes("already registered") ||
        msg.includes("already in progress")
      ) {
        setEmailError(msg);
      }
      toast.error(msg);
      setIsSubmitting(false);
      return;
    }
    toast.success(
      isLoggedIn
        ? "Seller account request submitted. Admin will review and email you."
        : "Account created and seller request submitted. Check your email to verify your address."
    );
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
    setCompanyName("");
    setCompanyRegistrationNumber("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("");
    setZipcode("");
    setCountry("USA");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-3xl rounded-lg border bg-card p-6 space-y-4 text-left">
      <h3 className="text-xl font-semibold">Seller Account Request Form</h3>
      <p className="text-sm text-muted-foreground">
        {isLoggedIn
          ? "Submit company details. Admin will review, send contract details, and you will acknowledge before approval."
          : "Create your account and submit company details in one step. Admin will review, send contract details, and you will acknowledge before approval."}
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requesterName">Your Name</Label>
          <Input id="requesterName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requesterEmail">Email</Label>
          <Input
            id="requesterEmail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
            className={emailError ? "border-destructive" : undefined}
            aria-invalid={Boolean(emailError)}
            required
            disabled={isLoggedIn}
          />
          {emailError && (
            <p className="text-sm text-destructive" role="alert">
              {emailError}
            </p>
          )}
        </div>
      </div>
      {!isLoggedIn && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sellerPassword">Password</Label>
            <Input
              id="sellerPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerConfirmPassword">Confirm Password</Label>
            <Input
              id="sellerConfirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyReg">Company Registration Number</Label>
          <Input id="companyReg" value={companyRegistrationNumber} onChange={(e) => setCompanyRegistrationNumber(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address1">Address Line 1</Label>
        <Input id="address1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address2">Address Line 2 (optional)</Label>
        <Input id="address2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipcode">Zipcode</Label>
          <Input id="zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
      </div>
      {!isLoggedIn && (
        <div className="flex items-start gap-2">
          <Checkbox
            id="sellerTerms"
            checked={acceptedTerms}
            onCheckedChange={(v) => setAcceptedTerms(v === true)}
          />
          <Label htmlFor="sellerTerms" className="text-sm font-normal leading-5">
            I accept the{" "}
            <Link href="/terms-conditions" target="_blank" className="text-primary underline underline-offset-4">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className="text-primary underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </Label>
        </div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isLoggedIn
            ? "Submitting..."
            : "Creating Account..."
          : isLoggedIn
            ? "Submit Seller Request"
            : "Create Account & Submit Request"}
      </Button>
    </form>
  );
}
