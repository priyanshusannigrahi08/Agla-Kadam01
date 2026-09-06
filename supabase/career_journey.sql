-- AglaKadam journey layer
-- Run after the existing platform/production migrations.

alter table public.mentors_public add column if not exists journey text;
alter table public.mentors_public add column if not exists why_mentor text;

create table if not exists public.conversation_actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action_text text not null check (char_length(trim(action_text)) between 1 and 500),
  completed boolean not null default false,
  completed_at timestamptz
);

create index if not exists conversation_actions_user_idx on public.conversation_actions(user_id, created_at desc);
create index if not exists conversation_actions_booking_idx on public.conversation_actions(booking_id);

alter table public.conversation_actions enable row level security;

drop policy if exists "Users can read own conversation actions" on public.conversation_actions;
create policy "Users can read own conversation actions"
  on public.conversation_actions for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create own conversation actions" on public.conversation_actions;
create policy "Users can create own conversation actions"
  on public.conversation_actions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = conversation_actions.booking_id
        and b.mentee_user_id = auth.uid()
        and b.status = 'completed'
    )
  );

drop policy if exists "Users can update own conversation actions" on public.conversation_actions;
create policy "Users can update own conversation actions"
  on public.conversation_actions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own conversation actions" on public.conversation_actions;
create policy "Users can delete own conversation actions"
  on public.conversation_actions for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.conversation_actions to authenticated;
revoke all on public.conversation_actions from anon;

create or replace function public.touch_conversation_action()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at = now();
  if new.completed = true and old.completed = false then
    new.completed_at = now();
  elsif new.completed = false then
    new.completed_at = null;
  end if;
  return new;
end;
$$;
revoke execute on function public.touch_conversation_action() from public, anon, authenticated;
drop trigger if exists touch_conversation_action on public.conversation_actions;
create trigger touch_conversation_action
before update on public.conversation_actions
for each row execute function public.touch_conversation_action();

-- Keep mentor story fields in the public projection without exposing private evidence.
create or replace function public.sync_mentor_story_public()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' then
    update public.mentors_public
    set journey = new.journey,
        why_mentor = new.why_mentor
    where id = new.id;
  else
    delete from public.mentors_public where id = new.id;
  end if;
  return new;
end;
$$;
revoke execute on function public.sync_mentor_story_public() from public, anon, authenticated;
drop trigger if exists sync_mentor_story_public on public.mentors;
create trigger sync_mentor_story_public
after insert or update on public.mentors
for each row execute function public.sync_mentor_story_public();

update public.mentors_public mp
set journey = m.journey,
    why_mentor = m.why_mentor
from public.mentors m
where m.id = mp.id and m.status = 'approved';
