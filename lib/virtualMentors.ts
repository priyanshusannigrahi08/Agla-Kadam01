export type VirtualMentor = {
  id: string;
  name: string;
  headline: string;
  expertise: string;
  bio: string;
  avatar: string;
};

export const virtualMentors: VirtualMentor[] = [
  { id: "arjun-mehta", name: "Arjun Mehta", headline: "Software Engineering Mentor", expertise: "Software engineering, web development, DSA, internships", bio: "Practical guidance for building skills, projects and a strong path into software engineering.", avatar: "AM" },
  { id: "priya-nair", name: "Priya Nair", headline: "Product Management Mentor", expertise: "Product management, strategy, career transitions", bio: "Structured guidance for understanding products, business thinking and product careers.", avatar: "PN" },
  { id: "kabir-shah", name: "Kabir Shah", headline: "Data Science & AI Mentor", expertise: "Data science, machine learning, AI, analytics", bio: "A clear path through data, machine learning and AI careers.", avatar: "KS" },
  { id: "meera-iyer", name: "Meera Iyer", headline: "UX/UI Design Mentor", expertise: "UX, UI, design portfolios, user research", bio: "Guidance for building design skills, portfolios and a thoughtful design career.", avatar: "MI" },
  { id: "rohan-kapoor", name: "Rohan Kapoor", headline: "Entrepreneurship Mentor", expertise: "Startups, validation, business models, execution", bio: "Practical conversations about ideas, customers and building something people actually need.", avatar: "RK" },
  { id: "aisha-khan", name: "Aisha Khan", headline: "Marketing & Growth Mentor", expertise: "Marketing, branding, growth, content strategy", bio: "Guidance for understanding audiences, growth and modern marketing careers.", avatar: "AK" },
  { id: "vikram-rao", name: "Vikram Rao", headline: "Finance & Accounting Mentor", expertise: "Finance, accounting, CA careers, corporate finance", bio: "A structured guide to finance and accounting career paths.", avatar: "VR" },
  { id: "ananya-sharma", name: "Dr. Ananya Sharma", headline: "Medical Careers Mentor", expertise: "Medical education, NEET, MBBS, specializations", bio: "Career guidance for aspiring doctors and medical professionals. Not for medical diagnosis.", avatar: "AS" },
  { id: "neha-verma", name: "Neha Verma", headline: "Law & Legal Careers Mentor", expertise: "Law school, legal careers, specializations", bio: "Explore legal career paths, education choices and professional directions.", avatar: "NV" },
  { id: "rahul-singh", name: "Rahul Singh", headline: "Civil Engineering Mentor", expertise: "Civil engineering, construction, infrastructure", bio: "Guidance for education, skills and career opportunities in civil engineering.", avatar: "RS" },
  { id: "karan-malhotra", name: "Karan Malhotra", headline: "Mechanical Engineering Mentor", expertise: "Mechanical engineering, CAD, manufacturing", bio: "Explore technical skills and career directions across mechanical engineering.", avatar: "KM" },
  { id: "sneha-patel", name: "Sneha Patel", headline: "Psychology Careers Mentor", expertise: "Psychology education, research, career pathways", bio: "Guidance about psychology as a field of study and career. Not mental-health treatment.", avatar: "SP" },
  { id: "aditya-bose", name: "Aditya Bose", headline: "Higher Studies & Research Mentor", expertise: "Masters, PhD, research, applications", bio: "Think clearly about higher education, research and long-term academic goals.", avatar: "AB" },
  { id: "isha-menon", name: "Isha Menon", headline: "Education & Teaching Mentor", expertise: "Teaching careers, education, learning", bio: "Explore pathways into teaching, education and learning-focused careers.", avatar: "IM" },
  { id: "aarav-khanna", name: "Aarav Khanna", headline: "Creative Careers Mentor", expertise: "Writing, content, media, creative careers", bio: "Guidance for turning creative interests into practical career paths.", avatar: "AK" },
];

export function isVirtualMentor(id: string) {
  return virtualMentors.some((mentor) => mentor.id === id);
}

export function getVirtualMentor(id: string) {
  return virtualMentors.find((mentor) => mentor.id === id);
}
