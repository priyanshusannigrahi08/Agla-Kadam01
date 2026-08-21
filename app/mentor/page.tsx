"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const expertiseOptions = [
  "Career guidance",
  "Higher studies",
  "Job search",
  "Career switching",
  "Technology",
  "Business / entrepreneurship",
  "Marketing / growth",
  "Personal development",
  "Other",
];

export default function MentorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    headline: "",
    company: "",
    role: "",
    experience: "",
    expertise: "",
    linkedin: "",
    calendly: "",
    bio: "",
    whyMentor: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const response = await fetch("/api/mentors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Unable to submit");
      }

      router.push("/thank-you?type=mentor");
    } catch {
      setMessage(
        "Something went wrong while submitting your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mentor-page">
      <section className="mentor-page-hero">
        <div>
          <p className="eyebrow">FOR PEOPLE WHO WANT TO GIVE BACK</p>

          <h1>
            Your journey might be
            <br />
            exactly what someone
            <br />
            needs to hear.
          </h1>

          <p>
            Become part of AglaKadam and help someone navigate a decision,
            transition or challenge you may have already experienced yourself.
          </p>
        </div>
      </section>

      <section className="form-wrapper">
        <form className="agla-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <p className="form-step">01 — INTRODUCE YOURSELF</p>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="name">Full name</label>

                <input
                  id="name"
                  className="agla-input"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                  placeholder="Your name"
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
                <label htmlFor="headline">
                  A short professional headline
                </label>

                <input
                  id="headline"
                  className="agla-input"
                  value={form.headline}
                  onChange={(event) =>
                    updateField("headline", event.target.value)
                  }
                  required
                  placeholder="e.g. Product Manager helping early-career professionals"
                />
              </div>

              <div className="form-field">
                <label htmlFor="company">Current company</label>

                <input
                  id="company"
                  className="agla-input"
                  value={form.company}
                  onChange={(event) =>
                    updateField("company", event.target.value)
                  }
                  placeholder="Company or organisation"
                />
              </div>

              <div className="form-field">
                <label htmlFor="role">Current role</label>

                <input
                  id="role"
                  className="agla-input"
                  value={form.role}
                  onChange={(event) =>
                    updateField("role", event.target.value)
                  }
                  required
                  placeholder="Your role"
                />
              </div>

              <div className="form-field">
                <label htmlFor="experience">
                  Years of professional experience
                </label>

                <input
                  id="experience"
                  type="number"
                  min="0"
                  className="agla-input"
                  value={form.experience}
                  onChange={(event) =>
                    updateField("experience", event.target.value)
                  }
                  required
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <p className="form-step">02 — HOW CAN YOU HELP?</p>

            <div className="form-field">
              <label htmlFor="expertise">Primary area of expertise</label>

              <select
                id="expertise"
                className="agla-input"
                value={form.expertise}
                onChange={(event) =>
                  updateField("expertise", event.target.value)
                }
                required
              >
                <option value="">Choose an area</option>

                {expertiseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="bio">
                Tell us about your professional journey
              </label>

              <textarea
                id="bio"
                className="agla-input"
                value={form.bio}
                onChange={(event) =>
                  updateField("bio", event.target.value)
                }
                required
                placeholder="Share the experiences, transitions or lessons that might be useful to someone else."
              />
            </div>

            <div className="form-field">
              <label htmlFor="whyMentor">
                Why would you like to mentor through AglaKadam?
              </label>

              <textarea
                id="whyMentor"
                className="agla-input"
                value={form.whyMentor}
                onChange={(event) =>
                  updateField("whyMentor", event.target.value)
                }
                required
                placeholder="Tell us why this matters to you."
              />
            </div>
          </div>

          <div className="form-section">
            <p className="form-step">03 — YOUR PROFILES & AVAILABILITY</p>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="linkedin">LinkedIn profile URL</label>

                <input
                  id="linkedin"
                  type="url"
                  className="agla-input"
                  value={form.linkedin}
                  onChange={(event) =>
                    updateField("linkedin", event.target.value)
                  }
                  required
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="form-field">
                <label htmlFor="calendly">
                  Calendly booking URL (optional)
                </label>

                <input
                  id="calendly"
                  type="url"
                  className="agla-input"
                  value={form.calendly}
                  onChange={(event) =>
                    updateField("calendly", event.target.value)
                  }
                  placeholder="https://calendly.com/..."
                />
              </div>
            </div>
          </div>

          {message && <p className="form-message error">{message}</p>}

          <button
            type="submit"
            className="find-mentor-button submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Apply to become a mentor"}{" "}
            <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
