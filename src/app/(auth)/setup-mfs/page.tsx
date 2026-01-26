"use client";

import { useState } from "react";
import { enableMfa, verifyMfa } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupMFAPage() {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");

  const handleSetup = async () => {
    const result = await enableMfa.totp.setup();
    if (result.data) {
      setSecret(result.data.secret);
      setQrCode(result.data.qrCode);
      setStep("verify");
    }
  };

  const handleVerify = async () => {
    const result = await verifyMfa.totp({
      code,
      secret,
    });

    if (result.data) {
      window.location.href = "/admin-dashboard";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Multi-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "setup" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enable MFA to secure your admin account.
              </p>
              <Button onClick={handleSetup} className="w-full">
                Setup TOTP
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" />
              </div>
              <p className="text-sm text-center">Scan with your authenticator app</p>
              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <Button onClick={handleVerify} className="w-full">
                Verify & Enable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}