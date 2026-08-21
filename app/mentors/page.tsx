"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Mentor = {
  id: string;
  name: string;
  headline: string | null;
  company: string | null;
  role: string | null;
  experience: number | null;
  expertise: string | null;
  bio: string | null;
  linkedin: string | null;
  calendly: string | null;
};

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMentors() {
      try {
        const response = await fetch("/api/mentors");

        if (!response.ok) {
          throw new Error("Unable to load mentors");
        }

        const data = await response.json();

        setMentors(data.mentors || []);
      } catch {
        setMentors([]);
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  return (
    <main className="mentors-page">
      <section className="mentors-hero">
        <p className="eyebrow">PEOPLE WHO&apos;VE BEEN THERE</p>

        <h1>
          Find someone whose
          <br />
          experience speaks to you.
        </h1>

        <p>
          Explore mentors and learn from people who have navigated careers,
          transitions and challenges of their own.
        </p>
      </section>

      <section className="mentors-list-section">
        {loading ? (
          <div className="empty-state">
            <p>Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="empty-state">
            <h2>We&apos;re growing our mentor community.</h2>

            <p>
              Tell us what you need help with and we&apos;ll help guide you
              toward the right next step.
            </p>

            <Link href="/mentee" className="find-mentor-button">
              Tell us what you need <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="mentor-grid">
            {mentors.map((mentor) => (
              <article className="mentor-card" key={mentor.id}>
                <div className="mentor-avatar">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>

                <p className="mentor-expertise">
                  {mentor.expertise || "Mentor"}
                </p>

                <h2>{mentor.name}</h2>

                <p className="mentor-headline">
                  {mentor.headline ||
                    mentor.role ||
                    "Experienced professional"}
                </p>

                {mentor.company && (
                  <p className="mentor-company">{mentor.company}</p>
                )}

                {mentor.bio && (
                  <p className="mentor-bio">{mentor.bio}</p>
                )}

                <div className="mentor-actions">
                  {mentor.linkedin && (
                    <a
                      href={mentor.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mentor-link"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                  {mentor.calendly && (
                    <a
                      href={mentor.calendly}
                      target="_blank"
                      rel="noreferrer"
                      className="find-mentor-button small-button"
                    >
                      Book a conversation →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
