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
  skills text[];
  roles text[];
  industries text[];
  certifications text[];
  evidence_count integer;
begin
  select * into assessment
  from public.mentor_ai_assessments
  where mentor_id = p_mentor_id and status = 'completed'
  order by created_at desc
  limit 1;

  select count(*)::integer into evidence_count
  from public.mentor_documents
  where mentor_id = p_mentor_id;

  if assessment.id is null then
    update public.mentors_public
    set ai_skills = '{}', ai_roles = '{}', ai_industries = '{}',
        ai_certifications = '{}', ai_profile_available = false,
        evidence_count = evidence_count
    where id = p_mentor_id;
    return;
  end if;

  extracted := case when jsonb_typeof(assessment.extracted_profile) = 'object'
    then assessment.extracted_profile else '{}'::jsonb end;

  select coalesce(array(select jsonb_array_elements_text(extracted->'skills') limit 30), '{}') into skills;
  select coalesce(array(select jsonb_array_elements_text(extracted->'roles') limit 30), '{}') into roles;
  select coalesce(array(select jsonb_array_elements_text(extracted->'industries') limit 30), '{}') into industries;
  select coalesce(array(select jsonb_array_elements_text(extracted->'certifications') limit 30), '{}') into certifications;

  update public.mentors_public
  set ai_skills = skills,
      ai_roles = roles,
      ai_industries = industries,
      ai_certifications = certifications,
      ai_profile_available = true,
      evidence_count = sync_mentor_public_intelligence.evidence_count
  where id = p_mentor_id;
end;
$$;

revoke execute on function public.sync_mentor_public_intelligence(uuid) from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'sync_mentor_public_intelligence_assessment') then
    create trigger sync_mentor_public_intelligence_assessment
    after insert or update or delete on public.mentor_ai_assessments
    for each row execute function public.sync_mentor_public_intelligence(coalesce(new.mentor_id, old.mentor_id));
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'sync_mentor_public_intelligence_document') then
    create trigger sync_mentor_public_intelligence_document
    after insert or update or delete on public.mentor_documents
    for each row execute function public.sync_mentor_public_intelligence(coalesce(new.mentor_id, old.mentor_id));
  end if;
end;
$$;

insert into public.mentors_public (id, created_at, name, verification_status)
select id, created_at, name, verification_status
from public.mentors
where status = 'approved'
on conflict (id) do nothing;

update public.mentors_public mp
set ai_skills = coalesce(src.ai_skills, '{}'),
    ai_roles = coalesce(src.ai_roles, '{}'),
    ai_industries = coalesce(src.ai_industries, '{}'),
    ai_certifications = coalesce(src.ai_certifications, '{}'),
    ai_profile_available = coalesce(src.ai_profile_available, false),
    evidence_count = coalesce(src.evidence_count, 0)
from (
  select m.id,
         array_agg(distinct skill) filter (where skill is not null) as ai_skills,
         '{}'::text[] as ai_roles,
         '{}'::text[] as ai_industries,
         '{}'::text[] as ai_certifications,
         true as ai_profile_available,
         count(distinct d.id)::integer as evidence_count
  from public.mentors m
  join public.mentor_ai_assessments a on a.mentor_id = m.id and a.status = 'completed'
  left join public.mentor_documents d on d.mentor_id = m.id
  left join lateral jsonb_array_elements_text(
    case when jsonb_typeof(a.extracted_profile->'skills') = 'array' then a.extracted_profile->'skills' else '[]'::jsonb end
  ) skill on true
  where m.status = 'approved'
  group by m.id
) src
where mp.id = src.id;

-- Backfill all four extracted dimensions accurately from the latest completed assessment.
update public.mentors_public mp
set ai_roles = coalesce(src.roles, '{}'),
    ai_industries = coalesce(src.industries, '{}'),
    ai_certifications = coalesce(src.certifications, '{}')
from (
  select distinct on (mentor_id)
    mentor_id,
    case when jsonb_typeof(extracted_profile->'roles') = 'array' then array(select jsonb_array_elements_text(extracted_profile->'roles') limit 30) else '{}'::text[] end as roles,
    case when jsonb_typeof(extracted_profile->'industries') = 'array' then array(select jsonb_array_elements_text(extracted_profile->'industries') limit 30) else '{}'::text[] end as industries,
    case when jsonb_typeof(extracted_profile->'certifications') = 'array' then array(select jsonb_array_elements_text(extracted_profile->'certifications') limit 30) else '{}'::text[] end as certifications
  from public.mentor_ai_assessments
  where status = 'completed'
  order by mentor_id, created_at desc
) src
where mp.id = src.mentor_id;
