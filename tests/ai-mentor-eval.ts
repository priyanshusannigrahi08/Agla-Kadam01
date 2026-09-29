import { MENTOR_PERSONAS, getMentorPersona } from "../lib/ai-mentor/mentorPersonas";
import { AGLAKADAM_MASTER_SYSTEM_PROMPT } from "../lib/ai-mentor/systemPrompt";
import {
  sanitizeUserContext,
  sanitizeConversationSummary,
  buildSlidingWindowConversation,
  formatUserContextBlock,
} from "../lib/ai-mentor/contextManager";
import {
  classifyUserIntent,
  getIntentStrategyInstruction,
} from "../lib/ai-mentor/intentClassifier";
import { checkRateLimit } from "../lib/ai-mentor/rateLimiter";
import { validateAndSanitizeResponse } from "../lib/ai-mentor/qualityChecker";
import { virtualMentors } from "../app/data/virtualMentors";
import testCases from "./evaluation-dataset.json";

function runEvaluation() {
  console.log("==================================================");
  console.log("AGLAKADAM AI MENTOR QUALITY EVALUATION TEST SUITE");
  console.log("==================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
    }
  }

  // TEST 1: All 15 Mentors defined with full methodologies
  console.log("\n[1] Verifying 15 Virtual Mentor Personas");
  const expectedMentors = [
    "arjun-mehta",
    "priya-nair",
    "kabir-shah",
    "meera-iyer",
    "rohan-kapoor",
    "aisha-khan",
    "vikram-rao",
    "ananya-sharma",
    "neha-verma",
    "rahul-singh",
    "karan-malhotra",
    "sneha-patel",
    "aditya-bose",
    "isha-menon",
    "aarav-khanna",
  ];

  assert(
    expectedMentors.length === 15,
    "Expected mentor list contains exactly 15 mentors"
  );

  expectedMentors.forEach((id) => {
    const p = getMentorPersona(id);
    assert(
      !!p &&
        p.expertise.length >= 3 &&
        !!p.methodology.approach &&
        !!p.methodology.communicationStyle &&
        p.methodology.problemTypes.length >= 4 &&
        !!p.methodology.questioningStyle &&
        p.methodology.mistakesToAvoid.length >= 2 &&
        !!p.methodology.whenToSuggestHumanMentor,
      `Persona '${id}' has complete structured methodology & guidelines`
    );
  });

  // TEST 2: Master System Prompt Integrity
  console.log("\n[2] Verifying Master System Prompt");
  assert(
    AGLAKADAM_MASTER_SYSTEM_PROMPT.includes("CORE MENTORING PRINCIPLES"),
    "System prompt contains core mentoring principles"
  );
  assert(
    AGLAKADAM_MASTER_SYSTEM_PROMPT.includes("FACTUAL ACCURACY & SAFETY GUARDRAILS"),
    "System prompt contains safety and factual accuracy guardrails"
  );
  assert(
    AGLAKADAM_MASTER_SYSTEM_PROMPT.includes("HUMAN MENTOR HANDOFF"),
    "System prompt contains human mentor handoff guidelines"
  );

  // TEST 3: User Context & Sanitization
  console.log("\n[3] Verifying User Context Sanitization");
  const dirtyContext = {
    career_stage: "Final-year B.Tech CS",
    current_education: "Tier-3 Engineering College",
    interests: ["Web Dev", "Distributed Systems"],
    goals: ["Get a software engineering job"],
    secret_token: "SHOULD_BE_STRIPPED_12345",
    password: "SHOULD_BE_STRIPPED_SECRET",
  };

  const cleanContext = sanitizeUserContext(dirtyContext);
  assert(
    !!cleanContext &&
      cleanContext.career_stage === "Final-year B.Tech CS" &&
      !Object.prototype.hasOwnProperty.call(cleanContext, "secret_token") &&
      !Object.prototype.hasOwnProperty.call(cleanContext, "password"),
    "Context manager strips unauthorized/sensitive fields cleanly"
  );

  const formattedContext = formatUserContextBlock(cleanContext);
  assert(
    formattedContext.includes("Final-year B.Tech CS") &&
      !formattedContext.includes("secret_token"),
    "Formatted context block includes clean user attributes"
  );

  // TEST 4: Conversation Memory & Sliding Window
  console.log("\n[4] Verifying Sliding Window Memory & History Management");
  const sampleMessages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: "I am studying civil engineering." },
    { role: "assistant", content: "Great, civil engineering has both site and design paths." },
    { role: "user", content: "I want to switch to software engineering." },
    { role: "assistant", content: "A transition requires building strong DSA and web projects." },
    { role: "user", content: "Which programming language should I pick?" },
    { role: "assistant", content: "JavaScript/TypeScript or Python are great for web dev." },
    { role: "user", content: "I chose JavaScript. What next?" },
    { role: "assistant", content: "Learn DOM manipulation and build 3 small apps." },
    { role: "user", content: "I built a calculator and a todo list." },
    { role: "assistant", content: "Now move to React and full stack development." },
    { role: "user", content: "What is Next.js?" },
    { role: "assistant", content: "Next.js is a React framework for production apps." },
    { role: "user", content: "How does server side rendering work?" },
    { role: "assistant", content: "SSR renders HTML on the server on each request." },
    { role: "user", content: "Should I deploy on Vercel?" },
  ];

  const { recentMessages, compactHistoryNotes } =
    buildSlidingWindowConversation(sampleMessages, 8);

  assert(
    recentMessages.length === 8,
    "Sliding window limits recent messages to max threshold (8)"
  );
  assert(
    !!compactHistoryNotes && compactHistoryNotes.includes("civil engineering"),
    "Earlier messages are distilled into compact conversation memory"
  );

  // TEST 5: Rate Limiter
  console.log("\n[5] Verifying Rate Limiter");
  const testIp = "192.168.1.100";
  let allowedCount = 0;
  for (let i = 0; i < 50; i++) {
    const res = checkRateLimit(testIp, 30, 60000);
    if (res.allowed) allowedCount++;
  }
  assert(
    allowedCount === 30,
    `Rate limiter strictly permitted exactly 30 requests before throttling (got ${allowedCount})`
  );

  // TEST 6: Quality Validator and Sanitizer
  console.log("\n[6] Verifying Quality Validator and Sanitizer");
  const badDraft =
    "Here is the plan. As an AI language model, I suggest you study hard. Let me know if you need anything else!";
  const qualityRes = validateAndSanitizeResponse(badDraft);
  assert(
    !qualityRes.sanitizedReply.includes("As an AI language model") &&
      !qualityRes.sanitizedReply.includes("Let me know if you need anything else!"),
    "Quality sanitizer strips robotic clichés and trailing boilerplate"
  );

  // TEST 7: Evaluation Dataset Intent Coverage
  console.log("\n[7] Testing 40 Realistic Evaluation Test Cases");
  testCases.forEach((tc) => {
    const detected = classifyUserIntent(tc.query);
    const strategy = getIntentStrategyInstruction(detected);
    const persona = getMentorPersona(tc.mentorId);

    assert(
      !!detected && !!strategy && !!persona,
      `[${tc.id}] (${tc.category}) Query: "${tc.query.slice(0, 45)}..." -> Intent: ${detected} for mentor ${tc.mentorId}`
    );
  });

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log("==================================================");

  if (passedTests === totalTests) {
    console.log("ALL AI MENTOR QUALITY EVALUATION TESTS PASSED SUCCESSFULLY! ✨");
  } else {
    process.exit(1);
  }
}

runEvaluation();
