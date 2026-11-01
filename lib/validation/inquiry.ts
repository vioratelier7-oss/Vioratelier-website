import { z } from "zod";
import { SERVICE_OPTIONS } from "@/lib/utils";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254),
  phone: z.string().trim().max(32).regex(/^[+0-9()\-\s]*$/, "Please use digits, spaces, + or -.").optional().or(z.literal("")),
  businessName: optionalText(160),
  service: z.enum(SERVICE_OPTIONS, { errorMap: () => ({ message: "Please choose a service." }) }),
  budget: optionalText(120),
  timeline: optionalText(120),
  description: z.string().trim().min(20, "Please tell us a little more (at least 20 characters).").max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree so we can reply to you." }) }),
  // spam protection
  website: z.string().max(0).optional().or(z.literal("")), // honeypot: real people never see or fill this
  startedAt: z.number().int().positive(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
