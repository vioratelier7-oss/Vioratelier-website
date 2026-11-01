import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth";
import { displayName } from "@/lib/admin/session";
import { PageHeader } from "@/components/admin/ui";
import { BlogForm } from "@/components/admin/BlogForm";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const staff = await requireStaffPage();
  const [{ data: post }, { data: cats }] = await Promise.all([
    staff.supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
    staff.supabase.from("blog_categories").select("id, name").order("sort_order").order("name"),
  ]);
  if (!post) notFound();
  return (
    <>
      {sp.created && <FlashToast message={post.status === "published" ? "Article published." : "Draft created."} />}
      <PageHeader back={{ href: "/admin/blog", label: "Insights" }} eyebrow="Article" title={post.title} />
      <BlogForm post={post} categories={cats ?? []} defaultAuthor={displayName(staff.fullName, staff.email)} />
    </>
  );
}
