import { z } from "zod";

export const slugSchema = z.string().trim().toLowerCase()
  .min(1, "Add a slug.").max(120, "Keep the slug under 120 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens only.");

/** Image URLs: an absolute http(s) URL or a site-relative path like /images/hero.jpg */
export const imageUrl = z.string().trim().max(2000)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v) || /^\/[^\s/][^\s]*$/.test(v), "Use a full image URL or pick one from the library.")
  .transform((v) => (v === "" ? null : v));

export const optText = (max: number, label = "This field") =>
  z.string().trim().max(max, `${label} can be up to ${max} characters.`).transform((v) => (v === "" ? null : v));

export const optUrl = z.string().trim().max(2000)
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Use a full URL starting with https://")
  .transform((v) => (v === "" ? null : v));

export const statusSchema = z.enum(["draft", "published"]);
export const uuidOrEmpty = z.string().trim().refine((v) => v === "" || z.string().uuid().safeParse(v).success, "Invalid choice.").transform((v) => (v === "" ? null : v));
export const sortOrder = z.coerce.number().int("Use a whole number.").min(-100000).max(100000).catch(0);
