import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveSellerAccountRequestAction,
  rejectSellerAccountRequestAction,
  sendSellerContractAction,
} from "@/actions/seller-account-request.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function SellerAccountRequestsPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requests = await prisma.sellerAccountRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function sendContractFormAction(formData: FormData) {
    "use server";
    await sendSellerContractAction(formData);
  }

  async function approveFormAction(formData: FormData) {
    "use server";
    await approveSellerAccountRequestAction(formData);
  }

  async function rejectFormAction(formData: FormData) {
    "use server";
    await rejectSellerAccountRequestAction(formData);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Seller Account Requests</h1>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No seller requests yet.</p>
      ) : (
        requests.map((req) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">{req.companyName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {req.requesterName} ({req.requesterEmail})
                </p>
              </div>
              <Badge>{req.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><span className="font-medium">Registration #:</span> {req.companyRegistrationNumber}</p>
                <p><span className="font-medium">Address:</span> {[req.addressLine1, req.addressLine2, req.city, req.state, req.zipcode, req.country].filter(Boolean).join(", ")}</p>
                {req.acknowledgementName && (
                  <p><span className="font-medium">Acknowledged by:</span> {req.acknowledgementName}</p>
                )}
              </div>

              <form action={sendContractFormAction} className="space-y-2">
                <Input type="hidden" name="requestId" value={req.id} />
                <label className="text-sm font-medium">Contract details to send</label>
                <Textarea
                  name="contractDetails"
                  placeholder="Enter contract details, terms, required documents, onboarding notes..."
                  defaultValue={req.contractDetails ?? ""}
                  rows={4}
                />
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Contract PDF *</label>
                    <Input name="contractPdf" type="file" accept="application/pdf" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Terms PDF</label>
                    <Input name="termsPdf" type="file" accept="application/pdf" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Policy PDF</label>
                    <Input name="policyPdf" type="file" accept="application/pdf" />
                  </div>
                </div>
                <Button type="submit" variant="outline">Send Contract Details</Button>
              </form>

              <div className="flex flex-wrap gap-3">
                <form action={approveFormAction}>
                  <Input type="hidden" name="requestId" value={req.id} />
                  <Button type="submit">Approve & Create Seller Access</Button>
                </form>
                <form action={rejectFormAction} className="flex gap-2 items-start">
                  <Input type="hidden" name="requestId" value={req.id} />
                  <Input name="adminNotes" placeholder="Optional reject reason" />
                  <Button type="submit" variant="destructive">Reject</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
