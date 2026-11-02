import { Eyebrow, Reveal, WordReveal } from "./motion";

// Opening block of a section: label, display heading and optional intro.
export default function SectionHeading({
  id,
  eyebrow,
  title,
  align = "left",
  tone = "light",
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  align?: "center" | "left";
  // "light" sits on white or mint; "dark" on deep green.
  tone?: "light" | "dark";
  children?: React.ReactNode;
  className?: string;
}) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div
      className={`${centered ? "max-w-3xl mx-auto text-center" : "max-w-3xl"} ${className}`}
    >
      <Eyebrow
        tone={dark ? "gold" : "green"}
        className={`mb-5 ${centered ? "justify-center" : ""}`}
      >
        {eyebrow}
      </Eyebrow>
      <h2
        id={id}
        className={`t-h2 font-bold ${dark ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
      >
        <WordReveal text={title} />
      </h2>
      {children && (
        <Reveal
          from="up"
          delay={0.2}
          className={`mt-6 space-y-4 t-body ${
            dark ? "text-white/75" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {children}
        </Reveal>
      )}
    </div>
  );
}
