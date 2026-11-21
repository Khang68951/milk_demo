"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Circle, Eye, EyeOff, KeyRound } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function RegisterView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uiNotice, setUiNotice] = useState<string | null>(null);

  const passwordChecks = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains 1 number", met: /\d/.test(password) },
      {
        label: "Contains uppercase & lowercase letters",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      {
        label: "Contains 1 special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ],
    [password]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Connect registration API endpoint here
    setUiNotice(
      "UI preview mode — registration form submitted locally. Connect your backend sign-up API when ready."
    );
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#1D1F20]">
        Create your Project A account
      </h1>
      <p className="mt-1.5 text-[13.5px] font-normal text-[#595959]">
        Get started with shelf monitoring and store analytics in minutes.
      </p>

      {/* Social / SSO Buttons */}
      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() =>
            setUiNotice("Google Sign-up clicked (UI only — connect backend later).")
          }
          className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[6px] border border-[#D1D5DB] bg-white px-4 text-[14px] font-medium text-[#1D1F20] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          <span>Sign up with Google</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setUiNotice("Enterprise SSO Sign-up clicked (UI only — connect backend later).")
          }
          className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[6px] border border-[#D1D5DB] bg-white px-4 text-[14px] font-medium text-[#1D1F20] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] transition-colors cursor-pointer"
        >
          <KeyRound className="h-[16px] w-[16px] text-[#4B5563]" strokeWidth={1.9} />
          <span>Sign up with SSO</span>
        </button>
      </div>

      {/* OR Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#6B7280]">
          or
        </span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="register-email"
            className="block text-[13px] font-medium text-[#1D1F20]"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="mt-1.5 h-[42px] w-full rounded-[6px] border border-[#B6B6B6] bg-white px-3 text-[14px] text-[#1D1F20] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0051C3] focus:ring-2 focus:ring-[#0051C3]/15"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-[13px] font-medium text-[#1D1F20]"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="h-[42px] w-full rounded-[6px] border border-[#B6B6B6] bg-white pl-3 pr-10 text-[14px] text-[#1D1F20] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0051C3] focus:ring-2 focus:ring-[#0051C3]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1D1F20] cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-[17px] w-[17px]" strokeWidth={1.8} />
              ) : (
                <Eye className="h-[17px] w-[17px]" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Cloudflare-style Live Password Criteria Checklist */}
          <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {passwordChecks.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 text-[12px] transition-colors ${
                  rule.met ? "text-[#16A34A]" : "text-[#6B7280]"
                }`}
              >
                {rule.met ? (
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                ) : (
                  <Circle className="h-3 w-3 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
                )}
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="register-confirm"
            className="block text-[13px] font-medium text-[#1D1F20]"
          >
            Confirm Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="register-confirm"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="h-[42px] w-full rounded-[6px] border border-[#B6B6B6] bg-white pl-3 pr-10 text-[14px] text-[#1D1F20] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0051C3] focus:ring-2 focus:ring-[#0051C3]/15"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1D1F20] cursor-pointer"
            >
              {showConfirm ? (
                <EyeOff className="h-[17px] w-[17px]" strokeWidth={1.8} />
              ) : (
                <Eye className="h-[17px] w-[17px]" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Terms Notice */}
        <p className="pt-0.5 text-[12px] leading-relaxed text-[#595959]">
          By clicking Sign up, you agree to Project A&rsquo;s{" "}
          <a
            href="#terms"
            onClick={(e) => e.preventDefault()}
            className="text-[#0051C3] hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="text-[#0051C3] hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>

        {/* Primary CTA */}
        <button
          type="submit"
          className="flex h-[42px] w-full items-center justify-center rounded-[6px] bg-[#EE730A] text-[14px] font-semibold text-white hover:bg-[#D96504] active:bg-[#C2560A] transition-colors cursor-pointer"
        >
          Sign up
        </button>
      </form>

      {/* UI Preview Feedback Banner */}
      {uiNotice && (
        <div
          role="status"
          className="mt-4 rounded-[6px] border border-[#FED7AA] bg-[#FFF7ED] px-3.5 py-2.5 text-[12.5px] text-[#7C2D12]"
        >
          {uiNotice}
        </div>
      )}

      {/* Footer Auth Links */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#595959]">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0051C3] hover:underline"
          >
            Log in
          </Link>
        </p>
        <Link href="/" className="text-[12.5px] text-[#0051C3] hover:underline">
          Back to Workspace
        </Link>
      </div>
    </div>
  );
}
