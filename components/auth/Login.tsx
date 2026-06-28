"use client";

import { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconEyeOpen() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="2 6 5 9 10 3" />
    </svg>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  icon,
  suffix,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Icon */}
      <span
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-150 ${
          focused
            ? "text-[#2D6A4F] dark:text-[#52b788]"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {icon}
      </span>

      {/* Input */}
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={`
          peer w-full h-[54px] pl-11 pr-${suffix ? "11" : "4"} pt-5 pb-1
          rounded-xl border bg-white dark:bg-white/5
          text-[0.9rem] text-gray-900 dark:text-white
          outline-none transition-all duration-150
          placeholder-transparent
          ${
            focused
              ? "border-[#2D6A4F] dark:border-[#52b788] shadow-[0_0_0_3px_rgba(45,106,79,0.12)] dark:shadow-[0_0_0_3px_rgba(82,183,136,0.12)]"
              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
          }
        `}
      />

      {/* Floating label */}
      <label
        htmlFor={id}
        className={`
          absolute left-11 transition-all duration-150 pointer-events-none select-none
          ${
            lifted
              ? "top-[9px] text-[0.65rem] font-semibold tracking-wide text-[#2D6A4F] dark:text-[#52b788]"
              : "top-1/2 -translate-y-1/2 text-[0.88rem] text-gray-400 dark:text-gray-500"
          }
        `}
      >
        {label}
      </label>

      {/* Suffix (show/hide toggle) */}
      {suffix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate async login
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="min-h-screen flex bg-[#f0f7f4] dark:bg-[#0a0a0a]">
      {/* ══════════════════════════════════════════
          LEFT PANEL — image + brand overlay
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-shrink-0">
        {/* Photo */}
        <img
          src="/images/auth/social-work.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0";
          }}
        />

        {/* Fallback gradient (shows if image 404s) */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(145deg, #0d2b1e 0%, #1a4d35 35%, #2D6A4F 65%, #52b788 100%)",
          }}
          aria-hidden="true"
        >
          {/* Geometric ring decoration */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            viewBox="0 0 600 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <circle cx="480" cy="160" r="220" stroke="white" strokeWidth="1" />
            <circle cx="480" cy="160" r="150" stroke="white" strokeWidth="1" />
            <circle cx="480" cy="160" r="80" stroke="white" strokeWidth="1" />
            <circle cx="80" cy="680" r="180" stroke="white" strokeWidth="1" />
            <circle cx="80" cy="680" r="110" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        {/* Dark scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#071410]/90 via-[#071410]/40 to-[#071410]/20"
          aria-hidden="true"
        />
        {/* Content overlaid on image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3 no-underline w-fit group"
            aria-label="Social Work Nigeria home"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors duration-200">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-[0.95rem] leading-tight">
                Social Work Nigeria
              </p>
              <p className="text-white/50 text-[0.62rem] uppercase tracking-widest font-medium leading-tight">
                Consultancy
              </p>
            </div>
          </a>

          {/* Testimonial / mission quote */}
          <div className="max-w-sm">
            {/* Decorative quote mark */}
            <svg
              width="36"
              height="28"
              viewBox="0 0 36 28"
              fill="none"
              aria-hidden="true"
              className="mb-4 opacity-60"
            >
              <path
                d="M0 28V17.6C0 13.013 1.173 9.12 3.52 5.92 5.92 2.72 9.44.853 14.08 0L15.84 3.04C12.8 3.893 10.507 5.387 8.96 7.52 7.413 9.6 6.64 12 6.64 14.72h7.04V28H0zm20.16 0V17.6c0-4.587 1.173-8.48 3.52-11.68C26.08 2.72 29.6.853 34.24 0L36 3.04c-3.04.853-5.333 2.347-6.88 4.48C27.573 9.6 26.8 12 26.8 14.72h7.04V28H20.16z"
                fill="white"
              />
            </svg>

            <blockquote className="text-white text-[1.15rem] leading-relaxed font-medium mb-5">
              "Empowering social workers with knowledge and skills to build
              stronger communities across Nigeria."
            </blockquote>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {["4,200+ Trained", "18 Courses", "12 States"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-[0.72rem] font-semibold"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#52b788]"
                    aria-hidden="true"
                  />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — login form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[420px]">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-bold text-[0.95rem] leading-tight">
                Social Work Nigeria
              </p>
              <p className="text-[#2D6A4F] dark:text-[#52b788] text-[0.62rem] uppercase tracking-widest font-semibold leading-tight">
                Consultancy
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#2D6A4F] dark:text-[#52b788] mb-2">
              Welcome back
            </p>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-2">
              Sign in to your account
            </h1>
            <p className="text-[0.87rem] text-gray-500 dark:text-gray-400">
              Continue your learning journey with Social Work Nigeria.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <FloatingInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              icon={<IconMail />}
              autoComplete="email"
            />

            {/* Password */}
            <FloatingInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              icon={<IconLock />}
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-gray-400 dark:text-gray-500 hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:focus-visible:ring-[#52b788] rounded p-0.5"
                >
                  {showPassword ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
              }
            />

            {/* Keep me logged in + Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              {/* Custom checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={keepLoggedIn}
                  onClick={() => setKeepLoggedIn((v) => !v)}
                  className={`
                    w-[18px] h-[18px] flex-shrink-0 rounded-[5px] border-2 flex items-center justify-center
                    transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:focus-visible:ring-[#52b788] focus-visible:ring-offset-1
                    ${
                      keepLoggedIn
                        ? "bg-[#2D6A4F] border-[#2D6A4F] dark:bg-[#2D6A4F] dark:border-[#2D6A4F]"
                        : "bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 group-hover:border-[#2D6A4F] dark:group-hover:border-[#52b788]"
                    }
                  `}
                >
                  {keepLoggedIn && <IconCheck />}
                </button>
                <span className="text-[0.83rem] text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-150">
                  Keep me logged in
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-[0.83rem] font-semibold text-[#2D6A4F] dark:text-[#52b788] hover:text-[#1e4d38] dark:hover:text-white no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:focus-visible:ring-[#52b788] rounded"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                relative mt-2 w-full h-[52px] rounded-xl font-bold text-[0.93rem] text-white
                bg-[#2D6A4F] hover:bg-[#1e4d38] dark:hover:bg-[#3d8c68]
                shadow-lg shadow-green-900/20 hover:shadow-green-900/30
                transition-all duration-200 hover:-translate-y-0.5
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0
                overflow-hidden
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  {/* Spinner */}
                  <svg
                    className="animate-spin w-4 h-4 text-white/80"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6" aria-hidden="true">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
            <span className="text-[0.75rem] text-gray-400 dark:text-gray-600 font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
          </div>

          {/* Register link */}
          <p className="text-center text-[0.85rem] text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-[#2D6A4F] dark:text-[#52b788] hover:text-[#1e4d38] dark:hover:text-white no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:focus-visible:ring-[#52b788] rounded"
            >
              Create an account
            </a>
          </p>

          {/* Footer note */}
          <p className="mt-10 text-center text-[0.72rem] text-gray-400 dark:text-gray-600 leading-relaxed">
            By signing in, you agree to our{" "}
            <a
              href="/terms-of-service"
              className="underline hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition-colors duration-150"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="underline hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition-colors duration-150"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
