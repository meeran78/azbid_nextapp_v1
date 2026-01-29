"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendSupportEmailAction } from "@/actions/support-email.action";

interface ContactSupportFormProps {
  userEmail?: string;
  userName?: string;
}

export function ContactSupportForm({
  userEmail = "",
  userName = "",
}: ContactSupportFormProps) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in both subject and message fields");
      return;
    }

    if (!userEmail) {
      toast.error("Please sign in to send a support request");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendSupportEmailAction({
        subject: formData.subject,
        message: formData.message,
        userEmail,
        userName: userName || "User",
      });

      if (result.success) {
        toast.success("Support request sent successfully! We'll get back to you within 24 hours.");
        setFormData({ subject: "", message: "" });
      } else {
        toast.error(result.error || "Failed to send support request");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact Support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Brief description of your issue"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Describe your issue in detail..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {userEmail && (
            <div className="text-xs text-muted-foreground">
              This message will be sent from: <strong>{userEmail}</strong>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !userEmail}
            className="w-full flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>

          {!userEmail && (
            <p className="text-xs text-muted-foreground text-center">
              Please sign in to send a support request
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}