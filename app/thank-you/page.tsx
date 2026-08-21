"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const isMentor = type === "mentor";

  return (
    <main className="thank-you-page">
      <div className="thank-you-card">
        <p className="eyebrow">AGLA KADAM</p>

        <div className="thank-you-icon">✓</div>

        <h1>
          {isMentor
            ? "Thank you for stepping forward."
            : "Your next conversation starts here."}
        </h1>

        <p>
          {isMentor
            ? "We’ve received your mentor application. Your experience could soon help someone else make their next step with more confidence."
            : "We’ve received your request. Thank you for sharing your situation with us."}
        </p>

        <div className="thank-you-actions">
          <Link href="/" className="secondary-link">
            Back to home
          </Link>

          {!isMentor && (
            <Link href="/mentors" className="find-mentor-button">
              Explore mentors <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<main className="thank-you-page" />}>
      <ThankYouContent />
    </Suspense>
  );
}
