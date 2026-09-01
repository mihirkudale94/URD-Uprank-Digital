-- Align the allowed lead services with the five service lines published on the website.
--
-- The contact form submits: 'Website Development', 'Digital Marketing', 'Performance Marketing',
-- 'AI Powered Solutions', 'Content Design & Management'. The original constraint allowed a
-- different, older set ('Digital Services', 'Marketing Services', 'Advertising Services',
-- 'Content Services', 'Software Services'), so no value the form can send was ever accepted:
-- direct inserts failed the check constraint outright, and the submit-lead function silently
-- filtered every selection out before saving.
--
-- Both old and new names are accepted so any historic rows stay valid.

alter table public.leads drop constraint if exists leads_allowed_services;

alter table public.leads add constraint leads_allowed_services check (
  services <@ array[
    -- current service lines
    'Website Development',
    'Digital Marketing',
    'Performance Marketing',
    'AI Powered Solutions',
    'Content Design & Management',
    -- retained so previously stored rows remain valid
    'Digital Services',
    'Marketing Services',
    'Advertising Services',
    'Content Services',
    'Software Services'
  ]::text[]
);

-- The row level security policy embeds the same list, so the constraint alone is not enough:
-- an anon insert carrying a current service name would still be rejected by the policy.
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
    'Website Development',
    'Digital Marketing',
    'Performance Marketing',
    'AI Powered Solutions',
    'Content Design & Management',
    'Digital Services',
    'Marketing Services',
    'Advertising Services',
    'Content Services',
    'Software Services'
  ]::text[]
);
