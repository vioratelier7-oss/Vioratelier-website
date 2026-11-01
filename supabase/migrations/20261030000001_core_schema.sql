-- VIOR ATELIER · 0001 · core schema
-- Every table: UUID primary key, created_at / updated_at, RLS enabled (policies in 0002).

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

-- ---------------------------------------------------------------- enums
create type public.app_role as enum ('super_admin', 'editor');
create type public.content_status as enum ('draft', 'published');
create type public.inquiry_status as enum ('new', 'contacted', 'proposal_sent', 'in_discussion', 'converted', 'closed');

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- slugs: lowercase letters, digits and single hyphens
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(value) between 1 and 120);

-- ---------------------------------------------------------------- people
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text check (char_length(full_name) <= 120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index user_roles_role_idx on public.user_roles (role);

-- ---------------------------------------------------------------- portfolio
create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  description text check (char_length(description) <= 500),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug public.slug not null unique,
  client_name text check (char_length(client_name) <= 160),
  category_id uuid references public.project_categories (id) on delete set null,
  short_description text check (char_length(short_description) <= 400),
  overview text check (char_length(overview) <= 20000),
  challenge text check (char_length(challenge) <= 20000),
  solution text check (char_length(solution) <= 20000),
  results text check (char_length(results) <= 20000),
  results_verified boolean not null default false,
  cover_image_url text,
  cover_image_alt text check (char_length(cover_image_alt) <= 300),
  project_url text check (project_url is null or project_url ~* '^https?://'),
  technologies text[] not null default '{}',
  completed_on date,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  is_sample boolean not null default false, -- placeholder/sample content, badge shown publicly
  sort_order int not null default 0,
  published_at timestamptz,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  og_image_url text,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_idx on public.projects (status, is_featured, sort_order);
create index projects_category_idx on public.projects (category_id);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_url text not null,
  storage_path text,
  alt_text text check (char_length(alt_text) <= 300),
  caption text check (char_length(caption) <= 300),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index project_images_project_idx on public.project_images (project_id, sort_order);

-- ---------------------------------------------------------------- services
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories (id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  slug public.slug not null unique,
  summary text check (char_length(summary) <= 400),
  hero_heading text check (char_length(hero_heading) <= 200),
  overview text check (char_length(overview) <= 20000),
  scope text[] not null default '{}',            -- what the service covers
  problems text[] not null default '{}',
  benefits text[] not null default '{}',
  deliverables text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb check (jsonb_typeof(faqs) = 'array'),
  image_url text,
  image_alt text check (char_length(image_alt) <= 300),
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_status_idx on public.services (status, sort_order);

-- ---------------------------------------------------------------- leads
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email extensions.citext not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (char_length(phone) <= 32),
  business_name text check (char_length(business_name) <= 160),
  service text not null check (char_length(service) <= 120),
  budget text check (char_length(budget) <= 120),
  timeline text check (char_length(timeline) <= 120),
  description text not null check (char_length(description) between 10 and 5000),
  status public.inquiry_status not null default 'new',
  source text not null default 'website' check (char_length(source) <= 60),
  ip_hash text check (char_length(ip_hash) <= 128),
  user_agent text check (char_length(user_agent) <= 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_status_idx on public.inquiries (status, created_at desc);
create index inquiries_created_idx on public.inquiries (created_at desc);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at);

-- ---------------------------------------------------------------- testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null check (char_length(client_name) between 1 and 120),
  business_name text check (char_length(business_name) <= 160),
  designation text check (char_length(designation) <= 120),
  body text not null check (char_length(body) between 5 and 2000),
  rating smallint check (rating between 1 and 5),
  avatar_url text,
  is_approved boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- blog
create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug public.slug not null unique,
  description text check (char_length(description) <= 500),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug public.slug not null unique,
  excerpt text check (char_length(excerpt) <= 500),
  content_html text not null default '' check (char_length(content_html) <= 200000),
  cover_image_url text,
  cover_image_alt text check (char_length(cover_image_alt) <= 300),
  category_id uuid references public.blog_categories (id) on delete set null,
  author_id uuid references auth.users (id) on delete set null,
  author_name text check (char_length(author_name) <= 120),
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,  -- a future date = scheduled publication
  reading_minutes int not null default 1 check (reading_minutes between 1 and 240),
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 320),
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_published_has_date check (status = 'draft' or published_at is not null)
);
create index blog_posts_public_idx on public.blog_posts (status, published_at desc);
create index blog_posts_category_idx on public.blog_posts (category_id);

-- ---------------------------------------------------------------- media
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null,
  public_url text not null,
  file_name text not null check (char_length(file_name) <= 255),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml')),
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 10485760),
  width int,
  height int,
  alt_text text check (char_length(alt_text) <= 300),
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);
create index media_assets_created_idx on public.media_assets (created_at desc);

-- ---------------------------------------------------------------- settings & SEO
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  brand_name text not null default 'VIOR ATELIER',
  tagline text not null default 'Crafting Digital Experiences.',
  logo_url text,
  intro text,
  footer_text text,
  contact_phone text,
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{8,15}$'),
  whatsapp_message text,
  contact_email text,
  website_url text,
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  budget_options text[] not null default '{}',
  timeline_options text[] not null default '{}',
  default_seo_title text,
  default_seo_description text,
  default_og_image_url text,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^/[a-z0-9/\-]*$'),
  label text not null,
  meta_title text check (char_length(meta_title) <= 120),
  meta_description text check (char_length(meta_description) <= 320),
  canonical_url text,
  og_title text check (char_length(og_title) <= 120),
  og_description text check (char_length(og_description) <= 320),
  og_image_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- audit & abuse
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index activity_logs_created_idx on public.activity_logs (created_at desc);

create table public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket_key text not null unique,
  window_start timestamptz not null default now(),
  hits int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','user_roles','project_categories','projects','project_images','service_categories',
    'services','inquiries','inquiry_notes','testimonials','blog_categories','blog_posts','media_assets','site_settings',
    'seo_pages','activity_logs','rate_limits']
  loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;
