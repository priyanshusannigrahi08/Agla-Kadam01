-- Private, user-controlled goals for the career map.
-- Run after the existing platform/production migrations.

create table if not exists public.career_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_text text not null check (char_length(trim(goal_text)) between 1 and 240),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists career_goals_user_idx
  on public.career_goals(user_id, created_at desc);

alter table public.career_goals enable row level security;

drop policy if exists "Users can read own career goals" on public.career_goals;
create policy "Users can read own career goals"
  on public.career_goals for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can create own career goals" on public.career_goals;
create policy "Users can create own career goals"
  on public.career_goals for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update own career goals" on public.career_goals;
create policy "Users can update own career goals"
  on public.career_goals for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own career goals" on public.career_goals;
create policy "Users can delete own career goals"
  on public.career_goals for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.career_goals to authenticated;
revoke all on public.career_goals from anon;

create or replace function public.touch_career_goal()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.completed = true and old.completed = false then
    new.completed_at = now();
  elsif new.completed = false then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

revoke execute on function public.touch_career_goal() from public, anon, authenticated;
drop trigger if exists touch_career_goal on public.career_goals;
create trigger touch_career_goal
before update on public.career_goals
for each row execute function public.touch_career_goal();
