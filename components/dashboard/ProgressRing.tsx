import type { ReactNode } from "react";

/** A circular progress meter; children sit in the middle. */
export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  className = "",
  children,
}: {
  /** 0 to 100. */
  value: number;
  size?: number;
  stroke?: number;
  /** Accessible name, e.g. "Course progress". */
  label: string;
  className?: string;
  children?: ReactNode;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`relative inline-grid flex-none place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className="lms-ring absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className="relative grid place-items-center">{children}</span>
    </span>
  );
}
