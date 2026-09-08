"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/lib/firebase-auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const businessName = String(formData.get("business") ?? "").trim();
    const ownerName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!businessName || !ownerName || !email || password.length < 8) {
      setError("Enter all required details. Passwords must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAccount({
        email,
        password,
        business: {
          businessName,
          industry: String(formData.get("industry") ?? "").trim(),
          ownerName,
          email,
          phone: String(formData.get("phone") ?? "").trim(),
        },
      });
      router.push("/onboarding");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Account creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-emerald-950/30">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-2xl font-bold text-emerald-300">
            AI
          </div>
          <h1 className="text-3xl font-bold text-white">Create your business</h1>
          <p className="mt-2 text-sm text-slate-400">Set up your AI employee and start serving customers 24/7.</p>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label htmlFor="business" className="mb-2 block text-sm text-slate-300">
              Business name
            </label>
            <input
              id="business"
              name="business"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-slate-300">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="industry" className="mb-2 block text-sm text-slate-300">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            >
              <option>Automotive</option>
              <option>Real Estate</option>
              <option>Hotel</option>
              <option>Travel</option>
              <option>Education</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm text-slate-300">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-300">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
