"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function HomePage() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [helpArea, setHelpArea] = useState("");

  function handleFindMentor() {
    const params = new URLSearchParams();

    if (situation) params.set("stage", situation);
    if (helpArea) params.set("area", helpArea);

    const query = params.toString();

    router.push(query ? `/mentee?${query}` : "/mentee");
  }

  return (
    <main className="site-shell">
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">GUIDANCE FOR YOUR NEXT STEP</p>

            <h1>
              You don&apos;t have to figure
              <br />
              everything out alone.
            </h1>

            <p className="hero-description">
              Connect with people who have already walked a path similar to the
              one you&apos;re trying to navigate.
            </p>
          </div>

          <div className="quick-match">
            <div className="quick-match-field">
              <label htmlFor="situation">
                WHERE ARE YOU RIGHT NOW?
              </label>

              <select
                id="situation"
                value={situation}
                onChange={(event) => setSituation(event.target.value)}
              >
                {situations.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="quick-match-field">
              <label htmlFor="help-area">
                WHAT DO YOU NEED HELP WITH?
              </label>

              <select
                id="help-area"
                value={helpArea}
                onChange={(event) => setHelpArea(event.target.value)}
              >
                {helpAreas.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="find-mentor-button"
              onClick={handleFindMentor}
            >
              Find my mentor <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>

          <h2>
            A little guidance can
            <br />
            change your direction.
          </h2>

          <p>
            Tell us where you are, what you&apos;re struggling with and what
            kind of guidance you&apos;re looking for.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">01</span>
            <h3>Tell us your story</h3>
            <p>
              Share your current situation, background, goals and what you feel
              stuck on.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">02</span>
            <h3>Find the right perspective</h3>
            <p>
              We help connect you with mentors whose experience is relevant to
              the path you&apos;re trying to navigate.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">03</span>
            <h3>Start the conversation</h3>
            <p>
              Ask questions, get perspective and take your next step with more
              clarity and confidence.
            </p>
          </article>
        </div>
      </section>

      <section className="home-section audience-section">
        <div className="section-heading">
          <p className="eyebrow">WHO IS AGLA KADAM FOR?</p>

          <h2>
            Wherever you are,
            <br />
            there&apos;s a next step.
          </h2>
        </div>

        <div className="audience-grid">
          <article className="audience-card">
            <span>01</span>
            <h3>Students</h3>
            <p>
              Explore careers, higher studies, skills and the possibilities in
              front of you.
            </p>
          </article>

          <article className="audience-card">
            <span>02</span>
            <h3>Professionals</h3>
            <p>
              Get perspective on growth, difficult decisions and your next
              career move.
            </p>
          </article>

          <article className="audience-card">
            <span>03</span>
            <h3>Career changers</h3>
            <p>
              Learn from people who have made transitions and understand what
              starting again can feel like.
            </p>
          </article>

          <article className="audience-card">
            <span>04</span>
            <h3>People figuring things out</h3>
            <p>
              You don&apos;t need to have everything planned before asking for
              help.
            </p>
          </article>
        </div>
      </section>

      <section className="mentor-home-section">
        <div className="mentor-home-content">
          <div>
            <p className="eyebrow">FOR MENTORS</p>

            <h2>
              Your experience
              <br />
              could be someone&apos;s
              <br />
              next breakthrough.
            </h2>
          </div>

          <div className="mentor-home-copy">
            <p>
              You don&apos;t need to have all the answers. Sometimes sharing
              your experience, mistakes and lessons can help someone make their
              next decision with more confidence.
            </p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => router.push("/mentor")}
            >
              Become a mentor <span>→</span>
            </button>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-content">
          <p className="eyebrow">YOUR NEXT STEP STARTS HERE</p>

          <h2>
            Not sure what to do next?
            <br />
            Start with a conversation.
          </h2>

          <button
            type="button"
            className="find-mentor-button large-button"
            onClick={handleFindMentor}
          >
            Find my mentor <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
}
