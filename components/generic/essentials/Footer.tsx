"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Mail, MapPin, Phone } from "lucide-react";

function IconFacebook() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTwitterX() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const serviceLinks = [
  { label: "E-Learning and Professional Development", href: "/e-learning" },
  { label: "Research and Evaluation", href: "/research-and-evaluation" },
  { label: "Policy and Advocacy", href: "/policy-and-advocacy" },
];

const exploreLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Partner With Us", href: "/partner-with-us" },
  { label: "Careers and Volunteering", href: "/careers-and-volunteering" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: <IconFacebook /> },
  { label: "X (Twitter)", href: "#", icon: <IconTwitterX /> },
  { label: "LinkedIn", href: "#", icon: <IconLinkedIn /> },
];

const contactItems = [
  {
    icon: <MapPin className="w-4 h-4" />,
    label: "Our office",
    value: "Flat C3, Okonkwo Estate, Jos, Plateau State, Nigeria.",
    href: undefined,
  },
  {
    icon: <Phone className="w-4 h-4" />,
    label: "Telephone",
    value: "+234 806 404 7702",
    href: "tel:+2348064047702",
  },
  {
    icon: <Mail className="w-4 h-4" />,
    label: "Email",
    value: "support@socialworknigeria.org",
    href: "mailto:support@socialworknigeria.org",
  },
];

function LinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-3" role="list">
      {links.map(({ label, href }) => (
        <li key={label}>
          <Link
            href={href}
            className="text-sm font-medium text-gray-600 dark:text-[#A3B3A9] hover:text-[#2D6A4F] dark:hover:text-[#95d5b2] transition-colors duration-200"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span
        className="w-4 h-px bg-[#2D6A4F] dark:bg-[#52b788]"
        aria-hidden="true"
      />
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#2D6A4F] dark:text-[#74c69d]">
        {children}
      </span>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative bg-white dark:bg-[#060f0a] border-t border-gray-100 dark:border-white/[0.06] overflow-hidden"
      aria-label="Site footer"
    >
      {/* Decorative Blur Blob */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#2D6A4F]/5 dark:bg-[#2D6A4F]/10 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.8fr_1.2fr] gap-12 lg:gap-10">
          {/* ── Column 1: Brand ── */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-3 no-underline w-fit group"
              aria-label="Social Work Consultancy Ltd home"
            >
              <img
                src="/images/logo/swc-dark-logo-trim.png"
                alt="Social Work Consultancy Ltd"
                width={1322}
                height={386}
                className="w-[150px] md:w-[158px] h-auto object-contain"
              />
            </Link>

            <p className="text-sm text-gray-500 dark:text-[#A3B3A9] leading-relaxed max-w-sm">
              Social Work Consultancy Ltd strengthens social work and social
              services through professional learning, research, policy and
              advocacy. We connect evidence, professional knowledge and local
              understanding to help individuals and organisations improve
              practice.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#16231C] text-gray-500 dark:text-[#A3B3A9] hover:text-white dark:hover:text-white hover:bg-[#2D6A4F] dark:hover:bg-[#52b788] transition-all duration-300 no-underline"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Column 2: Services ── */}
          <div>
            <SectionLabel>Services</SectionLabel>
            <LinkList links={serviceLinks} />
          </div>

          {/* ── Column 3: Explore SWCL ── */}
          <div>
            <SectionLabel>Explore SWCL</SectionLabel>
            <LinkList links={exploreLinks} />
          </div>

          {/* ── Column 4: Office ── */}
          <div>
            <SectionLabel>Get in touch</SectionLabel>
            <ul className="flex flex-col gap-5" role="list">
              {contactItems.map(({ icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3 group">
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#16231C] text-[#2D6A4F] dark:text-[#74c69d] group-hover:bg-[#2D6A4F] group-hover:text-white transition-colors duration-300">
                    {icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 dark:text-[#ECF2EE]0 font-bold mb-0.5">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium text-gray-700 dark:text-[#C3D1C8] hover:text-[#2D6A4F] dark:hover:text-[#95d5b2] transition-colors duration-200"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-gray-700 dark:text-[#C3D1C8]">
                        {value}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Professional learning ── */}
        <div className="mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl bg-[#14402F] dark:bg-[#0F2A20] px-6 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-[#EBA937]">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[#EBA937]">
                Professional learning
              </p>
              <p className="mt-1 text-sm text-white/85 leading-relaxed">
                Visit socialworknigeria.org, Social Work Consultancy
                Ltd.&rsquo;s dedicated learning platform.
              </p>
            </div>
          </div>
          <Link
            href="/courses"
            className="group inline-flex items-center justify-center gap-2 self-start sm:self-center px-5 py-2.5 rounded-full bg-[#EBA937] text-[#10291E] text-sm font-bold hover:bg-[#f3bb57] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14402F]"
          >
            Explore courses
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-500 dark:text-[#ECF2EE]0 text-center md:text-left">
            © {year} Social Work Consultancy Ltd. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/privacy-policy"
              className="text-gray-500 dark:text-[#ECF2EE]0 hover:text-[#2D6A4F] dark:hover:text-[#95d5b2] transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-gray-500 dark:text-[#ECF2EE]0 hover:text-[#2D6A4F] dark:hover:text-[#95d5b2] transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
