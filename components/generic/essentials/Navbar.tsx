"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/55 dark:bg-gray-900/55 backdrop-blur-xl backdrop-saturate-150 border-b border-white/30 dark:border-gray-700/40 shadow-[0_1px_20px_-4px_rgba(0,0,0,0.08)]">
      <div
        className="max-w-6xl mx-auto px-6 flex items-center gap-6"
        style={{ height: "84px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center flex-shrink-0 no-underline"
          aria-label="Social Work Consultancy Home"
        >
          <img
            src="/images/home/SWC-Logo.webp"
            alt="SWC Logo"
            width={151}
            height={40}
            className="w-[120px] md:w-[151px] h-auto object-contain dark:bg-white/95 dark:rounded-md dark:p-1.5 dark:shadow-none"
          />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0 flex-1 justify-center">
          {[
            { name: "Our Courses", href: "/courses" },
            { name: "Mentorship", href: "/mentorship" },
            { name: "About Us", href: "/about-us" },
            { name: "Pricing", href: "/pricing" },
            { name: "Resources", href: "/resources" },
            { name: "Contact Us", href: "/contact" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors no-underline whitespace-nowrap group hover:bg-white/60 dark:hover:bg-gray-800/60 ${
                    isActive
                      ? "text-[#2D6A4F] dark:text-[#52b788]"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {item.name}
                  {/* Modern Animated Underline */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[#2D6A4F] dark:bg-[#52b788] transition-all duration-300 ${
                      isActive
                        ? "w-[60%] opacity-100"
                        : "w-0 opacity-0 group-hover:w-[30%] group-hover:opacity-40"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Login/Dashboard — desktop */}
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="hidden lg:inline-flex items-center justify-center px-5 py-2 bg-[#2D6A4F] text-white text-sm font-semibold rounded-full no-underline hover:bg-[#1e4d38] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm flex-shrink-0"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="hidden lg:inline-flex items-center justify-center px-5 py-2 bg-[#2D6A4F] text-white text-sm font-semibold rounded-full no-underline hover:bg-[#1e4d38] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm flex-shrink-0"
          >
            Login
          </Link>
        )}

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="lg:hidden ml-auto flex flex-col justify-center gap-[5px] w-10 h-10 bg-transparent hover:bg-white/60 dark:hover:bg-gray-800/60 border-0 cursor-pointer p-1 rounded-full transition-colors"
        >
          <span
            className={`block w-[22px] h-[2px] bg-gray-800 dark:bg-gray-200 rounded transition-transform duration-200 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block w-[22px] h-[2px] bg-gray-800 dark:bg-gray-200 rounded transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-[22px] h-[2px] bg-gray-800 dark:bg-gray-200 rounded transition-transform duration-200 origin-center ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-white/30 dark:border-gray-700/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl ${menuOpen ? "max-h-[500px]" : "max-h-0"}`}
        aria-hidden={!menuOpen}
      >
        <ul className="list-none m-0 px-6 py-3 pb-5 flex flex-col gap-1">
          {[
            { name: "About Us", href: "/about-us" },
            { name: "Pricing", href: "/pricing" },
            { name: "Our Courses", href: "/courses" },
            { name: "Mentorship", href: "/mentorship" },
            { name: "Resources", href: "/resources" },
            { name: "Contact Us", href: "/contact" },
          ].map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-base font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 no-underline transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li className="mt-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="block text-center py-3 px-4 bg-[#2D6A4F] text-white font-semibold rounded-full no-underline hover:bg-[#1e4d38] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="block text-center py-3 px-4 bg-[#2D6A4F] text-white font-semibold rounded-full no-underline hover:bg-[#1e4d38] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
