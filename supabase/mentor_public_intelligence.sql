-- Safe marketplace projection for AI-derived mentor intelligence.
-- Run after supabase/mentor_ai_evidence.sql.
-- Never exposes raw documents, storage paths, consistency findings or readiness scores.

alter table public.mentors_public add column if not exists ai_skills text[] not null default '{}';
alter table public.mentors_public add column if not exists ai_roles text[] not null default '{}';
alter table public.mentors_public add column if not exists ai_industries text[] not null default '{}';
alter table public.mentors_public add column if not exists ai_certifications text[] not null default '{}';
alter table public.mentors_public add column if not exists ai_profile_available boolean not null default false;
alter table public.mentors_public add column if not exists evidence_count integer not null default 0 check (evidence_count >= 0);

create or replace function public.sync_mentor_public_intelligence(p_mentor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  assessment public.mentor_ai_assessments%rowtype;
  extracted jsonb;
  v_skills text[] := '{}';
  v_roles text[] := '{}';
  v_industries text[] := '{}';
  v_certifications text[] := '{}';
  v_evidence_count integer := 0;
begin
  select * into assessment
  from public.mentor_ai_assessments
  where mentor_id = p_mentor_id and status = 'completed'
  order by created_at desc
  limit 1;

  select count(*)::integer into v_evidence_count
  from public.mentor_documents
  where mentor_id = p_mentor_id;

  if assessment.id is not null then
    extracted := case when jsonb_typeof(assessment.extracted_profile) = 'object'
      then assessment.extracted_profile else '{}'::jsonb end;

    if jsonb_typeof(extracted->'skills') = 'array' then
      select coalesce(array(select jsonb_array_elements_text(extracted->'skills') limit 30), '{}') into v_skills;
    end if;
    if jsonb_typeof(extracted->'roles') = 'array' then
      select coalesce(array(select jsonb_array_elements_text(extracted->'roles') limit 30), '{}') into v_roles;
    end if;
    if jsonb_typeof(extracted->'industries') = 'array' then
      select coalesce(array(select jsonb_array_elements_text(extracted->'industries') limit 30), '{}') into v_industries;
    end if;
    if jsonb_typeof(extracted->'certifications') = 'array' then
      select coalesce(array(select jsonb_array_elements_text(extracted->'certifications') limit 30), '{}') into v_certifications;
    end if;
  end if;

  update public.mentors_public mp
  set ai_skills = v_skills,
      ai_roles = v_roles,
      ai_industries = v_industries,
      ai_certifications = v_certifications,
      ai_profile_available = assessment.id is not null,
      evidence_count = v_evidence_count
  where mp.id = p_mentor_id;
end;
$$;

revoke execute on function public.sync_mentor_public_intelligence(uuid) from public, anon, authenticated;

drop trigger if exists sync_mentor_public_intelligence_assessment on public.mentor_ai_assessments;
create trigger sync_mentor_public_intelligence_assessment
after insert or update or delete on public.mentor_ai_assessments
for each row execute function public.sync_mentor_public_intelligence(
  case when tg_op = 'DELETE' then old.mentor_id else new.mentor_id end
);

drop trigger if exists sync_mentor_public_intelligence_document on public.mentor_documents;
create trigger sync_mentor_public_intelligence_document
after insert or update or delete on public.mentor_documents
for each row execute function public.sync_mentor_public_intelligence(
  case when tg_op = 'DELETE' then old.mentor_id else new.mentor_id end
);

-- Backfill only approved mentors. The latest completed assessment is the sole source
-- for extracted discovery fields, preventing stale assessments from being combined.
do $$
declare
  mentor_id uuid;
begin
  for mentor_id in select id from public.mentors where status = 'approved' loop
    perform public.sync_mentor_public_intelligence(mentor_id);
  end loop;
end;
$$;
