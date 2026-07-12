import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAppointmentRequestsAction } from "@/actions/appointment-request.action";
import { AdminAppointmentSchedulePanel } from "@/app/components/admin/AdminAppointmentSchedulePanel";

export default async function ScheduledCallsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const requests = await getAdminAppointmentRequestsAction();

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduled Calls</h1>
        <p className="mt-1 text-muted-foreground">
          Review call requests submitted from the contact page and approve or reject them.
        </p>
      </div>

      <AdminAppointmentSchedulePanel requests={requests} />
    </div>
  );
}
