-- Mentor evidence + AI assessment layer
-- Run after schema.sql, platform_upgrade.sql and production_hardening.sql.

create table if not exists public.mentor_documents (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('resume', 'certification')),
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size integer not null check (file_size > 0 and file_size <= 8388608),
  created_at timestamptz not null default now()
);

create index if not exists mentor_documents_mentor_idx on public.mentor_documents(mentor_id, created_at desc);

create table if not exists public.mentor_ai_assessments (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  document_ids uuid[] not null default '{}',
  extracted_profile jsonb not null default '{}'::jsonb,
  consistency_checks jsonb not null default '[]'::jsonb,
  readiness_score integer check (readiness_score between 0 and 100),
  readiness_label text,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  status text not null default 'completed' check (status in ('completed', 'needs_review', 'failed')),
  model text,
  created_at timestamptz not null default now()
);

create index if not exists mentor_ai_assessments_mentor_idx on public.mentor_ai_assessments(mentor_id, created_at desc);

alter table public.mentor_documents enable row level security;
alter table public.mentor_ai_assessments enable row level security;

drop policy if exists "Mentors manage own documents" on public.mentor_documents;
create policy "Mentors manage own documents" on public.mentor_documents
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Mentors read own assessments" on public.mentor_ai_assessments;
create policy "Mentors read own assessments" on public.mentor_ai_assessments
  for select to authenticated
  using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));

grant select, insert, update, delete on public.mentor_documents to authenticated;
grant select on public.mentor_ai_assessments to authenticated;
revoke all on public.mentor_documents from anon;
revoke all on public.mentor_ai_assessments from anon;

insert into storage.buckets (id, name, public)
values ('mentor-evidence', 'mentor-evidence', false)
on conflict (id) do nothing;

-- Private bucket: users can only access their own folder.
drop policy if exists "Mentors upload own evidence" on storage.objects;
create policy "Mentors upload own evidence" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'mentor-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Mentors read own evidence" on storage.objects;
create policy "Mentors read own evidence" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'mentor-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Mentors delete own evidence" on storage.objects;
create policy "Mentors delete own evidence" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'mentor-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
