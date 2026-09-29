/**
 * Lightweight Answer Quality Validator and Sanitizer.
 * Evaluates draft responses against AglaKadam quality standards:
 * - Checks for forbidden AI assistant clichés
 * - Removes unnecessary robotic disclaimers
 * - Ensures no hallucinated URLs or fabricated stats leaks
 * - Enforces concise practical next steps
 */

export type QualityReport = {
  isValid: boolean;
  score: number; // 0 - 100
  issues: string[];
  sanitizedReply: string;
};

const FORBIDDEN_CLICHES = [
  /as an ai language model/i,
  /as an ai, i cannot/i,
  /feel free to reach out if you have any other questions/i,
  /let me know if you need anything else!*$/i,
  /hope this helps!*$/i,
  /i am just an ai/i,
  /don't hesitate to ask/i,
];

export function validateAndSanitizeResponse(replyText: string): QualityReport {
  let text = replyText.trim();
  const issues: string[] = [];
  let score = 100;

  if (!text) {
    return {
      isValid: false,
      score: 0,
      issues: ["Empty response received from AI model."],
      sanitizedReply: "",
    };
  }

  // Check for forbidden generic boilerplate and sanitize if found at the end
  for (const regex of FORBIDDEN_CLICHES) {
    if (regex.test(text)) {
      issues.push(`Detected robotic cliché pattern: ${regex.source}`);
      score -= 15;
      // Strip trailing robotic filler
      text = text.replace(regex, "").trim();
    }
  }

  // Check for hallucinated placeholder links like [link](http://example.com)
  if (/https?:\/\/(?:www\.)?(?:example\.com|website\.com|link\.com)/i.test(text)) {
    issues.push("Detected placeholder URL hallucination");
    score -= 20;
    text = text.replace(/https?:\/\/(?:www\.)?(?:example\.com|website\.com|link\.com)[^\s)]*/gi, "");
  }

  // Ensure response isn't too short or truncated
  if (text.length < 20) {
    issues.push("Response too brief or truncated");
    score -= 30;
  }

  return {
    isValid: score >= 50,
    score: Math.max(0, score),
    issues,
    sanitizedReply: text,
  };
}
