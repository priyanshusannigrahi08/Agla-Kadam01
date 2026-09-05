export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  readTime: string;
  image: string;
  intro: string;
  sections: ArticleSection[];
  takeaway: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "choose-your-next-career-step",
    category: "CAREER GUIDANCE",
    title: "How to Choose Your Next Career Step When You Feel Stuck",
    excerpt: "A practical framework for turning career uncertainty into a small, testable next move.",
    author: "AglaKadam Editorial",
    role: "Career guidance",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
    intro: "Career uncertainty rarely means you have no options. More often, it means you have too many options and not enough information to compare them. The goal is not to discover a perfect career overnight. It is to choose a next step that gives you better information about yourself and the market.",
    sections: [
      { heading: "Start with the decision, not the job title", paragraphs: ["Write down the decision you are actually trying to make. It might be whether to pursue a master's degree, take a job, switch fields, build a portfolio, or spend a few months exploring. A vague question creates vague research; a specific decision gives you something you can test."], bullets: ["What decision needs to be made?", "What would a good outcome look like?", "What information are you missing right now?"] },
      { heading: "Separate what you know from what you assume", paragraphs: ["Make two columns: evidence and assumptions. Evidence includes things you have actually experienced, researched, built or discussed with people in the field. Assumptions are statements such as 'this industry is impossible to enter' or 'I need another degree first'. This simple separation often reveals where a conversation with an experienced person would be valuable."] },
      { heading: "Choose a reversible experiment", paragraphs: ["Instead of making a five-year commitment, design a two-to-four-week experiment. Shadow the work through a project, speak to two professionals, complete a beginner course, analyse a real dataset, or build a small portfolio piece. A good experiment produces evidence, not just motivation."], bullets: ["Keep the experiment small enough to finish.", "Define what you will learn before starting.", "Use the result to decide the next experiment."] },
      { heading: "Use mentors for context, not permission", paragraphs: ["A mentor cannot make the decision for you. The most useful mentor conversation helps you understand trade-offs, common mistakes, realistic entry points and what the work feels like in practice. Bring specific questions and leave with one or two actions you can own."] },
    ],
    takeaway: "You do not need your entire career mapped out. You need a next step that creates useful information and moves you forward."
  },
  {
    slug: "skills-that-compound",
    category: "CAREER GROWTH",
    title: "The Skills That Compound Over Time",
    excerpt: "Why communication, analytical thinking, digital fluency and problem-solving become more valuable as your career grows.",
    author: "AglaKadam Editorial",
    role: "Skills & learning",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",
    intro: "Some skills help you complete a task today. Others improve the way you learn, communicate and solve problems for years. These compounding skills are especially useful early in a career because they transfer across roles and industries.",
    sections: [
      { heading: "Communication makes every technical skill easier to use", paragraphs: ["Being able to explain an analysis, write a clear message or present a recommendation changes how your work is understood. Strong communication is not about sounding impressive. It is about making the important point easy to find and easy to act on."] },
      { heading: "Learn to work with data", paragraphs: ["You do not need to become a data scientist to benefit from data literacy. Learn how to clean basic information, question a number, interpret a chart, use spreadsheets well and explain what the evidence does and does not prove. These habits improve decision-making in almost every business function."], bullets: ["Spreadsheets and structured data", "Basic statistics and charts", "SQL or another practical data tool", "Clear evidence-based storytelling"] },
      { heading: "Build problem-solving habits", paragraphs: ["When something goes wrong, resist the urge to jump straight to a solution. Define the problem, identify constraints, break it into parts, test a hypothesis and review the result. This process becomes more valuable as problems become less clearly defined."] },
      { heading: "Use AI as a learning multiplier", paragraphs: ["AI tools can help you brainstorm, practise, debug, summarise and challenge your thinking. The strongest use is active rather than passive: ask for examples, attempt the problem yourself, compare approaches and verify important claims. The goal is to become better at thinking, not simply faster at producing text."] },
    ],
    takeaway: "Choose skills that make you better at learning, communicating and solving problems. Those capabilities travel with you when your job title changes."
  },
  {
    slug: "should-you-do-a-masters",
    category: "HIGHER STUDIES",
    title: "Should You Do a Master’s Degree? A Better Way to Decide",
    excerpt: "Look beyond rankings and ask whether a postgraduate degree solves the specific problem you have.",
    author: "AglaKadam Editorial",
    role: "Higher studies",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
    intro: "A master's degree can deepen expertise, open a new geography, support a career switch or unlock roles that require postgraduate training. It can also be an expensive way to postpone a decision. The right question is not whether a master's is good; it is whether it is the right tool for your goal.",
    sections: [
      { heading: "Define the outcome first", paragraphs: ["Write the role, field or opportunity you want after the degree. Then research what people in that path actually use the degree for. If the degree is optional, compare it with gaining work experience or building a portfolio."] },
      { heading: "Calculate the real cost", paragraphs: ["Look beyond tuition. Include living costs, travel, application expenses and the income or experience you give up while studying. Then compare that total with the likely value of the network, skills, recruiting access and credentials the programme provides."] },
      { heading: "Evaluate the programme, not only the university", paragraphs: ["Course structure, faculty, projects, alumni outcomes, industry links and peer quality can matter more for your particular goal than a broad institutional ranking. Speak with current students and recent graduates and ask what changed for them because of the programme."], bullets: ["What projects will I actually build?", "Who recruits from this programme?", "What does the alumni network look like in my target field?", "What support exists for internships or career changes?"] },
      { heading: "Know when waiting is useful", paragraphs: ["Sometimes one or two years of work, projects or internships will make your master's choice much sharper. Experience can help you identify the specialisation you actually want and strengthen your application. Waiting is not falling behind if you are deliberately building evidence."] },
    ],
    takeaway: "Treat a master's as an investment with a specific purpose. If you cannot explain what problem the degree solves, keep researching before committing."
  },
  {
    slug: "career-switch-without-starting-over",
    category: "CAREER TRANSITIONS",
    title: "How to Switch Careers Without Starting From Zero",
    excerpt: "Find the overlap between your existing experience and the field you want to enter.",
    author: "AglaKadam Editorial",
    role: "Career transitions",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=85",
    intro: "A career switch can feel like deleting years of progress. Usually, that is the wrong mental model. Your existing experience contains skills, domain knowledge and proof of execution that can become an advantage in a new field.",
    sections: [
      { heading: "Map your transferable skills", paragraphs: ["List the work you have already done and translate it into capabilities: analysis, project management, client communication, research, sales, operations, writing, leadership or technical execution. Then compare those capabilities with the target role."] },
      { heading: "Find bridge roles", paragraphs: ["The fastest transition is not always directly from your current title to your dream title. A bridge role can combine your existing domain knowledge with one new skill. For example, an operations professional might move into business analytics before targeting a more technical analytics role."] },
      { heading: "Create proof of the new skill", paragraphs: ["A course can show that you studied something. A project can show that you used it. Build a small body of work that demonstrates the new capability in a realistic context. Explain your decisions, not just the final output."] },
      { heading: "Talk to people already doing the work", paragraphs: ["Ask professionals how they entered the field, which skills are actually screened for and what beginners commonly misunderstand. Their answers can help you avoid spending months learning something that is not relevant to your target role."] },
    ],
    takeaway: "A career switch is often a bridge, not a restart. Preserve your existing strengths while deliberately adding the skills your target field requires."
  },
  {
    slug: "first-year-career-plan",
    category: "EARLY CAREER",
    title: "A Simple First-Year Career Plan for Students and Fresh Graduates",
    excerpt: "What to focus on in your first year when everything feels important at once.",
    author: "AglaKadam Editorial",
    role: "Early career",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
    intro: "Your first year is not about becoming an expert. It is about building a reliable foundation: learning how work actually happens, developing useful skills, collecting evidence of your abilities and understanding what kind of work energises you.",
    sections: [
      { heading: "Months 1–3: Learn the environment", paragraphs: ["Understand how your organisation or industry makes decisions. Learn the vocabulary, tools, customers and processes around your role. Ask thoughtful questions and keep notes on recurring problems."] },
      { heading: "Months 4–6: Own a small outcome", paragraphs: ["Move from completing assigned tasks to owning a clearly defined result. It could be improving a report, automating a repetitive step, analysing a customer issue or making a process easier for the team. Document the before-and-after impact."] },
      { heading: "Months 7–9: Build your professional signal", paragraphs: ["Turn your learning into visible evidence. Update your portfolio, CV or professional profile with concrete outcomes. Share useful work where appropriate. The goal is not personal branding for its own sake; it is making your capabilities easier to evaluate."] },
      { heading: "Months 10–12: Review and choose", paragraphs: ["Look back at what you enjoyed, what you became good at and where your curiosity increased. Decide whether to deepen your current path, explore an adjacent one or prepare for further study. Make the decision using evidence from the year."] },
    ],
    takeaway: "Use your first year to build evidence, not pressure. Skills and clarity grow faster when you consistently reflect on real work."
  },
  {
    slug: "build-a-portfolio-that-gets-noticed",
    category: "CAREER GROWTH",
    title: "How to Build a Portfolio That Actually Gets Noticed",
    excerpt: "A portfolio is strongest when it makes your thinking and results easy for another person to understand.",
    author: "AglaKadam Editorial",
    role: "Career growth",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
    intro: "A portfolio does not need dozens of projects. It needs a few pieces that answer three questions quickly: what problem did you work on, how did you approach it, and what did you learn or improve?",
    sections: [
      { heading: "Choose depth over volume", paragraphs: ["Three thoughtful projects are usually more useful than fifteen unfinished ones. Choose projects that demonstrate different strengths: analysis, execution, communication, design or technical problem-solving."] },
      { heading: "Tell the story behind each project", paragraphs: ["For every project, explain the context, your responsibility, the approach, the tools, the result and what you would change next time. Showing decisions makes the work more credible than displaying a polished final screen alone."] },
      { heading: "Use realistic problems", paragraphs: ["Projects become more persuasive when they resemble real work. Analyse a public dataset, redesign a confusing workflow, build a small internal-style tool or research a business problem. State your assumptions clearly when working with public or simulated data."] },
      { heading: "Make it easy to review", paragraphs: ["Keep navigation simple. Put the strongest project first, write clear headings and remove unnecessary decoration. A recruiter, mentor or hiring manager should understand your strengths within a few minutes."] },
    ],
    takeaway: "A portfolio is evidence. Show how you think, what you built and what changed because of your work."
  },
  {
    slug: "networking-without-feeling-fake",
    category: "PROFESSIONAL NETWORKING",
    title: "Networking Without Feeling Fake or Transactional",
    excerpt: "Build professional relationships by being curious, specific and useful instead of asking for favours immediately.",
    author: "AglaKadam Editorial",
    role: "Professional growth",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
    intro: "Networking is often described as collecting contacts. A healthier approach is building a small network of people whose experiences you understand and whose work you genuinely find interesting.",
    sections: [
      { heading: "Start with curiosity", paragraphs: ["When you meet someone, learn about their path. Ask what they work on, how they entered the field and what they wish they had known earlier. Good questions create better conversations than a long introduction about yourself."] },
      { heading: "Make the ask specific", paragraphs: ["If you want advice, ask for fifteen or thirty minutes and explain the exact topic. 'Can you tell me about your career?' is broad. 'I am deciding between analytics and finance roles; could I ask how your first role shaped that choice?' is easier to answer."] },
      { heading: "Follow up with value", paragraphs: ["After a conversation, thank the person and mention one useful thing you learned. If you later act on their advice, tell them what happened. Relationships become stronger when conversations lead to genuine progress."] },
      { heading: "Build before you need something", paragraphs: ["Do not wait until you need a referral or job. Stay in touch occasionally, share a relevant resource, congratulate people on meaningful milestones and continue learning about their work. Professional relationships grow over time."] },
    ],
    takeaway: "Good networking is not collecting people. It is building trust through thoughtful conversations and consistent follow-through."
  },
  {
    slug: "how-to-use-a-mentor-well",
    category: "MENTORSHIP",
    title: "How to Make a Mentor Conversation Actually Useful",
    excerpt: "Prepare better questions, share enough context and leave with actions you can own.",
    author: "AglaKadam Editorial",
    role: "Mentorship",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
    intro: "A mentor conversation is most valuable when it is focused. You are not trying to transfer someone's entire career into your own. You are using their experience to see your current decision more clearly.",
    sections: [
      { heading: "Send context before the call", paragraphs: ["Share a short summary of where you are, what you are considering and what you have already tried. This gives the mentor enough context to spend the conversation on useful discussion rather than basic background."] },
      { heading: "Bring three strong questions", paragraphs: ["Prioritise questions where experience changes the answer. Ask about trade-offs, mistakes, realistic timelines, skills and how decisions played out in practice. Avoid questions that can be answered by a basic search."] },
      { heading: "Challenge advice respectfully", paragraphs: ["You do not have to accept every suggestion. Explain your constraints and ask why the mentor recommends an approach. The goal is better reasoning, not automatic agreement."] },
      { heading: "Leave with a next step", paragraphs: ["Write down one action you will take after the call and one question that remains open. If the conversation helped, consider what evidence would tell you whether the advice worked."] },
    ],
    takeaway: "The best mentor call changes what you do next. Prepare well, ask specific questions and turn insight into action."
  },
  {
    slug: "job-search-without-applying-everywhere",
    category: "JOB SEARCH",
    title: "A Smarter Job Search: Stop Applying Everywhere",
    excerpt: "Use a focused search strategy built around role fit, evidence and thoughtful conversations.",
    author: "AglaKadam Editorial",
    role: "Job search",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=85",
    intro: "Sending applications to every vaguely relevant opening can feel productive while producing little learning. A focused search helps you understand which roles fit you, improve your materials and learn from each response.",
    sections: [
      { heading: "Define a target role family", paragraphs: ["Pick two or three related role families rather than twenty unrelated titles. Research common responsibilities, entry requirements and skills. This makes it easier to tailor your CV and portfolio without rewriting your identity for every listing."] },
      { heading: "Build evidence around the target", paragraphs: ["If a role repeatedly asks for a skill, find a practical way to demonstrate it. A project, case study, certification or internship can create stronger evidence than simply listing the skill in a profile."] },
      { heading: "Use conversations as research", paragraphs: ["Talk with people doing similar work and ask what they look for in junior candidates. You may discover that a skill you thought was central is less important than another capability you already have."] },
      { heading: "Review your search every two weeks", paragraphs: ["Track applications, interviews, referrals and rejection patterns. If many applications produce no response, change one variable: target role, CV positioning, portfolio evidence or networking approach. Treat the search as an experiment."] },
    ],
    takeaway: "A good job search creates learning as well as applications. Focus your target, build evidence and adjust based on real signals."
  },
  {
    slug: "finance-and-data-career-bridge",
    category: "FINANCE & ANALYTICS",
    title: "The Finance + Data Skills Combination Is Powerful",
    excerpt: "Why combining financial understanding with analytics can create useful career options across modern businesses.",
    author: "AglaKadam Editorial",
    role: "Finance & analytics",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85",
    intro: "Businesses increasingly need people who can understand both the numbers and the decisions behind them. Finance knowledge provides business context; data skills help turn large amounts of information into clearer evidence.",
    sections: [
      { heading: "Start with business questions", paragraphs: ["Do not learn analytics only as a collection of tools. Practise questions such as why revenue changed, which customers are most valuable, where costs are rising or how a forecast should be evaluated. Business questions give technical skills a purpose."] },
      { heading: "Build the technical foundation", paragraphs: ["Spreadsheets remain useful, but add SQL, data visualisation and basic statistics as your skills grow. Python can become valuable for automation and deeper analysis once your fundamentals are strong."], bullets: ["Advanced spreadsheet modelling", "SQL for querying structured data", "Power BI or another visualisation tool", "Statistics and forecasting fundamentals", "Python for analysis and automation"] },
      { heading: "Create finance-focused projects", paragraphs: ["Build projects around budgeting, profitability, financial statement analysis, forecasting or customer economics. Explain assumptions and show how your analysis could support a decision."] },
      { heading: "Learn to communicate the recommendation", paragraphs: ["A strong analyst does more than calculate a number. Explain what changed, why it matters, what action you recommend and what uncertainty remains. This is where finance and data skills become decision-making skills."] },
    ],
    takeaway: "The advantage is not knowing finance and data separately. It is being able to connect analysis to a real business decision."
  },
  {
    slug: "learning-from-career-mistakes",
    category: "CAREER LESSONS",
    title: "Career Mistakes Are Data: How to Learn From Them",
    excerpt: "Turn disappointing outcomes into information instead of letting them define your next decision.",
    author: "AglaKadam Editorial",
    role: "Career reflection",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=85",
    intro: "A missed opportunity, weak project or wrong career choice can feel like a verdict on your ability. A more useful approach is to treat the outcome as evidence. What happened, what was under your control and what should change next time?",
    sections: [
      { heading: "Describe the event without judgement", paragraphs: ["Write down what happened using observable facts. Avoid labels such as 'I am bad at interviews'. Instead write what occurred: the interview ended early, you could not explain a project clearly, or you lacked an example for a common question."] },
      { heading: "Find the controllable variable", paragraphs: ["Not every outcome is under your control. Separate timing, competition and external decisions from preparation, communication, skill gaps or strategy. Focus your improvement effort where you have influence."] },
      { heading: "Change one behaviour", paragraphs: ["Choose one adjustment that can be tested. Practise explaining projects aloud, ask for feedback earlier, research a role more deeply or build the missing skill. A small behavioural change is more useful than a vague promise to 'do better'."] },
      { heading: "Keep perspective", paragraphs: ["One result rarely tells the whole story. Careers contain experiments, changes and detours. Use the lesson, but do not let a single outcome become your identity."] },
    ],
    takeaway: "A career mistake becomes useful when it changes your next decision. Capture the lesson, change a behaviour and keep moving."
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}
