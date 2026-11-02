export default function SectionHeading({
  id,
  eyebrow,
  title,
  align = "center",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  align?: "center" | "left";
  children?: React.ReactNode;
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "max-w-3xl mx-auto text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#2D6A4F] dark:text-[#52b788] mb-3 ${
          centered ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-6 bg-current" aria-hidden="true" />
        {eyebrow}
        {centered && (
          <span className="h-px w-6 bg-current" aria-hidden="true" />
        )}
      </p>
      <h2
        id={id}
        className="text-[2rem] sm:text-[2.5rem] lg:text-[2.9rem] font-bold leading-[1.08] tracking-[-0.03em] text-gray-900 dark:text-gray-50"
      >
        {title}
      </h2>
      {children && (
        <div className="mt-4 space-y-3 text-[0.98rem] leading-relaxed text-gray-600 dark:text-gray-400">
          {children}
        </div>
      )}
    </div>
  );
}
