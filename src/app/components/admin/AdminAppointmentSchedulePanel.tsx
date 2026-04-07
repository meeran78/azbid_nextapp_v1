"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  approveAppointmentRequestAction,
  rejectAppointmentRequestAction,
} from "@/actions/appointment-request.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AppointmentItem = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  appointmentDate: string;
  appointmentType: "IN_PERSON" | "VIRTUAL" | "PHONE";
  notes: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
};

type Props = {
  requests: AppointmentItem[];
};

export function AdminAppointmentSchedulePanel({ requests }: Props) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const selectedRequests = useMemo(() => {
    if (!selectedDate) return requests;
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const d = selectedDate.getDate();

    return requests.filter((r) => {
      const date = new Date(r.appointmentDate);
      return (
        date.getFullYear() === y &&
        date.getMonth() === m &&
        date.getDate() === d
      );
    });
  }, [requests, selectedDate]);

  const datesWithRequests = useMemo(
    () => requests.map((r) => new Date(r.appointmentDate)),
    [requests]
  );

  const handleApprove = async (id: string) => {
    setBusyId(id);
    const fd = new FormData();
    fd.set("requestId", id);
    const result = await approveAppointmentRequestAction(fd);
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Appointment request approved.");
    router.refresh();
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    const fd = new FormData();
    fd.set("requestId", id);
    fd.set("adminNotes", rejectNotes[id] ?? "");
    const result = await rejectAppointmentRequestAction(fd);
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Appointment request rejected.");
    router.refresh();
  };

  return (
    <Card id="appointment-schedule">
      <CardHeader>
        <CardTitle>Appointment Schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick a date in the calendar, then review and approve/reject requests.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-md border p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasRequests: datesWithRequests }}
            modifiersClassNames={{ hasRequests: "bg-primary/10 font-semibold rounded-md" }}
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {selectedDate
              ? `Requests for ${format(selectedDate, "PPP")}`
              : "All appointment requests"}
          </p>

          {selectedRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests for the selected date.</p>
          ) : (
            selectedRequests.map((request) => (
              <div key={request.id} className="rounded-md border p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{request.requesterName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.requesterEmail}
                      {request.requesterPhone ? ` • ${request.requesterPhone}` : ""}
                    </p>
                  </div>
                  <Badge>{request.status}</Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Call type:</span>{" "}
                    {request.appointmentType.replace("_", " ")}
                  </p>
                  <p>
                    <span className="font-medium">Scheduled for:</span>{" "}
                    {new Date(request.appointmentDate).toLocaleString()}
                  </p>
                  {request.notes && (
                    <p>
                      <span className="font-medium">Notes:</span> {request.notes}
                    </p>
                  )}
                  {request.adminNotes && (
                    <p>
                      <span className="font-medium">Admin notes:</span> {request.adminNotes}
                    </p>
                  )}
                </div>

                {request.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={busyId === request.id}
                    >
                      {busyId === request.id ? "Saving..." : "Approve"}
                    </Button>
                    <Input
                      placeholder="Reason (optional)"
                      value={rejectNotes[request.id] ?? ""}
                      onChange={(e) =>
                        setRejectNotes((prev) => ({ ...prev, [request.id]: e.target.value }))
                      }
                      className="max-w-xs"
                    />
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={busyId === request.id}
                    >
                      {busyId === request.id ? "Saving..." : "Reject"}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
