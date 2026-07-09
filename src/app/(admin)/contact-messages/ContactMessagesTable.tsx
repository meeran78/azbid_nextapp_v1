"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateContactMessageStatusAction } from "@/actions/contact-message.action";
import { toast } from "sonner";
import type { ContactMessage, ContactMessageStatus, User } from "@/generated/prisma/client";

interface ContactMessageWithUser extends ContactMessage {
  user: Pick<User, "id" | "name" | "email"> | null;
}

const statusStyles: Record<ContactMessageStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  REVIEWED: "bg-amber-100 text-amber-700",
  REPLIED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

export function ContactMessagesTable({ messages }: { messages: ContactMessageWithUser[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: ContactMessageStatus) => {
    startTransition(async () => {
      try {
        await updateContactMessageStatusAction({ id, status });
        toast.success("Message status updated.");
      } catch (error: any) {
        toast.error(error?.message || "Failed to update status.");
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-3 py-2">Sender</th>
            <th className="px-3 py-2">Subject</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Received</th>
            <th className="px-3 py-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr key={message.id} className="border-b align-top">
              <td className="px-3 py-3">
                <div className="font-medium">{message.name}</div>
                <div className="text-xs text-muted-foreground">{message.email}</div>
                {message.user ? (
                  <div className="text-xs text-muted-foreground">Linked user: {message.user.name}</div>
                ) : null}
              </td>
              <td className="px-3 py-3">{message.subject}</td>
              <td className="px-3 py-3">{message.category || "General"}</td>
              <td className="px-3 py-3">
                <Select
                  value={message.status}
                  onValueChange={(value) => handleStatusChange(message.id, value as ContactMessageStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="REPLIED">Replied</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={`mt-2 ${statusStyles[message.status]}`}>{message.status}</Badge>
              </td>
              <td className="px-3 py-3 text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleString()}
              </td>
              <td className="max-w-[320px] px-3 py-3">
                <p className="whitespace-pre-wrap text-sm">{message.message}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
