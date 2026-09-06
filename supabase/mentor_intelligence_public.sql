-- Safe, public-facing intelligence only.
-- Never expose resumes, certificates, consistency checks, or readiness scores publicly.

create or replace view public.mentor_intelligence_public as
select distinct on (m.id)
  m.id as mentor_id,
  coalesce(a.extracted_profile->'skills', '[]'::jsonb) as skills,
  coalesce(a.extracted_profile->'roles', '[]'::jsonb) as roles,
  coalesce(a.extracted_profile->'industries', '[]'::jsonb) as industries,
  coalesce(a.extracted_profile->'certifications', '[]'::jsonb) as certifications,
  true as ai_profile_available
from public.mentors m
left join public.mentor_ai_assessments a
  on a.mentor_id = m.id
 and a.status = 'completed'
where m.status = 'approved'
order by m.id, a.created_at desc nulls last;

grant select on public.mentor_intelligence_public to anon, authenticated;
revoke all on public.mentor_intelligence_public from public;
