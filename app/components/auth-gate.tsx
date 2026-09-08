"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseUser } from "@/lib/firebase-auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useFirebaseUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return <main className="min-h-screen bg-white" aria-busy="true" />;
  }

  return children;
}
