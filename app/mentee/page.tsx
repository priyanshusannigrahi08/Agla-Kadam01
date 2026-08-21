"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

const situations = [
  { value: "", label: "Choose the situation closest to yours" },
  { value: "student", label: "Student" },
  { value: "recent-graduate", label: "Recent graduate" },
  { value: "working-professional", label: "Working professional" },
  { value: "career-switcher", label: "Career switcher" },
  { value: "entrepreneur", label: "Entrepreneur / founder" },
  { value: "feeling-stuck", label: "Feeling stuck / unsure" },
];

const helpAreas = [
  { value: "", label: "Choose what you need help with" },
  { value: "career-direction", label: "Career direction" },
  { value: "higher-studies", label: "Higher studies" },
  { value: "job-search", label: "Job search" },
  { value: "career-switch", label: "Career switch" },
  { value: "starting-business", label: "Starting a business" },
  { value: "skills-technology", label: "Skills / technology" },
  {
    value: "marketing-business-growth",
    label: "Marketing / business growth",
  },
  { value: "something-else", label: "Something else" },
];

export default function MenteePage() {
  const searchParams = useSearchParams();

  const initialStage = searchParams.get("stage") || "";
  const initialArea = searchParams.get("area") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [situation, setSituation] = useState(initialStage);
  const [helpArea, setHelpArea] = useState(initialArea);

  const [background, setBackground] = useState("");
  const [stuckOn, setStuckOn] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitted(false);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!situation) {
      setError("Please choose the situation that fits you best.");
      return;
    }

    if (!helpArea) {
      setError("Please choose what you need help with.");
      return;
    }

    if (!background.trim()) {
      setError("Please tell us a little about your background.");
      return;
    }

    if (!stuckOn.trim()) {
      setError("Please tell us what you are currently stuck on.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/mentees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          situation,
          helpArea,
          background,
          stuckOn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong while submitting your information."
        );
      }

      setSubmitted(true);

      setName("");
      setEmail("");
      setSituation("");
      setHelpArea("");
      setBackground("");
      setStuckOn("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mentee-page">
      <section className="form-hero">
        <div className="form-container">
          <p className="eyebrow">STEP 1 OF 1</p>

          <h1>Start with your story</h1>

          <p className="form-intro">
            The more specific you are, the easier it is to understand who might
            be useful for you to talk to.
          </p>

          <form onSubmit={handleSubmit} className="mentee-form">
            {/* NAME + EMAIL */}

            <div className="form-grid two-columns">
              <div className="form-field">
                <label htmlFor="name">Your name</label>

                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            {/* SITUATION */}

            <div className="form-field">
              <label htmlFor="situation">
                Which of these fits you best?
              </label>

              <select
                id="situation"
                value={situation}
                onChange={(event) =>
                  setSituation(event.target.value)
                }
              >
                {situations.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* HELP AREA */}

            <div className="form-field">
              <label htmlFor="help-area">
                What do you need help with?
              </label>

              <select
                id="help-area"
                value={helpArea}
                onChange={(event) =>
                  setHelpArea(event.target.value)
                }
              >
                {helpAreas.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* BACKGROUND */}

            <div className="form-field">
              <label htmlFor="background">
                Your background
              </label>

              <textarea
                id="background"
                placeholder="Tell us about your degree, field, work experience, projects, or anything else that helps explain where you are coming from."
                value={background}
                onChange={(event) =>
                  setBackground(event.target.value)
                }
              />
            </div>

            {/* WHAT ARE YOU STUCK ON */}

            <div className="form-field">
              <label htmlFor="stuck-on">
                What are you actually stuck on?
              </label>

              <textarea
                id="stuck-on"
                placeholder="Be specific. For example: 'I am considering an MBA but I don't know if it makes sense for my marketing career.'"
                value={stuckOn}
                onChange={(event) =>
                  setStuckOn(event.target.value)
                }
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="form-message form-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {submitted && (
              <div className="form-message form-success">
                Your information has been submitted successfully. We&apos;ll use
                it to help find a relevant mentor connection.
              </div>
            )}

            <div className="form-submit-area">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit and continue →"}
              </button>

              <p>
                This information is used to understand your situation and help
                make a relevant mentor connection.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
