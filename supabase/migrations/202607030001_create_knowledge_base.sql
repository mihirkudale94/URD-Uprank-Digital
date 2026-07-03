-- Enable pgvector (vector search capability)
create extension if not exists vector;

-- Create knowledge base table with full-text search capability
create table if not exists public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  title text not null,
  content text not null,
  embedding vector(384), -- MiniLM embeddings dimension (can be used for vector similarity search later)
  fts tsvector generated always as (to_tsvector('english', title || ' ' || content)) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create full-text search index
create index if not exists knowledge_base_fts_idx on public.knowledge_base using gin(fts);

-- Enable Row Level Security (RLS)
alter table public.knowledge_base enable row level security;

-- Create select policy to allow anon select
create policy "Allow public read access to knowledge base"
  on public.knowledge_base for select
  to anon
  using (true);

-- Populate initial B2B playbook details for RAG context
insert into public.knowledge_base (category, title, content) values
('Digital Services', 'Digital & UI/UX Playbook', 'Up Rank Digital provides conversion-focused websites, UI/UX design systems, and conversion-first page structures. Best for new websites, redesigns, landing pages, and Shopify/e-commerce platforms.'),
('Marketing Services', 'Performance Marketing Playbook', 'Our Performance Marketing includes SEO, growth funnel planning, and detailed analytics/ROI reporting to drive qualified traffic and strong conversion rates.'),
('AI Growth Services', 'AI Growth & CRO Playbook', 'We build custom AI chatbots, voice agents, CRO funnel testing, support automation, and analytics dashboards connected to measurable outcomes.'),
('Advertising Services', 'Paid Advertising Playbook', 'Paid Advertising includes Google Ads, Meta campaigns (Facebook/Instagram), LinkedIn Ads, search/display remarketing, and target audience planning.'),
('Content Services', 'Content Design Playbook', 'Content design covers brand storytelling, product photo/video shoots, campaign creatives, and social content systems (Reels/TikTok).'),
('Software Services', 'Custom Software Development Playbook', 'Custom software covers web and mobile applications, custom portal development, CRM/LMS integrations, API integrations, and business workflow automation.')
on conflict do nothing;
