"use server";

import { Buffer } from "node:buffer";
import { resend, RESEND_FROM_EMAIL, RESEND_FROM_NAME } from "@/lib/resend";

const styles = {
    container:
        "max-width:500px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;",
    heading: "font-size:20px;color:#333;",
    paragraph: "font-size:16px;",
    link: "display:inline-block;margin-top:15px;padding:10px 15px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;",
};

export async function sendEmailAction({
    to,
    subject,
    meta,
    attachments = [],
}: {
    to: string;
    subject: string;
    meta: {
        description: string;
        link: string;
    };
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}) {
    try {
        if (!resend) {
            return { success: false };
        }

        const { error } = await resend.emails.send({
            from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
            to: [to],
            subject: `Az-Bid - ${subject}`,
            html: `
    <div style="${styles.container}">
      <h1 style="${styles.heading}">${subject}</h1>
      <p style="${styles.paragraph}">${String(meta.description).replace(/\n/g, "<br/>")}</p>
      <a href="${meta.link}" style="${styles.link}">Click Here</a>
    </div>
    `,
            attachments: attachments.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content.toString("base64"),
                encoding: "base64",
                contentType: attachment.contentType,
            })),
        });

        // The Resend SDK resolves (rather than throws) on API-level failures
        // like an unverified sending domain, so this must be checked explicitly.
        if (error) {
            console.error("[SendEmail] Resend API error:", error);
            return { success: false };
        }

        return { success: true };
    } catch (err) {
        console.error("[SendEmail]:", err);
        return { success: false };
    }
}