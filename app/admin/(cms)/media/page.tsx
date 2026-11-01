import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import type { MediaRow } from "@/lib/admin/media-shared";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  const staff = await requireStaffPage();
  const { data, count } = await staff.supabase
    .from("media_assets")
    .select("id, path, public_url, file_name, mime_type, size_bytes, width, height, alt_text, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <>
      <PageHeader eyebrow="Content" title="Media library" description="Every image used across the website. Uploads are checked, resized to 2400 px and converted to WebP automatically before they're stored." />
      <MediaLibrary initial={(data ?? []) as MediaRow[]} total={count ?? 0} />
    </>
  );
}
