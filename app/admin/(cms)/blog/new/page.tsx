import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { displayName } from "@/lib/admin/session";
import { PageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "New article" };

export default async function NewPostPage() {
  const staff = await requireStaffPage();
  const { data: cats } = await staff.supabase.from("blog_categories").select("id, name").order("sort_order").order("name");
  return (<><PageHeader back={{ href: "/admin/blog", label: "Insights" }} title="New article" /><BlogForm categories={cats ?? []} defaultAuthor={displayName(staff.fullName, staff.email)} /></>);
}
