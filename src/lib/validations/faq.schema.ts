import { z } from "zod";

export const faqSchema = z.object({
  id: z.string().uuid().optional(), // present on update
  question: z.string().min(5, "Question is too short"),
  answer: z.string().min(10, "Answer is too short"),
  category: z.string().max(100).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqSchema>;