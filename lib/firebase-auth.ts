"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { get, ref, set } from "firebase/database";
import { getFirebaseAuth, getFirebaseDatabase } from "@/lib/firebase";
import type { BusinessSession } from "@/lib/browser-session";

export async function createAccount({
  email,
  password,
  business,
}: {
  email: string;
  password: string;
  business: BusinessSession;
}) {
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(credential.user, { displayName: business.ownerName });
  await set(ref(getFirebaseDatabase(), `businesses/${credential.user.uid}`), business);
  return credential.user;
}

export async function signInAccount(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function getBusinessProfile(user: User): Promise<BusinessSession | null> {
  const snapshot = await get(ref(getFirebaseDatabase(), `businesses/${user.uid}`));
  return snapshot.exists() ? (snapshot.val() as BusinessSession) : null;
}

export async function saveBusinessProfile(userId: string, business: BusinessSession) {
  await set(ref(getFirebaseDatabase(), `businesses/${userId}`), business);
}

export function useFirebaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
    setUser(nextUser);
    setIsLoading(false);
  }), []);

  return { user, isLoading };
}
