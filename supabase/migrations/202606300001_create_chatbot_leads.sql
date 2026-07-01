create extension if not exists pgcrypto;

create table if not exists public.chatbot_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phone text not null,
  service_interest text not null default 'General enquiry',
  intent_signals text[] not null default '{}'::text[],
  transcript_summary text,
  page_url text,
  source text not null default 'chatbot_callback',
  preferred_channel text not null default 'human_callback',
  user_agent text,
  consent_accepted boolean not null default false,
  status text not null default 'new',
  notes text,
  constraint chatbot_leads_phone_length check (char_length(phone) between 7 and 40),
  constraint chatbot_leads_service_interest_length check (char_length(service_interest) between 1 and 160),
  constraint chatbot_leads_signal_count check (coalesce(array_length(intent_signals, 1), 0) <= 8),
  constraint chatbot_leads_transcript_length check (transcript_summary is null or char_length(transcript_summary) <= 3000),
  constraint chatbot_leads_page_url_length check (page_url is null or char_length(page_url) <= 500),
  constraint chatbot_leads_user_agent_length check (user_agent is null or char_length(user_agent) <= 500),
  constraint chatbot_leads_source_value check (source in ('chatbot_callback', 'ai_voice_callback', 'voice_session', 'whatsapp_handoff')),
  constraint chatbot_leads_channel_value check (preferred_channel in ('human_callback', 'ai_voice', 'whatsapp', 'contact_form')),
  constraint chatbot_leads_status_value check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  constraint chatbot_leads_ai_voice_consent check (preferred_channel <> 'ai_voice' or consent_accepted = true)
);

alter table public.chatbot_leads enable row level security;

revoke all on table public.chatbot_leads from anon, authenticated;
grant insert on table public.chatbot_leads to anon, authenticated;

drop policy if exists "Public chatbot can create valid lead handoffs" on public.chatbot_leads;
create policy "Public chatbot can create valid lead handoffs"
on public.chatbot_leads
for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(phone) between 7 and 40
  and char_length(service_interest) between 1 and 160
  and coalesce(array_length(intent_signals, 1), 0) <= 8
  and source in ('chatbot_callback', 'ai_voice_callback', 'voice_session', 'whatsapp_handoff')
  and preferred_channel in ('human_callback', 'ai_voice', 'whatsapp', 'contact_form')
  and (preferred_channel <> 'ai_voice' or consent_accepted = true)
);

create index if not exists chatbot_leads_created_at_idx on public.chatbot_leads (created_at desc);
create index if not exists chatbot_leads_status_idx on public.chatbot_leads (status);
create index if not exists chatbot_leads_channel_idx on public.chatbot_leads (preferred_channel);
