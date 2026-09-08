create extension if not exists "pgcrypto";

create type public.business_member_role as enum ('owner', 'admin', 'member');
create type public.ai_employee_status as enum ('online', 'offline');
create type public.knowledge_source_type as enum ('business_info', 'product', 'policy', 'faq', 'document', 'conversation');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  location text,
  ai_name text not null default 'David',
  ai_status public.ai_employee_status not null default 'offline',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source_type public.knowledge_source_type not null,
  title text not null,
  content text not null,
  confidence numeric(4, 3) not null default 1.000 check (confidence between 0 and 1),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  interest text,
  budget text,
  intent text not null default 'Cold' check (intent in ('Hot', 'Warm', 'Cold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  channel text not null,
  status text not null default 'AI handling' check (status in ('AI handling', 'Needs owner', 'Human required')),
  last_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'ai', 'human')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.knowledge_entries enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;

create policy "members can view their businesses" on public.businesses
  for select using (exists (
    select 1 from public.business_members
    where business_members.business_id = businesses.id
      and business_members.user_id = auth.uid()
  ));

create policy "members can manage business knowledge" on public.knowledge_entries
  for all using (exists (
    select 1 from public.business_members
    where business_members.business_id = knowledge_entries.business_id
      and business_members.user_id = auth.uid()
  ));

create policy "members can manage leads" on public.leads
  for all using (exists (
    select 1 from public.business_members
    where business_members.business_id = leads.business_id
      and business_members.user_id = auth.uid()
  ));

create policy "members can manage conversations" on public.conversations
  for all using (exists (
    select 1 from public.business_members
    where business_members.business_id = conversations.business_id
      and business_members.user_id = auth.uid()
  ));

create policy "members can manage conversation messages" on public.conversation_messages
  for all using (exists (
    select 1 from public.conversations
    join public.business_members on business_members.business_id = conversations.business_id
    where conversations.id = conversation_messages.conversation_id
      and business_members.user_id = auth.uid()
  ));
