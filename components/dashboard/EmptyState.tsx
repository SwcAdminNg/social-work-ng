export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType;
  title: string;
  description: string;
}) {
  return (
    <div className="lms-card flex flex-col items-center justify-center gap-3 p-10 text-center sm:p-16">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-mint text-accent [&_svg]:h-6 [&_svg]:w-6 dark:bg-white/[0.07]">
        <Icon />
      </div>
      <h2 className="sw-title m-0 mt-1 text-[1.3rem] text-ink">{title}</h2>
      <p className="m-0 max-w-sm text-[0.95rem] leading-relaxed text-ink-2">
        {description}
      </p>
    </div>
  );
}
