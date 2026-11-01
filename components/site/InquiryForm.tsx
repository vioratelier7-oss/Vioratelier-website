"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { inquirySchema, type InquiryInput } from "@/lib/validation/inquiry";
import { SERVICE_OPTIONS, cn } from "@/lib/utils";
import { submitInquiry } from "@/app/(site)/contact/actions";

const field = "peer w-full border-0 border-b border-stone bg-transparent px-0 pb-3 pt-7 text-[1.02rem] text-navy placeholder-transparent focus:border-navy focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-700/70";
const label = "pointer-events-none absolute left-0 top-1 text-[0.68rem] uppercase tracking-[0.22em] text-muted";

export function InquiryForm({ budgets, timelines, defaultService }: { budgets: string[]; timelines: string[]; defaultService?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, setValue, setError, reset, formState: { errors, isSubmitting } } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { service: (SERVICE_OPTIONS as readonly string[]).includes(defaultService ?? "") ? (defaultService as InquiryInput["service"]) : undefined, website: "", startedAt: 0 },
  });
  useEffect(() => { setValue("startedAt", Date.now()); }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await submitInquiry(values);
    if (res.ok) { setDone(true); reset(); return; }
    setServerError(res.error);
    if (res.fieldErrors) Object.entries(res.fieldErrors).forEach(([k, m]) => setError(k as keyof InquiryInput, { message: m }));
  });

  const isPreview = process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "1";
  const err = (k: keyof InquiryInput) => errors[k]?.message as string | undefined;

  return (
    <AnimatePresence mode="wait">
      {done ? (
        <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border border-line bg-white p-10 md:p-14" role="status">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne text-champagne-deep"><Check className="h-5 w-5" strokeWidth={1.5} /></span>
          <h3 className="h-serif mt-8 text-[2.2rem] text-navy">Thank you. Your message is with us.</h3>
          <p className="mt-4 max-w-md leading-relaxed text-ink/75">We&apos;ve received your project details and will reply personally soon. If it&apos;s urgent, WhatsApp is the quickest way to reach us.</p>
          <button type="button" onClick={() => { setDone(false); setValue("startedAt", Date.now()); }} className="eyebrow mt-10 text-navy"><span className="link-underline">Send another message</span></button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-x-10 gap-y-8 md:grid-cols-2" aria-describedby={serverError ? "form-error" : undefined}>
          <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label>Leave this field empty<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
          </div>
          <input type="hidden" {...register("startedAt", { valueAsNumber: true })} />

          <Field id="fullName" label="Full name *" error={err("fullName")}><input id="fullName" autoComplete="name" placeholder="Full name" aria-invalid={!!errors.fullName} className={field} {...register("fullName")} /></Field>
          <Field id="email" label="Email address *" error={err("email")}><input id="email" type="email" autoComplete="email" placeholder="Email" aria-invalid={!!errors.email} className={field} {...register("email")} /></Field>
          <Field id="phone" label="Phone number" error={err("phone")}><input id="phone" type="tel" autoComplete="tel" placeholder="Phone" aria-invalid={!!errors.phone} className={field} {...register("phone")} /></Field>
          <Field id="businessName" label="Business name" error={err("businessName")}><input id="businessName" autoComplete="organization" placeholder="Business" className={field} {...register("businessName")} /></Field>
          <Field id="service" label="Service required *" error={err("service")}>
            <select id="service" aria-invalid={!!errors.service} className={cn(field, "appearance-none")} defaultValue="" {...register("service")}>
              <option value="" disabled>Select a service</option>
              {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field id="budget" label="Estimated budget" error={err("budget")}>
            <select id="budget" className={cn(field, "appearance-none")} defaultValue="" {...register("budget")}>
              <option value="">Select a range</option>
              {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field id="timeline" label="Project timeline" error={err("timeline")} className="md:col-span-2">
            <select id="timeline" className={cn(field, "appearance-none")} defaultValue="" {...register("timeline")}>
              <option value="">Select a timeline</option>
              {timelines.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field id="description" label="Project description *" error={err("description")} className="md:col-span-2">
            <textarea id="description" rows={5} placeholder="Tell us about your project" aria-invalid={!!errors.description} className={cn(field, "resize-y")} {...register("description")} />
          </Field>
          <div className="md:col-span-2">
            <label className="flex items-start gap-3 text-sm text-ink/75">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-navy" {...register("consent")} />
              <span>I agree that VIOR ATELIER may store these details to respond to my inquiry, as described in the <a href="/privacy" className="underline decoration-champagne underline-offset-4">Privacy Policy</a>.</span>
            </label>
            {err("consent") && <p className="mt-2 text-sm text-red-800">{err("consent")}</p>}
          </div>
          <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
            <button type="submit" disabled={isSubmitting || isPreview} className="group inline-flex items-center justify-center gap-3 bg-navy px-9 py-5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ivory transition-colors hover:bg-navy-soft disabled:opacity-60">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Send Inquiry <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} /></>}
            </button>
            {isPreview && <p className="text-sm text-champagne-deep">Design preview: the form saves to the database once the live backend is connected.</p>}
            {serverError && <p id="form-error" role="alert" className="text-sm text-red-800">{serverError}</p>}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({ id, label: text, error, children, className }: { id: string; label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <label htmlFor={id} className={label}>{text}</label>
      {error && <p className="mt-2 text-sm text-red-800" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
