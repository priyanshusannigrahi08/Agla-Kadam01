"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { virtualMentors } from "@/app/data/virtualMentors";

type Message = {
  id: number;
  role: "mentor" | "user";
  content: string;
};

/* -------------------------------------------------------------------------- */
/* MARKDOWN RENDERER                                                         */
/* -------------------------------------------------------------------------- */

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    /*
     * Bold: **text**
     */
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);

    /*
     * Inline code: `text`
     */
    const codeMatch = remaining.match(/`([^`]+)`/);

    /*
     * Italic: *text*
     */
    const italicMatch = remaining.match(
      /(^|[^*])\*([^*\n]+)\*(?!\*)/
    );

    const matches = [
      boldMatch
        ? {
            index: boldMatch.index ?? Infinity,
            type: "bold",
            match: boldMatch,
          }
        : null,
      codeMatch
        ? {
            index: codeMatch.index ?? Infinity,
            type: "code",
            match: codeMatch,
          }
        : null,
      italicMatch
        ? {
            index:
              (italicMatch.index ?? Infinity) +
              (italicMatch[1]?.length ?? 0),
            type: "italic",
            match: italicMatch,
          }
        : null,
    ].filter(Boolean) as {
      index: number;
      type: string;
      match: RegExpMatchArray;
    }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.index - b.index);

    const first = matches[0];

    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === "bold") {
      parts.push(
        <strong key={key++} className="font-semibold text-ink">
          {first.match[1]}
        </strong>
      );

      remaining = remaining.slice(
        first.index + first.match[0].length
      );
    } else if (first.type === "code") {
      parts.push(
        <code
          key={key++}
          className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {first.match[1]}
        </code>
      );

      remaining = remaining.slice(
        first.index + first.match[0].length
      );
    } else {
      /*
       * For italic, the regex includes a possible preceding character.
       * Preserve it when necessary.
       */
      const full = first.match[0];
      const prefix = first.match[1] ?? "";
      const italicText = first.match[2] ?? "";

      if (prefix) {
        parts.push(prefix);
      }

      parts.push(
        <em key={key++}>{italicText}</em>
      );

      remaining = remaining.slice(
        first.index + full.length - prefix.length
      );
    }
  }

  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const elements: ReactNode[] = [];

  let unorderedList: string[] = [];
  let orderedList: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;

    const text = paragraph.join(" ").trim();

    if (text) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
          className="mb-4 last:mb-0"
        >
          {renderInlineMarkdown(text)}
        </p>
      );
    }

    paragraph = [];
  };

  const flushUnorderedList = () => {
    if (unorderedList.length === 0) return;

    elements.push(
      <ul
        key={`ul-${elements.length}`}
        className="mb-4 ml-5 list-disc space-y-1.5 last:mb-0"
      >
        {unorderedList.map((item, index) => (
          <li key={`ul-item-${index}`}>
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ul>
    );

    unorderedList = [];
  };

  const flushOrderedList = () => {
    if (orderedList.length === 0) return;

    elements.push(
      <ol
        key={`ol-${elements.length}`}
        className="mb-4 ml-5 list-decimal space-y-1.5 last:mb-0"
      >
        {orderedList.map((item, index) => (
          <li key={`ol-item-${index}`}>
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ol>
    );

    orderedList = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    /*
     * Empty line
     */
    if (!line) {
      flushAll();
      return;
    }

    /*
     * Horizontal rule
     */
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushAll();

      elements.push(
        <hr
          key={`hr-${elements.length}`}
          className="my-6 border-0 border-t border-ink/10"
        />
      );

      return;
    }

    /*
     * H1
     */
    if (line.startsWith("# ")) {
      flushAll();

      elements.push(
        <h2
          key={`h1-${elements.length}`}
          className="mb-3 mt-6 font-display text-2xl leading-tight first:mt-0"
        >
          {renderInlineMarkdown(line.slice(2).trim())}
        </h2>
      );

      return;
    }

    /*
     * H2
     */
    if (line.startsWith("## ")) {
      flushAll();

      elements.push(
        <h3
          key={`h2-${elements.length}`}
          className="mb-3 mt-6 font-display text-xl leading-tight first:mt-0"
        >
          {renderInlineMarkdown(line.slice(3).trim())}
        </h3>
      );

      return;
    }

    /*
     * H3
     */
    if (line.startsWith("### ")) {
      flushAll();

      elements.push(
        <h4
          key={`h3-${elements.length}`}
          className="mb-2 mt-5 text-base font-semibold leading-tight first:mt-0"
        >
          {renderInlineMarkdown(line.slice(4).trim())}
        </h4>
      );

      return;
    }

    /*
     * H4/H5/H6
     */
    if (/^#{4,6}\s/.test(line)) {
      flushAll();

      const heading = line.replace(/^#{4,6}\s+/, "");

      elements.push(
        <h4
          key={`heading-${elements.length}`}
          className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide first:mt-0"
        >
          {renderInlineMarkdown(heading)}
        </h4>
      );

      return;
    }

    /*
     * Unordered list
     *
     * Supports:
     * - item
     * * item
     * + item
     */
    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);

    if (unorderedMatch) {
      flushParagraph();
      flushOrderedList();

      unorderedList.push(unorderedMatch[1]);
      return;
    }

    /*
     * Ordered list
     *
     * Supports:
     * 1. item
     * 2. item
     */
    const orderedMatch = line.match(/^\d+[.)]\s+(.*)$/);

    if (orderedMatch) {
      flushParagraph();
      flushUnorderedList();

      orderedList.push(orderedMatch[1]);
      return;
    }

    /*
     * Blockquote
     */
    if (line.startsWith("> ")) {
      flushAll();

      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="mb-4 border-l-2 border-board/30 pl-4 italic text-ink/70"
        >
          {renderInlineMarkdown(line.slice(2).trim())}
        </blockquote>
      );

      return;
    }

    /*
     * Normal text
     */
    flushUnorderedList();
    flushOrderedList();

    paragraph.push(line);
  });

  flushAll();

  return (
    <div className="text-sm leading-7 text-ink sm:text-base">
      {elements}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function AiMentorPage() {
  const params = useParams<{ id: string }>();

  const mentorId =
    typeof params.id === "string" ? params.id : "";

  const mentor = useMemo(
    () =>
      virtualMentors.find(
        (item) =>
          String(item.id).trim().toLowerCase() ===
          mentorId.trim().toLowerCase()
      ),
    [mentorId]
  );

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  /*
   * This ref prevents duplicate submissions.
   *
   * React state updates are asynchronous. If the user clicks Send twice
   * very quickly, `isLoading` may still be false during the second click.
   * The ref blocks that race condition immediately.
   */
  const submittingRef = useRef(false);

  /* ---------------------------------------------------------------------- */
  /* MENTOR NOT FOUND                                                       */
  /* ---------------------------------------------------------------------- */

  if (!mentor) {
    return (
      <main className="min-h-screen bg-paper px-6 py-20 text-ink">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/mentors"
            className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"
          >
            ← Back to mentors
          </Link>

          <h1 className="font-display mt-8 text-3xl">
            Mentor not found
          </h1>

          <p className="mt-3 text-ink/60">
            This mentor profile doesn't exist.
          </p>
        </div>
      </main>
    );
  }

  const currentMentor = mentor;

  /* ---------------------------------------------------------------------- */
  /* INITIAL MESSAGE                                                        */
  /* ---------------------------------------------------------------------- */

  const displayedMessages: Message[] =
    messages.length > 0
      ? messages
      : [
          {
            id: 1,
            role: "mentor",
            content: `Hi, I'm ${currentMentor.name}. I'm here to help you with ${currentMentor.profession.toLowerCase()} and your career journey. What are you trying to figure out?`,
          },
        ];

  /* ---------------------------------------------------------------------- */
  /* SEND MESSAGE                                                           */
  /* ---------------------------------------------------------------------- */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /*
     * Immediately stop duplicate requests.
     */
    if (submittingRef.current) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    submittingRef.current = true;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const updatedMessages = [
      ...displayedMessages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/ai-mentor/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mentorId: currentMentor.id,
            messages: updatedMessages.map((item) => ({
              role:
                item.role === "mentor"
                  ? "assistant"
                  : "user",
              content: item.content,
            })),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "The mentor could not respond. Please try again."
        );
      }

      if (
        !data?.reply ||
        typeof data.reply !== "string"
      ) {
        throw new Error(
          "The mentor returned an empty response. Please try again."
        );
      }

      const mentorReply: Message = {
        id: Date.now() + 1,
        role: "mentor",
        content: data.reply,
      };

      setMessages((current) => [
        ...current,
        mentorReply,
      ]);
    } catch (submitError) {
      console.error(
        "Mentor chat error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-8 sm:py-12">

        {/* ---------------------------------------------------------------- */}
        {/* BACK                                                              */}
        {/* ---------------------------------------------------------------- */}

        <Link
          href="/mentors"
          className="mb-8 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"
        >
          ← Back to mentors
        </Link>

        {/* ---------------------------------------------------------------- */}
        {/* MENTOR HEADER                                                     */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-8 flex items-center gap-5 border-b border-ink/10 pb-8 sm:gap-7">

          {/* PROFILE IMAGE */}

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-board/10 sm:h-24 sm:w-24">
            {currentMentor.image ? (
              <img
                src={currentMentor.image}
                alt={`${currentMentor.name} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl text-board">
                {currentMentor.name.charAt(0)}
              </span>
            )}
          </div>

          {/* MENTOR INFORMATION */}

          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              {currentMentor.name}
            </h1>

            <p className="mt-1 text-base text-ink/60 sm:text-lg">
              {currentMentor.profession}
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70 sm:text-base">
              {currentMentor.bio}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CHAT                                                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="flex flex-1 flex-col">

          {/* MESSAGES */}

          <div className="flex flex-1 flex-col gap-4 pb-8">

            {displayedMessages.map((item) => {
              const isUser =
                item.role === "user";

              return (
                <div
                  key={item.id}
                  className={
                    isUser
                      ? "ml-auto max-w-[90%] rounded-sm bg-board px-5 py-4 text-white sm:max-w-[80%]"
                      : "mr-auto max-w-[95%] rounded-sm border border-ink/10 bg-white px-5 py-4 text-ink sm:max-w-[90%]"
                  }
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 sm:text-base">
                      {item.content}
                    </p>
                  ) : (
                    <MarkdownMessage
                      content={item.content}
                    />
                  )}
                </div>
              );
            })}

            {/* ------------------------------------------------------------ */}
            {/* LOADING                                                       */}
            {/* ------------------------------------------------------------ */}

            {isLoading && (
              <div className="mr-auto rounded-sm border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60">
                <div className="flex items-center gap-2">
                  <span>
                    {currentMentor.name.split(" ")[0]} is
                    thinking
                  </span>

                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40" />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40"
                      style={{
                        animationDelay: "150ms",
                      }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40"
                      style={{
                        animationDelay: "300ms",
                      }}
                    />
                  </span>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ERROR                                                         */}
            {/* ------------------------------------------------------------ */}

            {error && (
              <div className="mr-auto max-w-[95%] rounded-sm border border-red-200 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-700">
                <p className="font-medium">
                  The mentor could not respond.
                </p>

                <p className="mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="mt-3 text-xs font-semibold uppercase tracking-wide text-red-700 underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* INPUT                                                             */}
          {/* ---------------------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 border-t border-ink/10 bg-paper pt-5"
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                disabled={isLoading}
                placeholder={`Ask ${currentMentor.name.split(" ")[0]} anything...`}
                autoComplete="off"
                onKeyDown={(event) => {
                  /*
                   * Enter submits naturally through the form.
                   *
                   * Explicitly prevent accidental duplicate submission
                   * while loading.
                   */
                  if (
                    event.key === "Enter" &&
                    isLoading
                  ) {
                    event.preventDefault();
                  }
                }}
                className="input min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !message.trim() ||
                  submittingRef.current
                }
                className="shrink-0 rounded-sm bg-amber px-5 py-3 font-body text-sm font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Thinking..."
                  : "Send →"}
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-ink/40">
              This is an AI-powered virtual mentor.
              Guidance is for informational and career
              support purposes.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
