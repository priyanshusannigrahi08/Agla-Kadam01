import { UserContext, ConversationSummary, ChatMessage } from "./types";

/**
 * Sanitizes and extracts only safe, relevant user context fields.
 * Prevents any accidental exposure of sensitive keys, tokens, or private data.
 */
export function sanitizeUserContext(rawContext?: unknown): UserContext | undefined {
  if (!rawContext || typeof rawContext !== "object") {
    return undefined;
  }

  const ctx = rawContext as Record<string, unknown>;
  const clean: UserContext = {};

  if (typeof ctx.career_stage === "string" && ctx.career_stage.trim()) {
    clean.career_stage = ctx.career_stage.trim().slice(0, 200);
  }

  if (typeof ctx.current_education === "string" && ctx.current_education.trim()) {
    clean.current_education = ctx.current_education.trim().slice(0, 200);
  }

  if (Array.isArray(ctx.interests)) {
    clean.interests = ctx.interests
      .filter((i): i is string => typeof i === "string" && i.trim().length > 0)
      .map((i) => i.trim().slice(0, 100))
      .slice(0, 10);
  }

  if (Array.isArray(ctx.goals)) {
    clean.goals = ctx.goals
      .filter((g): g is string => typeof g === "string" && g.trim().length > 0)
      .map((g) => g.trim().slice(0, 150))
      .slice(0, 10);
  }

  if (Array.isArray(ctx.current_concerns)) {
    clean.current_concerns = ctx.current_concerns
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .map((c) => c.trim().slice(0, 200))
      .slice(0, 10);
  }

  if (Array.isArray(ctx.relevant_background)) {
    clean.relevant_background = ctx.relevant_background
      .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
      .map((b) => b.trim().slice(0, 200))
      .slice(0, 10);
  }

  if (Array.isArray(ctx.previous_decisions_discussed)) {
    clean.previous_decisions_discussed = ctx.previous_decisions_discussed
      .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
      .map((d) => d.trim().slice(0, 200))
      .slice(0, 10);
  }

  if (typeof ctx.conversation_summary === "string" && ctx.conversation_summary.trim()) {
    clean.conversation_summary = ctx.conversation_summary.trim().slice(0, 1000);
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

/**
 * Sanitizes and extracts structured conversation summary/memory.
 */
export function sanitizeConversationSummary(rawSummary?: unknown): ConversationSummary | undefined {
  if (!rawSummary || typeof rawSummary !== "object") {
    return undefined;
  }

  const s = rawSummary as Record<string, unknown>;
  const clean: ConversationSummary = {};

  if (typeof s.main_problem === "string" && s.main_problem.trim()) {
    clean.main_problem = s.main_problem.trim().slice(0, 300);
  }

  if (typeof s.background === "string" && s.background.trim()) {
    clean.background = s.background.trim().slice(0, 300);
  }

  if (Array.isArray(s.goals)) {
    clean.goals = s.goals
      .filter((g): g is string => typeof g === "string" && g.trim().length > 0)
      .map((g) => g.trim().slice(0, 150))
      .slice(0, 8);
  }

  if (Array.isArray(s.options_discussed)) {
    clean.options_discussed = s.options_discussed
      .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      .map((o) => o.trim().slice(0, 150))
      .slice(0, 8);
  }

  if (Array.isArray(s.important_preferences)) {
    clean.important_preferences = s.important_preferences
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => p.trim().slice(0, 150))
      .slice(0, 8);
  }

  if (Array.isArray(s.unresolved_questions)) {
    clean.unresolved_questions = s.unresolved_questions
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim().slice(0, 150))
      .slice(0, 8);
  }

  if (Array.isArray(s.previous_conclusions)) {
    clean.previous_conclusions = s.previous_conclusions
      .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      .map((c) => c.trim().slice(0, 150))
      .slice(0, 8);
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}

/**
 * Builds a compact summary representation from earlier messages
 * when the conversation exceeds a sliding window threshold.
 */
export function buildSlidingWindowConversation(
  messages: ChatMessage[],
  maxRecentMessages = 10
): {
  recentMessages: ChatMessage[];
  compactHistoryNotes?: string;
} {
  if (messages.length <= maxRecentMessages) {
    return { recentMessages: messages };
  }

  const earlier = messages.slice(0, messages.length - maxRecentMessages);
  const recent = messages.slice(messages.length - maxRecentMessages);

  // Extract key points from earlier turns without bloating tokens
  const earlierUserPoints = earlier
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .slice(-4)
    .map((c) => `- User mentioned: "${c.slice(0, 150)}${c.length > 150 ? "..." : ""}"`)
    .join("\n");

  const earlierAssistantPoints = earlier
    .filter((m) => m.role === "assistant")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .slice(-2)
    .map((c) => `- Earlier advice summary: "${c.slice(0, 150)}${c.length > 150 ? "..." : ""}"`)
    .join("\n");

  const notes = [earlierUserPoints, earlierAssistantPoints].filter(Boolean).join("\n");

  return {
    recentMessages: recent,
    compactHistoryNotes: notes ? `--- EARLIER CONVERSATION MEMORY ---\n${notes}\n--- END MEMORY ---` : undefined,
  };
}

/**
 * Formats user context and memory into a clean instruction block.
 */
export function formatUserContextBlock(
  userContext?: UserContext,
  summary?: ConversationSummary
): string {
  const parts: string[] = [];

  if (userContext) {
    parts.push("=== USER PROFILE CONTEXT ===");
    if (userContext.career_stage) parts.push(`• Career Stage: ${userContext.career_stage}`);
    if (userContext.current_education) parts.push(`• Current Education: ${userContext.current_education}`);
    if (userContext.interests && userContext.interests.length > 0) {
      parts.push(`• Interests: ${userContext.interests.join(", ")}`);
    }
    if (userContext.goals && userContext.goals.length > 0) {
      parts.push(`• Goals: ${userContext.goals.join(", ")}`);
    }
    if (userContext.current_concerns && userContext.current_concerns.length > 0) {
      parts.push(`• Current Concerns: ${userContext.current_concerns.join(", ")}`);
    }
    if (userContext.relevant_background && userContext.relevant_background.length > 0) {
      parts.push(`• Relevant Background: ${userContext.relevant_background.join("; ")}`);
    }
    if (userContext.previous_decisions_discussed && userContext.previous_decisions_discussed.length > 0) {
      parts.push(`• Previous Decisions: ${userContext.previous_decisions_discussed.join("; ")}`);
    }
    if (userContext.conversation_summary) {
      parts.push(`• Overall Context Note: ${userContext.conversation_summary}`);
    }
    parts.push("Use this context naturally without saying 'according to your profile'. Never repeat confidential details.");
  }

  if (summary) {
    parts.push("\n=== CONVERSATION STATE & DECISIONS DISCUSSED ===");
    if (summary.main_problem) parts.push(`• Core Problem: ${summary.main_problem}`);
    if (summary.background) parts.push(`• Background: ${summary.background}`);
    if (summary.goals && summary.goals.length > 0) parts.push(`• Discussed Goals: ${summary.goals.join(", ")}`);
    if (summary.options_discussed && summary.options_discussed.length > 0) {
      parts.push(`• Options Already Evaluated: ${summary.options_discussed.join(", ")}`);
    }
    if (summary.important_preferences && summary.important_preferences.length > 0) {
      parts.push(`• Expressed Preferences: ${summary.important_preferences.join(", ")}`);
    }
    if (summary.previous_conclusions && summary.previous_conclusions.length > 0) {
      parts.push(`• Established Conclusions: ${summary.previous_conclusions.join(", ")}`);
    }
    if (summary.unresolved_questions && summary.unresolved_questions.length > 0) {
      parts.push(`• Unresolved Questions: ${summary.unresolved_questions.join(", ")}`);
    }
  }

  return parts.join("\n");
}
