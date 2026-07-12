"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM_EMAIL, RESEND_FROM_NAME } from "@/lib/resend";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.RESEND_TO_EMAIL || "support@az-bid.com";

export async function sendSupportEmailAction({
  subject,
  message,
  userEmail,
  userName,
  category,
}: {
  subject: string;
  message: string;
  userEmail: string;
  userName: string;
  category?: string;
}) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = headersList.get("user-agent") || null;

    const fromAddress = RESEND_FROM_EMAIL;
    const supportAddress = SUPPORT_EMAIL;

    if (!resend || !fromAddress || !supportAddress) {
      return {
        success: false,
        error: "Email sending is not configured yet. Please set the Resend environment variables.",
      };
    }

    const categoryLabel = category?.trim() || "General";

    await prisma.contactMessage.create({
      data: {
        name: userName || "Unknown",
        email: userEmail || "",
        subject,
        category: categoryLabel,
        message,
        ipAddress: forwardedFor || null,
        userAgent,
      },
    });

    const supportEmailHtml = `
      <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;font-family:Arial,sans-serif;">
        <h2 style="color:#333;border-bottom:2px solid #007bff;padding-bottom:10px;">New Support Request</h2>
        <div style="margin:20px 0;">
          <p><strong>From:</strong> ${userName || "Unknown"} (${userEmail || "No email provided"})</p>
          <p><strong>Category:</strong> ${categoryLabel}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;border-radius:4px;margin:20px 0;">
          <h3 style="margin-top:0;color:#333;">Message:</h3>
          <p style="white-space:pre-wrap;color:#555;line-height:1.6;">${message}</p>
        </div>
        <p style="color:#888;font-size:12px;margin-top:20px;">This message was sent from the Az-Bid contact page.</p>
      </div>
    `;

    let emailSent = false;

    try {
      const supportSend = await resend.emails.send({
        from: `${RESEND_FROM_NAME} <${fromAddress}>`,
        to: [supportAddress],
        subject: `Az-Bid Contact Request: ${subject}`,
        html: supportEmailHtml,
        replyTo: userEmail || supportAddress,
      });

      // The Resend SDK resolves (rather than throws) on API-level failures
      // like an unverified sending domain, so this must be checked explicitly.
      if (supportSend.error) {
        console.error("[SupportEmail] Resend API error:", supportSend.error);
        return {
          success: true,
          error: `Your message was saved successfully, but email delivery failed: ${supportSend.error.message}`,
          emailSent: false,
        };
      }

      if (userEmail) {
        const confirmationHtml = `
          <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;font-family:Arial,sans-serif;">
            <h2 style="color:#333;">Thank You for Contacting Az-Bid</h2>
            <p>Hello ${userName || "there"},</p>
            <p>We've received your message and will get back to you within 24 hours.</p>
            <div style="background:#f5f5f5;padding:15px;border-radius:4px;margin:20px 0;">
              <p><strong>Category:</strong> ${categoryLabel}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Your Message:</strong></p>
              <p style="white-space:pre-wrap;color:#555;">${message}</p>
            </div>
            <p>If you have any urgent concerns, please contact us directly at ${supportAddress}.</p>
            <p style="color:#888;font-size:12px;margin-top:20px;">Best regards,<br>The Az-Bid Support Team</p>
          </div>
        `;

        const confirmationSend = await resend.emails.send({
          from: `${RESEND_FROM_NAME} <${fromAddress}>`,
          to: [userEmail],
          subject: "Az-Bid - Contact Request Received",
          html: confirmationHtml,
        });
        if (confirmationSend.error) {
          console.error("[SupportEmail] Confirmation email error:", confirmationSend.error);
        }
      }

      emailSent = true;
    } catch (emailError: any) {
      const authError = /535|bad credentials|invalid login|username and password not accepted|eauth|resend/i.test(emailError?.message || "");
      if (authError) {
        return {
          success: true,
          error: "Your message was saved successfully, but email delivery could not be sent because the SMTP credentials are invalid. Please update the mail settings.",
          emailSent: false,
        };
      }

      throw emailError;
    }

    return { success: true, error: null, emailSent };
  } catch (error: any) {
    console.error("Error sending support email:", error);
    return {
      success: false,
      error: error.message || "Failed to send your message. Please try again.",
    };
  }
}