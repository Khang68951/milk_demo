"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Globe } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
}

const LANGUAGES = [
  "English",
  "Tiếng Việt",
  "日本語",
  "한국어",
];

export function AuthShell({ children }: AuthShellProps) {
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [langOpen]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#1D1F20]">
      {/* Cloudflare-style Top Bar */}
      <header className="flex h-[64px] w-full shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#1D1F20] hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images/logo-database.png"
            alt="Project A logo"
            width={28}
            height={28}
            className="h-[28px] w-[28px] object-contain"
            priority
          />
          <span className="text-[18px] font-semibold tracking-[-0.02em]">
            Project A
          </span>
        </Link>

        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((prev) => !prev)}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            className="flex h-[34px] items-center gap-1.5 rounded-[6px] border border-transparent px-2.5 text-[13px] font-medium text-[#374151] hover:border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <Globe className="h-[15px] w-[15px] text-[#6B7280]" strokeWidth={1.7} />
            <span>{language}</span>
            <ChevronDown
              className={`h-[14px] w-[14px] text-[#6B7280] transition-transform duration-150 ${
                langOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {langOpen && (
            <ul
              role="listbox"
              className="absolute right-0 top-[40px] z-30 w-[160px] rounded-[8px] border border-[#E5E7EB] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {LANGUAGES.map((lang) => {
                const selected = lang === language;
                return (
                  <li key={lang}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-[6px] px-2.5 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${
                        selected
                          ? "bg-[#FFF5EC] font-medium text-[#EE730A]"
                          : "text-[#374151] hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <span>{lang}</span>
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </header>

      {/* Main Centered Auth Column */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      {/* Cloudflare-style Minimal Footer */}
      <footer className="w-full shrink-0 border-t border-[#E5E7EB] bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-[#595959]">
          <Link href="/" className="hover:text-[#1D1F20] hover:underline">
            Support
          </Link>
          <span className="text-[#D1D5DB]" aria-hidden="true">
            |
          </span>
          <Link
            href="/dashboard"
            className="hover:text-[#1D1F20] hover:underline"
          >
            System Status
          </Link>
          <span className="text-[#D1D5DB]" aria-hidden="true">
            |
          </span>
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#1D1F20] hover:underline"
          >
            Terms of Use
          </a>
          <span className="text-[#D1D5DB]" aria-hidden="true">
            |
          </span>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="hover:text-[#1D1F20] hover:underline"
          >
            Privacy Policy
          </a>
          <span className="text-[#D1D5DB]" aria-hidden="true">
            |
          </span>
          <span>&copy; 2026 Project A, Inc.</span>
        </div>
      </footer>
    </div>
  );
}
