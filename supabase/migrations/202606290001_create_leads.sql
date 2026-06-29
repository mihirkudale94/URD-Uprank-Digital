create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  business_name text,
  website_url text,
  services text[] not null default '{}'::text[],
  message text,
  page_url text,
  source text not null default 'website_contact_form',
  user_agent text,
  status text not null default 'new',
  notes text,
  constraint leads_name_length check (char_length(name) between 1 and 120),
  constraint leads_email_format check (email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),
  constraint leads_phone_length check (char_length(phone) between 7 and 40),
  constraint leads_business_length check (business_name is null or char_length(business_name) <= 160),
  constraint leads_website_length check (website_url is null or char_length(website_url) <= 300),
  constraint leads_message_length check (message is null or char_length(message) <= 3000),
  constraint leads_page_url_length check (page_url is null or char_length(page_url) <= 500),
  constraint leads_user_agent_length check (user_agent is null or char_length(user_agent) <= 500),
  constraint leads_service_count check (coalesce(array_length(services, 1), 0) <= 8),
  constraint leads_allowed_services check (
    services <@ array[
      'Digital Services',
      'Marketing Services',
      'Advertising Services',
      'Content Services',
      'Software Services'
    ]::text[]
  ),
  constraint leads_status_value check (status in ('new', 'contacted', 'qualified', 'closed', 'spam'))
);

alter table public.leads add column if not exists created_at timestamptz default now();
alter table public.leads add column if not exists business_name text;
alter table public.leads add column if not exists website_url text;
alter table public.leads add column if not exists services text[] default '{}'::text[];
alter table public.leads add column if not exists message text;
alter table public.leads add column if not exists page_url text;
alter table public.leads add column if not exists source text default 'website_contact_form';
alter table public.leads add column if not exists user_agent text;
alter table public.leads add column if not exists status text default 'new';
alter table public.leads add column if not exists notes text;

update public.leads
set source = 'website_contact_form'
where source is null;

update public.leads
set status = 'new'
where status is null;

update public.leads
set services = '{}'::text[]
where services is null;

alter table public.leads alter column created_at set default now();
alter table public.leads alter column services set default '{}'::text[];
alter table public.leads alter column source set default 'website_contact_form';
alter table public.leads alter column status set default 'new';
alter table public.leads alter column source set not null;
alter table public.leads alter column status set not null;

alter table public.leads enable row level security;

revoke all on table public.leads from anon, authenticated;
grant insert on table public.leads to anon, authenticated;

drop policy if exists "Public contact forms can create valid leads" on public.leads;
create policy "Public contact forms can create valid leads"
on public.leads
for insert
to anon, authenticated
with check (
  source = 'website_contact_form'
  and status = 'new'
  and char_length(name) between 1 and 120
  and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  and char_length(phone) between 7 and 40
  and coalesce(array_length(services, 1), 0) <= 8
  and services <@ array[
    'Digital Services',
    'Marketing Services',
    'Advertising Services',
    'Content Services',
    'Software Services'
  ]::text[]
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_email_idx on public.leads (lower(email));
