export type UserContext = {
  career_stage?: string;
  current_education?: string;
  interests?: string[];
  goals?: string[];
  current_concerns?: string[];
  relevant_background?: string[];
  previous_decisions_discussed?: string[];
  conversation_summary?: string;
};

export type ConversationSummary = {
  main_problem?: string;
  background?: string;
  goals?: string[];
  options_discussed?: string[];
  important_preferences?: string[];
  unresolved_questions?: string[];
  previous_conclusions?: string[];
};

export type UserIntent =
  | "factual_question"
  | "career_decision"
  | "education_decision"
  | "skill_learning"
  | "planning"
  | "comparison"
  | "uncertainty"
  | "goal_setting"
  | "reflection"
  | "mentor_selection"
  | "general_conversation";

export type MentorPersona = {
  id: string;
  name: string;
  profession: string;
  headline: string;
  expertise: string[];
  bio: string;
  methodology: {
    approach: string;
    communicationStyle: string;
    problemTypes: string[];
    questioningStyle: string;
    mistakesToAvoid: string[];
    whenToSuggestHumanMentor: string;
  };
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequestBody = {
  mentorId: string;
  messages: ChatMessage[];
  userContext?: UserContext;
  conversationSummary?: ConversationSummary;
};
