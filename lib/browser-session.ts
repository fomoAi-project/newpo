export type BusinessSession = {
  businessName: string;
  industry: string;
  ownerName: string;
  email: string;
  phone: string;
};

const sessionKey = "aibiz-business-session";

export function saveBusinessSession(session: BusinessSession) {
  window.localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function getBusinessSession(): BusinessSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(sessionKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as BusinessSession;
  } catch {
    window.localStorage.removeItem(sessionKey);
    return null;
  }
}
