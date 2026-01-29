"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { upsertFaqAction } from "@/actions/faq.actions";
import type { Faq } from "@prisma/client";
import { toast } from "sonner";

interface FaqManagerProps {
  initialFaqs: Faq[];
}

const emptyForm = {
  id: "" as string | "",
  question: "",
  answer: "",
  category: "",
  sortOrder: 0,
  isActive: true,
};

export default function FaqManager({ initialFaqs }: FaqManagerProps) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (faq: Faq) => {
    setForm({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
  };

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          id: form.id || undefined,
          question: form.question,
          answer: form.answer,
          category: form.category || null,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: !!form.isActive,
        };

        const res = await upsertFaqAction(payload);
        if (res?.success) {
          toast.success(form.id ? "FAQ updated" : "FAQ created");

          // Optimistically update list
          setFaqs((prev) => {
            if (form.id) {
              return prev.map((f) =>
                f.id === form.id
                  ? { ...f, ...payload }
                  : f
              );
            }
            // fake new FAQ for UI – in real usage you may want to refetch
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                question: payload.question,
                answer: payload.answer,
                category: payload.category,
                sortOrder: payload.sortOrder,
                isActive: payload.isActive,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as Faq,
            ];
          });

          setForm(emptyForm);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save FAQ");
      }
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Frequently Asked Questions (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={form.question}
                onChange={(e) => handleChange("question", e.target.value)}
                placeholder="Enter FAQ question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="e.g. Bidding, Payments"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              rows={4}
              value={form.answer}
              onChange={(e) => handleChange("answer", e.target.value)}
              placeholder="Enter FAQ answer"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <select
                id="isActive"
                className="border rounded-md h-10 px-2 text-sm"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => handleChange("isActive", e.target.value === "active")}
              >
                <option value="active">Active (visible)</option>
                <option value="inactive">Inactive (hidden)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto mt-2"
            >
              {isPending ? "Saving..." : form.id ? "Update FAQ" : "Add FAQ"}
            </Button>
          </div>
        </form>

        {/* List */}
        <div>
          <h3 className="font-semibold mb-2">Existing FAQs</h3>
          {faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No FAQs yet.</p>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="flex justify-between gap-2 text-left">
                    <span>{faq.question}</span>
                 
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {faq.answer}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {faq.category ? `Category: ${faq.category}` : "No category"}
                      </span>
                      <span>
                      {faq.isActive ? `Status: ${faq.isActive ? "Active" : "Inactive"}` : "In-Active"}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(faq)}
                      >
                        Edit
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
}