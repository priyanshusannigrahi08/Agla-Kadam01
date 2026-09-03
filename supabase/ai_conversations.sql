-- Account-synced AI mentor conversation history.
-- Run after the existing platform_upgrade.sql / production_hardening.sql migrations.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mentor_id text not null,
  title text not null,
  preview text not null default '',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create index if not exists ai_conversations_user_updated_idx
  on public.ai_conversations(user_id, updated_at desc);

create index if not exists ai_conversations_user_mentor_updated_idx
  on public.ai_conversations(user_id, mentor_id, updated_at desc);

-- Users can only see and manage their own conversations.
drop policy if exists "Users can read own AI conversations" on public.ai_conversations;
drop policy if exists "Users can insert own AI conversations" on public.ai_conversations;
drop policy if exists "Users can update own AI conversations" on public.ai_conversations;
drop policy if exists "Users can delete own AI conversations" on public.ai_conversations;

create policy "Users can read own AI conversations"
  on public.ai_conversations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own AI conversations"
  on public.ai_conversations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own AI conversations"
  on public.ai_conversations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own AI conversations"
  on public.ai_conversations for delete
  to authenticated
  using (auth.uid() = user_id);

-- Keep updated_at current when a conversation changes.
create or replace function public.set_ai_conversation_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_conversation_updated_at on public.ai_conversations;
create trigger set_ai_conversation_updated_at
before update on public.ai_conversations
for each row execute function public.set_ai_conversation_updated_at();

-- Do not expose this table through the anonymous client.
revoke all on public.ai_conversations from anon;
revoke all on public.ai_conversations from authenticated;
grant select, insert, update, delete on public.ai_conversations to authenticated;

-- Keep future grants conservative as well.
alter table public.ai_conversations alter column user_id set not null;
alter table public.ai_conversations alter column mentor_id set not null;
