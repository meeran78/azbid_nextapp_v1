"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { submitAppointmentRequestAction } from "@/actions/appointment-request.action";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AppointmentType = "IN_PERSON" | "VIRTUAL" | "PHONE";

type AuctionCalendarAppointmentDialogProps = {
  triggerLabel?: string;
};

export function AuctionCalendarAppointmentDialog({
  triggerLabel = "Appointment Schedule",
}: AuctionCalendarAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("VIRTUAL");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  const selectedDateText = useMemo(() => {
    if (!date) return "Select date";
    return format(date, "PPP");
  }, [date]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setAppointmentType("VIRTUAL");
    setDate(undefined);
    setTime("10:00");
    setNotes("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select an appointment date.");
      return;
    }

    const [hours, minutes] = time.split(":").map((v) => Number(v));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      toast.error("Please select a valid time.");
      return;
    }

    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const fd = new FormData();
    fd.set("requesterName", name);
    fd.set("requesterEmail", email);
    fd.set("requesterPhone", phone);
    fd.set("appointmentDate", scheduledAt.toISOString());
    fd.set("appointmentType", appointmentType);
    fd.set("notes", notes);

    setSubmitting(true);
    const result = await submitAppointmentRequestAction(fd);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Appointment request submitted. Admin will review it shortly.");
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-muted-foreground hover:text-background"
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Schedule an Appointment</DialogTitle>
          <DialogDescription>
            Choose date/time and call type (in-person, virtual, or phone). Admin
            will review and approve your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appt-name">Full Name</Label>
              <Input
                id="appt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appt-email">Email</Label>
              <Input
                id="appt-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appt-phone">Phone (optional)</Label>
              <Input
                id="appt-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Call Option</Label>
              <Select
                value={appointmentType}
                onValueChange={(v) => setAppointmentType(v as AppointmentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PERSON">In-person</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="w-full justify-start">
                    {selectedDateText}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appt-time">Appointment Time</Label>
              <Input
                id="appt-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appt-notes">Notes (optional)</Label>
            <Textarea
              id="appt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share anything useful before the call..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Appointment Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
