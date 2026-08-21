"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MenteeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSituation = searchParams.get("situation") || "";
  const initialNeed = searchParams.get("need") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [situation, setSituation] = useState(initialSituation);
  const [background, setBackground] = useState("");
  const [stuckOn, setStuckOn] = useState("");
  const [need, setNeed] = useState(initialNeed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !situation || !background.trim() || !stuckOn.trim()) {
      setError("Please fill in all the required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mentees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          situation,
          background,
          stuck_on: stuckOn,
          help_needed: need,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      router.push(
        `/matches?situation=${encodeURIComponent(
          situation
        )}&need=${encodeURIComponent(need)}`
      );
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="mentee-page">
      <section className="mentee-container">
        <div className="mentee-header">
          <p className="eyebrow">STEP 1 OF 1</p>

          <h1>Start with your story</h1>

          <p className="mentee-intro">
            The more specific you are, the easier it is to understand who might
            be useful for you to talk to.
          </p>
        </div>

        <form className="mentee-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="name">Your name</label>

              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="situation">Which of these fits you best?</label>

            <select
              id="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            >
              <option value="">Choose the situation closest to yours</option>
              <option value="student">I am a student</option>
              <option value="college">I am choosing or navigating college</option>
              <option value="career-start">I am starting my career</option>
              <option value="career-change">I am considering a career change</option>
              <option value="job-search">I am looking for a job</option>
              <option value="higher-studies">
                I am considering higher studies
              </option>
              <option value="business">
                I am building or exploring a business
              </option>
              <option value="personal-growth">
                I am looking for personal guidance
              </option>
              <option value="other">Something else</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="background">Your background</label>

            <textarea
              id="background"
              placeholder="Tell us about your degree, field, work, projects, or anything else that helps explain where you are coming from."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="stuckOn">What are you actually stuck on?</label>

            <textarea
              id="stuckOn"
              placeholder="Be specific. For example: 'I am considering an MBA but I don't know if it makes sense for my marketing career.'"
              value={stuckOn}
              onChange={(e) => setStuckOn(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="need">What do you need help with?</label>

            <select
              id="need"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
            >
              <option value="">Choose what you need help with</option>
              <option value="career">Career guidance</option>
              <option value="studies">Education and higher studies</option>
              <option value="switching">Career switching</option>
              <option value="job">Job search and applications</option>
              <option value="skills">Skills and professional growth</option>
              <option value="business">Business or entrepreneurship</option>
              <option value="personal">Personal direction and decision-making</option>
              <option value="other">Something else</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-footer">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Finding your mentor..." : "Submit and continue →"}
            </button>

            <p>
              This information is used to understand your situation and help
              make a relevant mentor connection.
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

function MenteeLoading() {
  return (
    <main className="mentee-page">
      <section className="mentee-container">
        <div className="mentee-header">
          <p className="eyebrow">AGLA KADAM</p>
          <h1>Preparing your journey...</h1>
          <p className="mentee-intro">
            Just a moment while we prepare your form.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function MenteePage() {
  return (
    <Suspense fallback={<MenteeLoading />}>
      <MenteeForm />
    </Suspense>
  );
}
