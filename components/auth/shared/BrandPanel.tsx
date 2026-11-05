import Image from "next/image";
import Link from "next/link";

type AuthVariant = "login" | "register" | "forgot-password" | "reset-password";

type HomeStats = { total_number_of_students?: number; number_of_published_courses?: number } | null | undefined;

// SWCL photography of Nigerian social work learning settings (illustrative).
// Full-resolution copies (1672x941, high quality) served as-is so the photo stays sharp.
// `focus` keeps the people in frame when the landscape photo fills a tall panel.
const PANEL: Record<AuthVariant, { image: string; focus: string; alt: string; eyebrow: string; title: string; body: string }> = {
  login: {
    image: "/images/auth/learners-collaborate.webp",
    focus: "46% 40%",
    alt: "Three social work learners study case notes together at a table.",
    eyebrow: "Welcome back",
    title: "Pick up where you left off.",
    body: "Continue your courses, mentorship and practice resources from Social Work Consultancy Ltd.",
  },
  register: {
    image: "/images/auth/training-workshop.webp",
    focus: "50% 35%",
    alt: "A facilitator leads a small group discussion beside a flip chart.",
    eyebrow: "Join the learning platform",
    title: "Practical learning for social work in Nigeria and beyond.",
    body: "Create a free account to explore courses, save your progress and access learning resources.",
  },
  "forgot-password": {
    image: "/images/auth/reflective-notes.webp",
    focus: "62% 40%",
    alt: "A practitioner writes reflective notes at a wooden desk.",
    eyebrow: "Account recovery",
    title: "We will help you get back in.",
    body: "Enter the email on your account and we will send you a secure link to choose a new password.",
  },
  "reset-password": {
    image: "/images/auth/support-professional.webp",
    focus: "60% 30%",
    alt: "A support professional wearing a headset smiles at a desk.",
    eyebrow: "Secure your account",
    title: "Choose a strong new password.",
    body: "Use at least 8 characters. A longer passphrase is easier to remember and harder to guess.",
  },
};

export function BrandPanel({ variant = "login", statsData }: { variant?: AuthVariant; statsData?: HomeStats }) {
  const panel = PANEL[variant];
  // Only real figures from the API; nothing is shown when they are unavailable.
  const stats = [
    statsData?.total_number_of_students ? `${statsData.total_number_of_students.toLocaleString()} learners` : null,
    statsData?.number_of_published_courses
      ? `${statsData.number_of_published_courses.toLocaleString()} ${statsData.number_of_published_courses === 1 ? "course" : "courses"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <aside className="relative hidden lg:flex lg:w-[50%] xl:w-[52%] flex-shrink-0 overflow-hidden bg-[#0f3324]" aria-label="About the learning platform">
      <Image
        src={panel.image}
        alt={panel.alt}
        fill
        priority
        unoptimized
        sizes="52vw"
        className="object-cover"
        style={{ objectPosition: panel.focus }}
      />
      {/* Shade only behind the logo and the text, so the photo itself stays clear. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-36"
        style={{ background: "linear-gradient(180deg, rgba(6,24,16,0.5), rgba(6,24,16,0))" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{ background: "linear-gradient(0deg, rgba(6,24,16,0.92) 0%, rgba(6,24,16,0.7) 45%, rgba(6,24,16,0) 100%)" }}
      />
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
        <Link href="/" className="w-fit rounded-md" aria-label="Social Work Consultancy Ltd home">
          <Image src="/images/logo/swc-logo-on-dark.webp" alt="" width={480} height={133} className="h-auto w-[180px]" priority />
        </Link>

        <div className="max-w-md">
          <p className="mb-3 flex items-center gap-3 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#F3C56B]">
            <span aria-hidden="true" className="h-[2px] w-7 rounded bg-[#E5A61D]" />
            {panel.eyebrow}
          </p>
          <p className="text-[1.9rem] font-bold leading-tight tracking-tight text-white xl:text-[2.2rem]">{panel.title}</p>
          <p className="mt-4 text-[1rem] leading-relaxed text-white/80">{panel.body}</p>
          {stats.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Platform at a glance">
              {stats.map((stat) => (
                <li
                  key={stat}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[0.78rem] font-semibold text-white backdrop-blur-sm"
                >
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#74c69d]" />
                  {stat}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-[0.72rem] text-white/50">Illustrative image</p>
        </div>
      </div>
    </aside>
  );
}

/** Logo above the form on phones and tablets, in the colour that suits the theme. */
export function MobileBrandLogo() {
  return (
    <div className="mb-8 flex items-center lg:hidden">
      <Link href="/" className="rounded-md" aria-label="Social Work Consultancy Ltd home">
        <Image src="/images/logo/swc-logo-on-light.webp" alt="" width={480} height={133} className="h-auto w-[170px] dark:hidden" priority />
        <Image src="/images/logo/swc-logo-on-dark.webp" alt="" width={480} height={133} className="hidden h-auto w-[170px] dark:block" priority />
      </Link>
    </div>
  );
}
