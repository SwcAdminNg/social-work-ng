"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [whoWeAreOpen, setWhoWeAreOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div
        className="max-w-6xl mx-auto px-6 h-17 flex items-center gap-6"
        style={{ height: "68px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 no-underline"
          aria-label="Social Work Consultancy Home"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r="17"
              stroke="#2D6A4F"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="18" cy="12" r="4" fill="#2D6A4F" />
            <path
              d="M10 28c0-4.418 3.582-8 8-8s8 3.582 8 8"
              stroke="#2D6A4F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M14 16c-2 1-4 2.5-4 5"
              stroke="#F4A261"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M22 16c2 1 4 2.5 4 5"
              stroke="#F4A261"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-extrabold tracking-wide text-gray-900 dark:text-gray-100">
              SOCIAL WORK
            </span>
            <span className="text-[10px] font-medium tracking-widest text-gray-500 dark:text-gray-400">
              CONSULTANCY LTD.
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0 flex-1 justify-center">
          <li
            className="relative group"
            onMouseEnter={() => setWhoWeAreOpen(true)}
            onMouseLeave={() => setWhoWeAreOpen(false)}
          >
            <button
              onClick={() => setWhoWeAreOpen((v) => !v)}
              aria-expanded={whoWeAreOpen}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 rounded-md transition-colors cursor-pointer bg-transparent border-0 outline-none"
            >
              Who We Are
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200"
                style={{
                  transform: whoWeAreOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M3 5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ul
              className={`absolute top-full left-0 min-w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 list-none m-0 z-50 transition-all duration-200 origin-top ${
                whoWeAreOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
              }`}
            >
              {["Our Story", "Our Team", "Our Mission"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="block px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-lg no-underline transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {["Our Courses", "Mentorship", "Resources", "Contact Us"].map(
            (item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 rounded-md transition-colors no-underline whitespace-nowrap"
                >
                  {item}
                </Link>
              </li>
            ),
          )}
        </ul>

        {/* Login — desktop */}
        <Link
          href="#"
          className="hidden lg:inline-flex items-center justify-center px-5 py-2 bg-[#2D6A4F] text-white text-sm font-semibold rounded-full no-underline hover:bg-[#1e4d38] transition-colors shadow-sm flex-shrink-0"
        >
          Login
        </Link>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="lg:hidden ml-auto flex flex-col justify-center gap-[5px] w-9 h-9 bg-transparent border-0 cursor-pointer p-1 rounded-md transition-colors"
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
        className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${menuOpen ? "max-h-[500px]" : "max-h-0"}`}
        aria-hidden={!menuOpen}
      >
        <ul className="list-none m-0 px-6 py-3 pb-5 flex flex-col gap-1">
          <li>
            <button
              onClick={() => setWhoWeAreOpen(!whoWeAreOpen)}
              className="w-full flex items-center justify-between py-3 text-base font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors"
            >
              Who We Are
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200"
                style={{
                  transform: whoWeAreOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <path
                  d="M3 5l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ul
              className={`list-none pl-4 m-0 overflow-hidden transition-all duration-300 ${whoWeAreOpen ? "max-h-40 py-1" : "max-h-0 py-0"}`}
            >
              {["Our Story", "Our Team", "Our Mission"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="block py-2 px-2 text-sm text-gray-500 dark:text-gray-400 no-underline rounded transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          {["Our Courses", "Mentorship", "Resources", "Contact Us"].map(
            (item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="block py-3 text-base font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 no-underline transition-colors"
                >
                  {item}
                </Link>
              </li>
            ),
          )}
          <li className="mt-3">
            <Link
              href="#"
              className="block text-center py-3 px-4 bg-[#2D6A4F] text-white font-semibold rounded-full no-underline hover:bg-[#1e4d38] transition-colors"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
