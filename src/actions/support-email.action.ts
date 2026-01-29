"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import transporter from "@/lib/nodemailer";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@testazbid.com";

export async function sendSupportEmailAction({
  subject,
  message,
  userEmail,
  userName,
}: {
  subject: string;
  message: string;
  userEmail: string;
  userName: string;
}) {
  try {
    // Email to support team
    const supportEmailHtml = `
      <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;font-family:Arial,sans-serif;">
        <h2 style="color:#333;border-bottom:2px solid #007bff;padding-bottom:10px;">New Support Request</h2>
        <div style="margin:20px 0;">
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background:#f5f5f5;padding:15px;border-radius:4px;margin:20px 0;">
          <h3 style="margin-top:0;color:#333;">Message:</h3>
          <p style="white-space:pre-wrap;color:#555;line-height:1.6;">${message}</p>
        </div>
        <p style="color:#888;font-size:12px;margin-top:20px;">This message was sent from the Az-Bid Help & Support page.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: SUPPORT_EMAIL,
      subject: `Az-Bid Support Request: ${subject}`,
      html: supportEmailHtml,
      replyTo: userEmail, // Allow support team to reply directly
    });

    // Optional: Send confirmation email to user
    const confirmationHtml = `
      <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;font-family:Arial,sans-serif;">
        <h2 style="color:#333;">Thank You for Contacting Support</h2>
        <p>Hello ${userName},</p>
        <p>We've received your support request and will get back to you within 24 hours.</p>
        <div style="background:#f5f5f5;padding:15px;border-radius:4px;margin:20px 0;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Your Message:</strong></p>
          <p style="white-space:pre-wrap;color:#555;">${message}</p>
        </div>
        <p>If you have any urgent concerns, please contact us directly at ${SUPPORT_EMAIL}.</p>
        <p style="color:#888;font-size:12px;margin-top:20px;">Best regards,<br>The Az-Bid Support Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: userEmail,
      subject: "Az-Bid - Support Request Received",
      html: confirmationHtml,
    });

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error sending support email:", error);
    return {
      success: false,
      error: error.message || "Failed to send support email. Please try again.",
    };
  }
}