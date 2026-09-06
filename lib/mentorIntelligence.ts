import type { MentorSearchProfile } from "@/lib/mentorSearch";

export type MentorIntelligence = {
  skills: string[];
  roles: string[];
  industries: string[];
  certifications: string[];
  yearsExperience: number | null;
  readinessScore: number | null;
  readinessLabel: string | null;
  assessmentStatus: string | null;
  evidenceCount: number;
  signals: string[];
};

export type MentorIntelligenceInput = MentorSearchProfile & {
  ai_extracted_profile?: unknown;
  ai_readiness_score?: unknown;
  ai_readiness_label?: unknown;
  ai_assessment_status?: unknown;
  evidence_count?: unknown;
};

const asStrings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 30) : [];
const asNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function buildMentorIntelligence(input: MentorIntelligenceInput): MentorIntelligence {
  const extracted = input.ai_extracted_profile && typeof input.ai_extracted_profile === "object" ? input.ai_extracted_profile as Record<string, unknown> : {};
  const skills = asStrings(extracted.skills);
  const roles = asStrings(extracted.roles);
  const industries = asStrings(extracted.industries);
  const certifications = asStrings(extracted.certifications);
  const yearsExperience = asNumber(extracted.years_experience);
  const readinessScore = asNumber(input.ai_readiness_score);
  const readinessLabel = typeof input.ai_readiness_label === "string" ? input.ai_readiness_label : null;
  const assessmentStatus = typeof input.ai_assessment_status === "string" ? input.ai_assessment_status : null;
  const evidenceCount = typeof input.evidence_count === "number" && Number.isFinite(input.evidence_count) ? Math.max(0, input.evidence_count) : 0;
  const signals: string[] = [];
  if (evidenceCount > 0) signals.push(`${evidenceCount} evidence file${evidenceCount === 1 ? "" : "s"} submitted`);
  if (assessmentStatus === "completed") signals.push("AI profile reviewed");
  if (input.verification_status === "verified") signals.push("Identity verified");
  if (readinessLabel) signals.push(`Mentoring readiness: ${readinessLabel}`);
  return { skills, roles, industries, certifications, yearsExperience, readinessScore, readinessLabel, assessmentStatus, evidenceCount, signals: signals.slice(0, 4) };
}

export function intelligenceSearchText(input: MentorIntelligenceInput) {
  const intelligence = buildMentorIntelligence(input);
  return [input.name, input.headline, input.bio, input.expertise, input.experience, input.company, input.role, input.location, ...intelligence.skills, ...intelligence.roles, ...intelligence.industries, ...intelligence.certifications].filter(Boolean).join(" ");
}

export function intelligenceBoost(query: string, input: MentorIntelligenceInput) {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();
  const intelligence = buildMentorIntelligence(input);
  const matches = [...intelligence.skills, ...intelligence.roles, ...intelligence.industries, ...intelligence.certifications].filter((value) => q.includes(value.toLowerCase()) || value.toLowerCase().includes(q));
  let boost = Math.min(12, matches.length * 3);
  if (intelligence.assessmentStatus === "completed") boost += 1;
  return Math.min(15, boost);
}
