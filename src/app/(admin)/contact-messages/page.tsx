import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminContactMessages } from "@/actions/contact-message.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { ContactMessagesTable } from "./ContactMessagesTable";

export default async function ContactMessagesPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const messages = await getAdminContactMessages();

  return (
    <div className="container mx-auto max-w-10xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="mt-1 text-muted-foreground">
          Review and manage customer inquiries stored from the contact form.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages ({messages.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update status after you follow up with the sender.
          </p>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No contact messages have been submitted yet.
            </p>
          ) : (
            <ContactMessagesTable messages={messages} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
