"use client";

/**
 * JAD AI, the study companion on document, SCORM and practice-quiz lessons.
 * (JAD: Mr. Job, Mr. Anthony and Dr. Philip, the founders of Social Work Consultancy.)
 *
 * Desktop: a floating panel docked to the right, alongside the lesson (no scrim, so
 * the learner can keep reading). Phone: a bottom sheet that can be dragged down to
 * close. Answers stream in; suggestion pills and a rotating "Try…" placeholder
 * (Tab fills it in) help learners who don't know what to ask.
 */
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  RotateCw,
  Square,
  SquarePen,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { JadMarkdown, stripMarkdown } from "./JadMarkdown";

type Role = "user" | "assistant";
type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  suggestions?: string[];
  feedback?: number | null;
  status?: "streaming" | "error";
  error?: string;
  question?: string; // for an assistant error: the question to retry
};
type JadState = {
  available: boolean;
  lesson_kind: "document" | "scorm" | "quiz";
  first_name: string;
  suggestions: string[];
  messages: ChatMessage[];
  max_message_chars: number;
};

const OPEN_KEY = "jad-open";

function readOpen() {
  try {
    return window.sessionStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
}
function writeOpen(open: boolean) {
  try {
    window.sessionStorage.setItem(OPEN_KEY, open ? "1" : "0");
  } catch {
    /* private mode: not remembered */
  }
}

/** The JAD mark: a small living orb in the brand's greens and gold. */
export function JadOrb({ size = 28, active = false }: { size?: number; active?: boolean }) {
  return (
    <span className="jad-orb" data-active={active || undefined} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5}>
        <path
          d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function JadAssistant({
  courseId,
  itemId,
  lessonTitle,
  questionId,
  launcher = "floating",
  open: controlledOpen,
  onOpenChange,
  onAvailable,
}: {
  courseId: string;
  itemId: string;
  lessonTitle: string;
  /** The practice-quiz question on screen. */
  questionId?: string | null;
  /** "none" when the page shows its own button (e.g. in the quiz bar). */
  launcher?: "floating" | "none";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAvailable?: (available: boolean) => void;
}) {
  const base = `/api/proxy/jad-ai/courses/${courseId}/items/${itemId}`;
  const [state, setState] = useState<JadState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const titleId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
      if (launcher === "floating") writeOpen(next);
    },
    [controlledOpen, onOpenChange, launcher],
  );

  // Load availability, starter questions and the chat so far. This also warms the
  // lesson up on the server, so the first answer is quick.
  useEffect(() => {
    let cancelled = false;
    fetch(base, { cache: "no-store" })
      .then(async (res) => (res.ok ? ((await res.json())?.data as JadState) : null))
      .catch(() => null)
      .then((data) => {
        if (cancelled) return;
        const usable = Boolean(data?.available);
        onAvailable?.(usable);
        if (!data || !usable) return;
        setState(data);
        setMessages(data.messages || []);
        if (launcher === "floating" && controlledOpen === undefined && readOpen()) setUncontrolledOpen(true);
      });
    return () => {
      cancelled = true;
    };
    // Only when the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Enter/exit: the panel stays mounted while it animates out along the way it came.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setPhase(open ? "open" : "closing");
  }
  useEffect(() => {
    if (phase !== "closing") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPhase("closed"), reduce ? 160 : 320);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (text: string, fromSuggestion = false) => {
      const question = text.trim();
      if (!question || streaming || !state) return;
      setNotice(null);
      setInput("");
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: question };
      const pendingId = `a-${Date.now()}`;
      setMessages((prev) => [
        ...prev.filter((m) => m.status !== "error"),
        userMsg,
        { id: pendingId, role: "assistant", content: "", status: "streaming" },
      ]);
      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;
      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === pendingId ? fn(m) : m)));
      const fail = (error: string) =>
        patch((m) => ({ ...m, status: "error", error, question, content: m.content }));

      try {
        const res = await fetch(`${base}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, question_id: questionId || undefined, from_suggestion: fromSuggestion }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          const message =
            res.status === 429
              ? data?.message || "You've reached JAD AI's limit for now."
              : data?.message || "JAD AI couldn't answer just now. Please try again.";
          setMessages((prev) => prev.filter((m) => m.id !== pendingId && m.id !== userMsg.id));
          setInput(question);
          setNotice(message);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finished = false;
        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let cut: number;
          while ((cut = buffer.indexOf("\n\n")) !== -1) {
            const block = buffer.slice(0, cut);
            buffer = buffer.slice(cut + 2);
            const name = /^event: (.+)$/m.exec(block)?.[1];
            const raw = /^data: (.+)$/m.exec(block)?.[1];
            if (!name || !raw) continue;
            const data = JSON.parse(raw);
            if (name === "delta") patch((m) => ({ ...m, content: m.content + data.t }));
            else if (name === "replace") patch((m) => ({ ...m, content: data.t }));
            else if (name === "error") {
              fail(data.message);
              finished = true;
            } else if (name === "done") {
              patch((m) => ({ ...m, id: data.message_id, status: undefined, suggestions: data.suggestions || [] }));
              setAnnounce("JAD AI answered.");
              finished = true;
            }
          }
        }
        if (!finished) fail("The answer was cut off. Please try again.");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          patch((m) => ({ ...m, status: undefined, content: m.content || "Stopped." }));
        } else {
          fail("JAD AI couldn't be reached. Check your connection and try again.");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [base, questionId, state, streaming],
  );

  const stop = () => abortRef.current?.abort();

  const newChat = async () => {
    if (streaming) stop();
    setMessages([]);
    setNotice(null);
    await fetch(`${base}/messages`, { method: "DELETE" }).catch(() => undefined);
  };

  const rate = (id: string, helpful: boolean) => {
    const want = helpful ? 1 : -1;
    // Tapping the same rating again clears it.
    const next = messages.find((m) => m.id === id)?.feedback === want ? null : want;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, feedback: next } : m)));
    void fetch(`/api/proxy/jad-ai/messages/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful: next === null ? null : next === 1 }),
    }).catch(() => undefined);
  };

  if (!state) return null;

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && !m.status);
  const pills =
    messages.length === 0
      ? state.suggestions
      : lastAssistant?.suggestions?.length
        ? lastAssistant.suggestions
        : [];

  return (
    <>
      {launcher === "floating" && (
        <button
          type="button"
          className="jad-launch"
          data-hidden={phase !== "closed" || undefined}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <JadOrb size={30} />
          <span>Ask JAD</span>
        </button>
      )}
      {phase !== "closed" &&
        createPortal(
          <JadPanel
            phase={phase}
            titleId={titleId}
            state={state}
            lessonTitle={lessonTitle}
            messages={messages}
            pills={pills}
            input={input}
            setInput={setInput}
            streaming={streaming}
            notice={notice}
            onAsk={ask}
            onStop={stop}
            onNewChat={newChat}
            onRate={rate}
            onClose={() => setOpen(false)}
            floating={launcher === "floating"}
          />,
          document.querySelector(".lms-root") ?? document.body,
        )}
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </>
  );
}

function JadPanel({
  phase,
  titleId,
  state,
  lessonTitle,
  messages,
  pills,
  input,
  setInput,
  streaming,
  notice,
  onAsk,
  onStop,
  onNewChat,
  onRate,
  onClose,
  floating,
}: {
  phase: "open" | "closing";
  titleId: string;
  state: JadState;
  lessonTitle: string;
  messages: ChatMessage[];
  pills: string[];
  input: string;
  setInput: (v: string) => void;
  streaming: boolean;
  notice: string | null;
  onAsk: (text: string, fromSuggestion?: boolean) => void;
  onStop: () => void;
  onNewChat: () => void;
  onRate: (id: string, helpful: boolean) => void;
  onClose: () => void;
  floating: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const stickRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [ghostIndex, setGhostIndex] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  // After the entrance animation ends, transforms belong to the drag gesture.
  const [settled, setSettled] = useState(false);
  const dragRef = useRef<{ startY: number; samples: { y: number; t: number }[] } | null>(null);

  const ghosts = state.suggestions.length ? state.suggestions : ["Explain the key ideas simply"];
  const ghost = ghosts[ghostIndex % ghosts.length];

  // Rotate the "Try…" placeholder while the box is empty.
  useEffect(() => {
    if (input || streaming) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setGhostIndex((i) => i + 1), 4200);
    return () => window.clearInterval(timer);
  }, [input, streaming]);

  // Escape closes; focus the box when the panel opens on a desktop.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      // Only when focus is in the panel (or nowhere), so other dialogs keep their Escape.
      const active = document.activeElement;
      if (e.key === "Escape" && (panelRef.current?.contains(active) || active === document.body)) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  // Stay pinned to the newest text while it streams, unless the learner scrolled up.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
  };
  const jump = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // Grow the box with its text, up to a few lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);

  const submit = () => {
    if (!input.trim()) return;
    stickRef.current = true;
    onAsk(input);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === "Tab" && !e.shiftKey && !input && ghost) {
      e.preventDefault();
      setInput(ghost);
    }
  };

  // Phone sheet: drag the handle down to close, 1:1 with the finger; a flick or a
  // drag past a third of the sheet closes it, anything less springs back.
  const onDragStart = (e: ReactPointerEvent) => {
    if (window.matchMedia("(min-width: 768px)").matches || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return; // header buttons stay tappable
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; tracking still works without it */
    }
    dragRef.current = { startY: e.clientY, samples: [{ y: e.clientY, t: performance.now() }] };
  };
  const onDragMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    d.samples = [...d.samples.slice(-4), { y: e.clientY, t: performance.now() }];
    // Upward pulls resist, like a rubber band.
    setDrag(dy >= 0 ? dy : -Math.sqrt(-dy) * 2);
  };
  const onDragEnd = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const velocity = (last.y - first.y) / Math.max(last.t - first.t, 1); // px/ms
    const height = panelRef.current?.offsetHeight || 600;
    const projected = (drag ?? 0) + velocity * 180;
    setDrag(null);
    if (projected > height / 3 || velocity > 0.7) onClose();
  };

  const empty = messages.length === 0;
  const kindLabel = state.lesson_kind === "quiz" ? "this question" : "this lesson";

  return (
    <>
      <div className="jad-scrim" data-phase={phase} onClick={onClose} aria-hidden="true" />
      <section
        ref={panelRef}
        className="jad-panel"
        data-phase={phase}
        data-floating={floating || undefined}
        data-dragging={drag !== null || undefined}
        data-settled={settled || undefined}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && phase === "open") setSettled(true);
        }}
        style={drag !== null ? { transform: `translateY(${drag}px)` } : undefined}
        role="dialog"
        aria-labelledby={titleId}
      >
        <div
          className="jad-grab"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span className="jad-grabber" aria-hidden="true" />
          <header className="jad-head">
            <JadOrb size={32} active={streaming} />
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="jad-title">
                JAD AI
              </h2>
              <p className="jad-sub" title={lessonTitle}>
                {lessonTitle}
              </p>
            </div>
            <button
              type="button"
              className="jad-icon"
              onClick={onNewChat}
              disabled={empty && !streaming}
              aria-label="New chat"
              title="New chat"
            >
              <SquarePen aria-hidden="true" />
            </button>
            <button type="button" className="jad-icon" onClick={onClose} aria-label="Close JAD AI" title="Close (Esc)">
              <X aria-hidden="true" />
            </button>
          </header>
        </div>

        <div ref={scrollRef} className="jad-scroll" onScroll={onScroll}>
          {empty ? (
            <div className="jad-hello">
              <JadOrb size={56} />
              <h3>
                Hi {state.first_name}, <span>how can I help?</span>
              </h3>
              <p>
                Ask me anything about {kindLabel}. I can explain ideas, give examples from practice, summarise or quiz
                you.
              </p>
            </div>
          ) : (
            <ol className="jad-thread" aria-label="Conversation">
              {messages.map((m) =>
                m.role === "user" ? (
                  <li key={m.id} className="jad-msg jad-msg--user">
                    <p>{m.content}</p>
                  </li>
                ) : (
                  <AssistantMessage key={m.id} message={m} onRate={onRate} onRetry={(q) => onAsk(q)} />
                ),
              )}
            </ol>
          )}
        </div>

        <footer className="jad-foot">
          {showJump && (
            <button type="button" className="jad-jump" onClick={jump} aria-label="Jump to latest">
              <ArrowDown aria-hidden="true" />
            </button>
          )}
          {pills.length > 0 && !streaming && (
            <div className="jad-pills" role="list" aria-label="Suggested questions">
              {pills.map((p) => (
                <button key={p} type="button" role="listitem" className="jad-pill" onClick={() => onAsk(p, true)}>
                  {p}
                </button>
              ))}
            </div>
          )}
          {notice && (
            <p className="jad-notice" role="alert">
              {notice}
            </p>
          )}
          <form
            className="jad-compose"
            data-busy={streaming || undefined}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="jad-field">
              {!input && (
                <span className="jad-ghost" aria-hidden="true" key={ghost}>
                  <span className="jad-ghost-text">{streaming ? "JAD is answering…" : `Try “${ghost}”`}</span>
                  {!streaming && <kbd>Tab</kbd>}
                </span>
              )}
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={state.max_message_chars}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Ask JAD AI"
                enterKeyHint="send"
              />
            </div>
            {streaming ? (
              <button type="button" className="jad-send jad-send--stop" onClick={onStop} aria-label="Stop answering">
                <Square aria-hidden="true" />
              </button>
            ) : (
              <button type="submit" className="jad-send" disabled={!input.trim()} aria-label="Send">
                <ArrowUp aria-hidden="true" />
              </button>
            )}
          </form>
          <p className="jad-fine">JAD AI can make mistakes. Check important points against your lesson.</p>
        </footer>
      </section>
    </>
  );
}

function AssistantMessage({
  message,
  onRate,
  onRetry,
}: {
  message: ChatMessage;
  onRate: (id: string, helpful: boolean) => void;
  onRetry: (question: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const thinking = message.status === "streaming" && !message.content;
  const settled = !message.status && !message.id.startsWith("a-");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(message.content));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <li className="jad-msg jad-msg--ai" data-streaming={message.status === "streaming" || undefined}>
      {thinking ? (
        <p className="jad-thinking">Thinking</p>
      ) : (
        message.content && <JadMarkdown text={message.content} />
      )}
      {message.status === "error" && (
        <div className="jad-error">
          <span>{message.error}</span>
          {message.question && (
            <button type="button" onClick={() => onRetry(message.question!)}>
              <RotateCw aria-hidden="true" /> Try again
            </button>
          )}
        </div>
      )}
      {settled && (
        <div className="jad-actions">
          <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy answer"} title="Copy">
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => onRate(message.id, true)}
            aria-label="Helpful"
            aria-pressed={message.feedback === 1}
            title="Helpful"
          >
            <ThumbsUp aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onRate(message.id, false)}
            aria-label="Not helpful"
            aria-pressed={message.feedback === -1}
            title="Not helpful"
          >
            <ThumbsDown aria-hidden="true" />
          </button>
        </div>
      )}
    </li>
  );
}
