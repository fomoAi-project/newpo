import { get, ref, set } from "firebase/database";
import { database } from "@/lib/firebase";

export type WorkspaceLead = {
  id: string;
  name: string;
  interest: string;
  budget: string;
  intent: "Hot" | "Warm" | "Cold";
};

export type WorkspaceConversation = {
  id: string;
  name: string;
  channel: string;
  note: string;
  status: "AI handling" | "Needs owner" | "Human required";
};

export type WorkspaceKnowledge = {
  id: string;
  label: string;
  content: string;
};

export type WorkspaceTrainingMessage = {
  id: string;
  sender: "owner" | "ai";
  body: string;
};

export type WorkspaceChannel = {
  id: string;
  type: "whatsapp" | "website" | "instagram";
  name: string;
  phoneNumber?: string;
  businessAccountId?: string;
  status: "connected" | "pending";
};

export type WorkspaceData = {
  conversations: WorkspaceConversation[];
  leads: WorkspaceLead[];
  knowledge: WorkspaceKnowledge[];
  trainingMessages: WorkspaceTrainingMessage[];
  channels: WorkspaceChannel[];
};

export const emptyWorkspace: WorkspaceData = {
  conversations: [],
  leads: [],
  knowledge: [],
  trainingMessages: [],
  channels: [],
};

export async function getWorkspaceData(userId: string): Promise<WorkspaceData> {
  const snapshot = await get(ref(database, `workspaces/${userId}`));
  return snapshot.exists() ? ({ ...emptyWorkspace, ...snapshot.val() } as WorkspaceData) : emptyWorkspace;
}

export async function saveWorkspaceData(userId: string, data: WorkspaceData) {
  await set(ref(database, `workspaces/${userId}`), data);
}

export async function addKnowledgeEntry(userId: string, content: string) {
  const current = await getWorkspaceData(userId);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label: "Business information",
    content,
  };
  await saveWorkspaceData(userId, { ...current, knowledge: [...current.knowledge, entry] });
  return entry;
}

export async function appendTrainingMessages(userId: string, messages: WorkspaceTrainingMessage[]) {
  const current = await getWorkspaceData(userId);
  const trainingMessages = [...current.trainingMessages, ...messages];
  await saveWorkspaceData(userId, { ...current, trainingMessages });
}
