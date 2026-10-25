import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const signInErrors = {
  not_configured: 'Google Sign-In has not been configured on this server yet.',
  cancelled: 'Google sign-in was cancelled. You can try again whenever you are ready.',
  invalid_state: 'This sign-in link expired or could not be verified. Please try again.',
  failed: 'Google could not sign you in. Please try again.',
};

export function GoogleSignInPage() {
  const [legalSection, setLegalSection] = useState(null);
  const error = new URLSearchParams(window.location.search).get('error');
  const errorMessage = signInErrors[error];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-10 text-[#111827] dark:bg-[#0B1020] dark:text-[#F3F4F6]">
      <section className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-xl dark:border-[#293247] dark:bg-[#111827] sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#818CF8] via-[#A78BFA] to-[#C084FC] shadow-sm">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            ChatBot <span className="gemini-gradient-text">AI</span>
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to ChatBot AI</h1>
          <p className="mt-2 text-sm text-[#64748B] dark:text-[#9CA3AF]">
            Sign in to continue your conversations.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300">
            {errorMessage}
          </p>
        )}

        <a
          href="/api/auth/google/start?returnTo=%2F"
          className="mt-8 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm font-semibold text-[#202124] shadow-sm transition hover:bg-[#F8FAFC] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2 dark:border-[#475569] dark:bg-[#151C2C] dark:text-[#F3F4F6] dark:hover:bg-[#1E293B] dark:focus:ring-offset-[#111827]"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.77 7.18l7.73 6C44.41 38.07 46.98 31.93 46.98 24.55Z" />
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.75-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19Z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          </svg>
          Continue with Google
        </a>

        <p className="mt-6 text-center text-xs leading-5 text-[#64748B] dark:text-[#9CA3AF]">
          By continuing, you agree to our{' '}
          <a href="#terms" onClick={() => setLegalSection(legalSection === 'terms' ? null : 'terms')} className="font-medium text-[#4F46E5] underline-offset-2 hover:underline dark:text-[#A5B4FC]">
            Terms
          </a>{' '}
          and{' '}
          <a href="#privacy" onClick={() => setLegalSection(legalSection === 'privacy' ? null : 'privacy')} className="font-medium text-[#4F46E5] underline-offset-2 hover:underline dark:text-[#A5B4FC]">
            Privacy Policy
          </a>.
        </p>

        {legalSection && (
          <section aria-live="polite" className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-xs leading-5 text-[#475569] dark:bg-[#0B1020] dark:text-[#CBD5E1]">
            <h2 className="mb-1 font-semibold text-[#111827] dark:text-[#F3F4F6]">
              {legalSection === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
            </h2>
            {legalSection === 'terms'
              ? 'Use ChatBot AI lawfully and do not rely on generated responses as professional advice. This demonstration service is provided as-is.'
              : 'Google Sign-In shares your verified account ID, email, name, and profile photo with this app. The app stores account details and feedback in its configured backend database. Do not submit sensitive information in chat or feedback.'}
          </section>
        )}

        <div className="mt-8 border-t border-[#E2E8F0] pt-5 text-center dark:border-[#293247]">
          <a href="/" className="text-sm font-medium text-[#6366F1] hover:underline dark:text-[#A5B4FC]">
            Continue as a guest
          </a>
        </div>
      </section>
    </main>
  );
}
