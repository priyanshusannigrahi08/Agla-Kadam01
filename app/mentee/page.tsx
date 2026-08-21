"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const situations = [
  { value: "", label: "Choose your situation" },
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

function MenteeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    situation: "",
    helpArea: "",
    background: "",
    goal: "",
    challenge: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      situation: searchParams.get("stage") || current.situation,
      helpArea: searchParams.get("area") || current.helpArea,
    }));
  }, [searchParams]);

  function updateField(name: string, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/mentees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit");
      }

      router.push("/thank-you?type=mentee");
    } catch {
      setMessage(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-page-hero">
        <p className="eyebrow">FIND YOUR NEXT CONVERSATION</p>

        <h1>
          Tell us where you are.
          <br />
          We&apos;ll start from there.
        </h1>

        <p>
          The more context you share, the easier it becomes to understand what
          kind of guidance could actually help you.
        </p>
      </section>

      <section className="form-wrapper">
        <form className="agla-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <p className="form-step">01 — ABOUT YOU</p>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  className="agla-input"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                  placeholder="What should we call you?"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="agla-input"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone number (optional)</label>
                <input
                  id="phone"
                  className="agla-input"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="+91 ..."
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <p className="form-step">02 — WHERE YOU ARE NOW</p>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="situation">Your current situation</label>

                <select
                  id="situation"
                  className="agla-input"
                  value={form.situation}
                  onChange={(event) =>
                    updateField("situation", event.target.value)
                  }
                  required
                >
                  {situations.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="helpArea">What do you need help with?</label>

                <select
                  id="helpArea"
                  className="agla-input"
                  value={form.helpArea}
                  onChange={(event) =>
                    updateField("helpArea", event.target.value)
                  }
                  required
                >
                  {helpAreas.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <p className="form-step">03 — YOUR STORY</p>

            <div className="form-field">
              <label htmlFor="background">
                Tell us a little about your background
              </label>

              <textarea
                id="background"
                className="agla-input"
                value={form.background}
                onChange={(event) =>
                  updateField("background", event.target.value)
                }
                required
                placeholder="Where are you coming from? What have you studied or worked on?"
              />
            </div>

            <div className="form-field">
              <label htmlFor="goal">What are you hoping to do next?</label>

              <textarea
                id="goal"
                className="agla-input"
                value={form.goal}
                onChange={(event) =>
                  updateField("goal", event.target.value)
                }
                required
                placeholder="Describe the direction you're considering."
              />
            </div>

            <div className="form-field">
              <label htmlFor="challenge">
                What are you currently struggling with?
              </label>

              <textarea
                id="challenge"
                className="agla-input"
                value={form.challenge}
                onChange={(event) =>
                  updateField("challenge", event.target.value)
                }
                required
                placeholder="What decision, problem or uncertainty would you like guidance on?"
              />
            </div>
          </div>

          {message && <p className="form-message error">{message}</p>}

          <button
            type="submit"
            className="find-mentor-button submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit my request"} <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}

export default function MenteePage() {
  return (
    <Suspense
      fallback={
        <main className="form-page">
          <section className="form-page-hero">
            <p className="eyebrow">FIND YOUR NEXT CONVERSATION</p>
            <h1>Loading your guidance form...</h1>
          </section>
        </main>
      }
    >
      <MenteeForm />
    </Suspense>
  );
}
