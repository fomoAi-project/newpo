"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const navigation = [
  { label: "Overview", href: "/dashboard" },
  { label: "Inbox", href: "/dashboard/inbox" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Customers", href: "/dashboard/customers" },
  { label: "AI Training", href: "/onboarding" },
  { label: "Knowledge", href: "/dashboard/knowledge" },
  { label: "Products / Services", href: "/dashboard/products" },
  { label: "Appointments", href: "/dashboard/appointments" },
  { label: "Automations", href: "/dashboard/automations" },
  { label: "Channels", href: "/dashboard/channels" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Settings", href: "/dashboard/settings" },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-950 lg:flex-row">
      <aside className="border-b border-zinc-200 bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3 lg:mb-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white">AI</div>
            <div>
              <div className="font-semibold tracking-tight">AIBiz Employee</div>
              <div className="text-xs text-zinc-500">Business workspace</div>
            </div>
          </Link>
          <button type="button" onClick={handleSignOut} className="text-xs font-medium text-zinc-500 hover:text-zinc-950 lg:hidden">Sign out</button>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:mt-0 lg:block lg:space-y-1 lg:overflow-visible">
          {navigation.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            return <Link key={item.label} href={item.href} className={`block shrink-0 rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-zinc-950 font-medium text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"}`}>{item.label}</Link>;
          })}
        </nav>
        <button type="button" onClick={handleSignOut} className="mt-8 hidden text-sm font-medium text-zinc-500 hover:text-zinc-950 lg:block">Sign out</button>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
