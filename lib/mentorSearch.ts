export type MentorSearchProfile = {
  name: string;
  headline?: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  company?: string;
  role?: string;
  location?: string;
  availability?: string;
  verification_status?: string;
  intelligence?: {
    skills?: string[];
    roles?: string[];
    industries?: string[];
    certifications?: string[];
    ai_profile_available?: boolean;
  };
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "want", "need", "help", "from", "into", "about", "how", "can",
  "become", "someone", "looking", "career", "experience", "mentor", "mentoring", "guidance",
]);

const SYNONYMS: Record<string, string[]> = {
  "data analyst": ["data analytics", "business analyst", "bi", "power bi", "sql", "excel"],
  "data analytics": ["data analyst", "business analyst", "bi", "power bi", "sql", "excel"],
  "finance": ["financial", "accounting", "fp&a", "financial modelling", "finance analytics"],
  "finance analytics": ["finance", "financial", "fp&a", "financial modelling", "power bi", "excel"],
  "python": ["programming", "software", "data science", "pandas", "sql"],
  "software": ["software engineering", "programming", "backend", "python", "data structures"],
  "cricket": ["sports analytics", "sports data", "python", "sql", "statistics", "visualization"],
  "sports analytics": ["cricket", "sports data", "python", "sql", "statistics", "visualization"],
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").replace(/\s+/g, " ").trim();
}

function terms(value: string) {
  return new Set(normalize(value).split(" ").filter((term) => term.length >= 3 && !STOP_WORDS.has(term)));
}

function phraseMatches(query: string, profile: string) {
  let score = 0;
  Object.entries(SYNONYMS).forEach(([phrase, related]) => {
    if (query.includes(phrase)) related.forEach((term) => { if (profile.includes(term)) score += 2; });
  });
  return score;
}

function intelligenceText(mentor: MentorSearchProfile) {
  const intelligence = mentor.intelligence;
  if (!intelligence) return "";
  return [
    ...(intelligence.skills || []),
    ...(intelligence.roles || []),
    ...(intelligence.industries || []),
    ...(intelligence.certifications || []),
  ].join(" ");
}

export function mentorSearchScore(query: string, mentor: MentorSearchProfile) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;
  const profile = normalize([
    mentor.name,
    mentor.headline,
    mentor.bio,
    mentor.expertise,
    mentor.experience,
    mentor.company,
    mentor.role,
    mentor.location,
  ].filter(Boolean).join(" "));
  const aiProfile = normalize(intelligenceText(mentor));
  const queryTerms = terms(normalizedQuery);
  const profileTerms = terms(profile);
  const aiTerms = terms(aiProfile);
  let overlap = 0;
  let aiOverlap = 0;
  queryTerms.forEach((term) => {
    if (profileTerms.has(term) || profile.includes(term)) overlap += 1;
    if (aiTerms.has(term) || aiProfile.includes(term)) aiOverlap += 1;
  });

  let score = Math.min(58, overlap * 11);
  score += Math.min(18, aiOverlap * 6);
  score += Math.min(20, phraseMatches(normalizedQuery, profile + " " + aiProfile));
  if (mentor.expertise && normalizedQuery.split(" ").some((term) => normalize(mentor.expertise!).includes(term))) score += 7;
  if (mentor.role && normalizedQuery.split(" ").some((term) => normalize(mentor.role!).includes(term))) score += 5;
  if (mentor.intelligence?.ai_profile_available && aiOverlap > 0) score += 3;
  if (mentor.verification_status === "verified") score += 2;
  if (mentor.availability) score += 1;
  return Math.min(100, score);
}

export function rankMentors<T extends MentorSearchProfile>(query: string, mentors: T[]) {
  return mentors
    .map((mentor) => ({ mentor, score: mentorSearchScore(query, mentor) }))
    .filter(({ score }) => !query.trim() || score >= 10)
    .sort((a, b) => b.score - a.score)
    .map(({ mentor }) => mentor);
}
