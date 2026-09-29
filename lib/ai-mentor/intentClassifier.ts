import { UserIntent } from "./types";

/**
 * Classifies the intent of the user's message using lightweight heuristic pattern matching.
 * This runs in < 1ms with 0 additional network calls or tokens.
 */
export function classifyUserIntent(message: string): UserIntent {
  const text = message.toLowerCase().trim();

  // Simple / short queries
  if (
    /^(what is|define|who is|when is|how much|where is|meaning of|difference between|difference in|is it true)/i.test(text) &&
    text.split(/\s+/).length <= 15
  ) {
    return "factual_question";
  }

  // Comparisons
  if (
    /\b(vs|versus|or|better than|compare|difference between|should i choose .* or|which one is better)\b/i.test(text)
  ) {
    return "comparison";
  }

  // Uncertainty & feeling stuck / lost
  if (
    /\b(confused|lost|stuck|uncertain|don'?t know what to do|no direction|overwhelmed|afraid|anxious|doubt|scared|second thought)\b/i.test(text)
  ) {
    return "uncertainty";
  }

  // Skill learning & practice
  if (
    /\b(learn|roadmap|how to start|beginner|practice|projects?|course|tutorial|resources?|master|skills? to get)\b/i.test(text)
  ) {
    return "skill_learning";
  }

  // Education decisions
  if (
    /\b(college|degree|btech|mtech|bsc|msc|mba|phd|drop out|dropout|admissions?|university|branch|major|cutoff|neet|gate|clat|cat|gre)\b/i.test(text)
  ) {
    return "education_decision";
  }

  // Career decisions & switching
  if (
    /\b(switch|career path|leave my job|quit|salary|promotion|internship|placement|job offer|transition into|hiring|fresher)\b/i.test(text)
  ) {
    return "career_decision";
  }

  // Planning & timelines
  if (
    /\b(plan|timeline|schedule|next 3 months|next 6 months|step by step|how long|daily routine)\b/i.test(text)
  ) {
    return "planning";
  }

  // Goal setting
  if (
    /\b(goal|target|objective|vision|long term|short term|aim)\b/i.test(text)
  ) {
    return "goal_setting";
  }

  // Mentor selection / human help
  if (
    /\b(human mentor|talk to someone|find a mentor|call a mentor|book a session|1 on 1|one on one|real person)\b/i.test(text)
  ) {
    return "mentor_selection";
  }

  // Reflection
  if (
    /\b(what do you think|my situation|feedback on|review my|thoughts on)\b/i.test(text)
  ) {
    return "reflection";
  }

  return "general_conversation";
}

/**
 * Returns tailored prompt guidance based on the detected intent.
 */
export function getIntentStrategyInstruction(intent: UserIntent): string {
  switch (intent) {
    case "factual_question":
      return `
[INTENT: FACTUAL QUESTION]
- Strategy: Give a direct, factual, and concise answer immediately.
- Briefly explain the reasoning or give 1 clear example if helpful.
- Avoid forcing long multi-section templates or asking unnecessary follow-up questions.
`.trim();

    case "comparison":
      return `
[INTENT: COMPARISON / EVALUATION]
- Strategy: Identify the exact decision variables and compare them across relevant dimensions (e.g. learning curve, market demand, daily work, fit).
- Highlight key trade-offs honestly without declaring an arbitrary universal "winner".
- Conclude with a clear rule-of-thumb to help the user choose based on their specific situation.
- Provide a concrete next step to test or explore.
`.trim();

    case "uncertainty":
      return `
[INTENT: CAREER/PATH UNCERTAINTY]
- Strategy: Calmly validate the dilemma, then isolate what the uncertainty is actually about.
- Separate short-term immediate needs from long-term concerns.
- Offer 2-3 realistic options with the key trade-offs of each.
- Suggest a low-risk, concrete experiment or action ("Agla Kadam") the user can do this week to gain real data.
`.trim();

    case "skill_learning":
      return `
[INTENT: SKILL LEARNING & ROADMAP]
- Strategy: Map a structured, realistic learning progression (Fundamentals → Practical Application / Projects → Advanced / Deployment).
- Emphasize building 1-2 tangible portfolio projects over endless passive video consumption.
- Highlight common mistakes learners make and how to avoid them.
- Give an immediate starting step for today.
`.trim();

    case "education_decision":
    case "career_decision":
      return `
[INTENT: CAREER / EDUCATION DECISION]
- Strategy: Adopt an adaptive structured breakdown:
  1. What is at stake & key factors
  2. Realistic paths/options available
  3. Honest trade-offs & risks
  4. Practical next step ("Agla Kadam")
- Do not make the decision for the user; empower them with clear criteria.
`.trim();

    case "planning":
      return `
[INTENT: PLANNING & EXECUTION]
- Strategy: Break the journey into sequenced, realistic milestones (e.g., Month 1, Month 2, Month 3).
- Define clear criteria for progress at each stage.
- Keep the timeline pragmatic and warn against over-committing early.
`.trim();

    case "mentor_selection":
      return `
[INTENT: MENTOR SELECTION / HUMAN GUIDANCE]
- Strategy: Explain clearly how 1-on-1 human mentorship adds value for their specific query.
- Highlight what topics are best explored with an experienced professional on AglaKadam.
`.trim();

    default:
      return `
[INTENT: GENERAL MENTORING]
- Strategy: Listen carefully, provide thoughtful and structured perspective, and identify an actionable next step.
`.trim();
  }
}
