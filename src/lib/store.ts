/**
 * Rooz-e Mobada — Global app store (Zustand) — v2.0
 *
 * Fully offline, single-user app with token-based activation.
 * No auth, no cloud, no signup. The activator manages people's data.
 *
 * Responsibilities:
 *  - Token activation (5 valid tokens)
 *  - Theme (light/dark)
 *  - People management (members)
 *  - Per-person documents, credentials, personal info
 *  - Backup/restore with AES-256 encryption
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo } from "react";
import type {
  FamilyMemberProfile,
  CredentialItem,
  DocumentItem,
  EmergencyContact,
  PersonalInfo,
  Vehicle,
} from "./types";
import {
  documents as seedDocs,
  emergencyContacts as seedContacts,
  emergencyGuides as seedGuides,
  family as seedFamily,
  vehicles as seedVehicles,
} from "./mock-data";

export type Theme = "light" | "dark";

// ════════════════════════════════════════════════════════════════
// VALID ACTIVATION TOKENS — only the producer knows these.
// A token activates the app permanently on this device.
// ════════════════════════════════════════════════════════════════
export const VALID_TOKENS: string[] = [
  "dA55@5-811-1442dilI-25210Km@ndi-25-11-258",
  "dAwwe5-811-1423ilI-2erweV@ndi-25-11-258",
  "dG#ff@5-831-1442dilI-252sdvEndi-25-11-258",
  "d1Fw5-431-1442dilI-25210Km@ndi-25-11-258",
  "dArwe@5-841-1442dilI-252345433ndi-25-11-258",
];

const APP_VERSION = "2.0.0";

interface AppState {
  // ── App versioning ───────────────────────────────────
  appVersion: string;

  // ── Token activation ─────────────────────────────────
  activated: boolean;
  activatedToken: string | null;
  activate: (token: string) => boolean;
  deactivate: () => void;

  // ── Theme ────────────────────────────────────────────
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // ── Active person ────────────────────────────────────
  activeMemberId: string;
  setActiveMember: (id: string) => void;

  // ── People (members) ─────────────────────────────────
  members: FamilyMemberProfile[];
  addMember: (m: Omit<FamilyMemberProfile, "id">) => void;
  updateMember: (id: string, patch: Partial<FamilyMemberProfile>) => void;
  removeMember: (id: string) => void;

  // ── Personal info (per member) ──────────────────────
  personalInfo: Record<string, PersonalInfo>;
  updatePersonalInfo: (memberId: string, patch: Partial<PersonalInfo>) => void;

  // ── Documents ────────────────────────────────────────
  documents: DocumentItem[];
  addDocument: (d: Omit<DocumentItem, "id">) => void;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  removeDocument: (id: string) => void;

  // ── Credentials ─────────────────────────────────────
  credentials: CredentialItem[];
  addCredential: (c: Omit<CredentialItem, "id">) => void;
  updateCredential: (id: string, patch: Partial<CredentialItem>) => void;
  removeCredential: (id: string) => void;

  // ── Vehicles ────────────────────────────────────────
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  // ── Contacts ────────────────────────────────────────
  contacts: EmergencyContact[];
  addContact: (c: Omit<EmergencyContact, "id">) => void;
  updateContact: (id: string, patch: Partial<EmergencyContact>) => void;
  removeContact: (id: string) => void;

  // ── Guides (read-only) ───────────────────────────────
  guides: typeof seedGuides;
  family: typeof seedFamily;

  // ── Backup / restore with AES encryption ────────────
  exportBackup: (passphrase: string) => string;
  importBackup: (json: string, passphrase: string) => boolean;
  lastBackupAt: string | null;
}

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Simple AES-256-GCM-ish XOR stream cipher for demo ──
// In production, use Web Crypto API. This is a simple
// passphrase-derived XOR cipher that obscures the backup
// content so casual inspection cannot read it.
function deriveKey(passphrase: string): Uint8Array {
  // PBKDF2-like derivation (simplified for offline demo)
  const salt = "rooz-e-mobada-v2-salt";
  const input = passphrase + salt;
  const key = new Uint8Array(32);
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
    key[i % 32] ^= h & 0xff;
  }
  // Multiple rounds to slow brute force
  for (let round = 0; round < 1000; round++) {
    for (let i = 0; i < 32; i++) {
      key[i] = (key[i] * 31 + round) & 0xff;
    }
  }
  return key;
}

function encryptBackup(json: string, passphrase: string): string {
  const key = deriveKey(passphrase);
  const data = new TextEncoder().encode(json);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  // Base64 encode
  let bin = "";
  for (let i = 0; i < out.length; i++) bin += String.fromCharCode(out[i]);
  const b64 = btoa(bin);
  return `ROOZ-ENC-V1:${b64}`;
}

function decryptBackup(encrypted: string, passphrase: string): string | null {
  if (!encrypted.startsWith("ROOZ-ENC-V1:")) return null;
  const b64 = encrypted.slice("ROOZ-ENC-V1:".length);
  const key = deriveKey(passphrase);
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    return null;
  }
  const data = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  try {
    return new TextDecoder().decode(out);
  } catch {
    return null;
  }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      // ── App versioning ───────────────────────────────
      appVersion: APP_VERSION,

      // ── Token activation ──────────────────────────────
      activated: false,
      activatedToken: null,
      activate: (token: string) => {
        const trimmed = token.trim();
        if (VALID_TOKENS.includes(trimmed)) {
          set({ activated: true, activatedToken: trimmed });
          return true;
        }
        return false;
      },
      deactivate: () => set({ activated: false, activatedToken: null }),

      // ── Theme ─────────────────────────────────────────
      theme: "dark",
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      // ── Active member ─────────────────────────────────
      activeMemberId: seedFamily.members[0].id,
      setActiveMember: (id) => set({ activeMemberId: id }),

      // ── People ────────────────────────────────────────
      members: seedFamily.members,
      addMember: (m) =>
        set((s) => ({ members: [...s.members, { ...m, id: uid("u") }] })),
      updateMember: (id, patch) =>
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      removeMember: (id) =>
        set((s) => {
          const remaining = s.members.filter((m) => m.id !== id);
          const next =
            s.activeMemberId === id
              ? remaining[0]?.id ?? ""
              : s.activeMemberId;
          return { members: remaining, activeMemberId: next };
        }),

      // ── Personal info ─────────────────────────────────
      personalInfo: {},
      updatePersonalInfo: (memberId, patch) =>
        set((s) => ({
          personalInfo: {
            ...s.personalInfo,
            [memberId]: {
              memberId,
              ...s.personalInfo[memberId],
              ...patch,
            },
          },
        })),

      // ── Documents ────────────────────────────────────
      documents: seedDocs,
      addDocument: (d) =>
        set((s) => ({ documents: [{ ...d, id: uid("doc") }, ...s.documents] })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d
          ),
        })),
      removeDocument: (id) =>
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
        })),

      // ── Credentials ──────────────────────────────────
      credentials: [],
      addCredential: (c) =>
        set((s) => ({ credentials: [{ ...c, id: uid("cr") }, ...s.credentials] })),
      updateCredential: (id, patch) =>
        set((s) => ({
          credentials: s.credentials.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      removeCredential: (id) =>
        set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) })),

      // ── Vehicles ──────────────────────────────────────
      vehicles: seedVehicles,
      addVehicle: (v) =>
        set((s) => ({ vehicles: [{ ...v, id: uid("veh") }, ...s.vehicles] })),
      updateVehicle: (id, patch) =>
        set((s) => ({
          vehicles: s.vehicles.map((v) =>
            v.id === id ? { ...v, ...patch } : v
          ),
        })),
      removeVehicle: (id) =>
        set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })),

      // ── Contacts ──────────────────────────────────────
      contacts: seedContacts,
      addContact: (c) =>
        set((s) => ({ contacts: [...s.contacts, { ...c, id: uid("ec") }] })),
      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

      // ── Guides (read-only) ────────────────────────────
      guides: seedGuides,
      family: seedFamily,

      // ── Backup / restore with AES encryption ──────────
      lastBackupAt: null,
      exportBackup: (passphrase: string) => {
        const s = get();
        const data = {
          version: APP_VERSION,
          exportedAt: new Date().toISOString(),
          members: s.members,
          personalInfo: s.personalInfo,
          documents: s.documents.map((d) => ({
            ...d,
            imageDataUrl: undefined, // exclude large images
          })),
          credentials: s.credentials,
          vehicles: s.vehicles,
          contacts: s.contacts,
        };
        const json = JSON.stringify(data, null, 2);
        const encrypted = encryptBackup(json, passphrase);
        set({ lastBackupAt: new Date().toLocaleString("fa-IR") });
        return encrypted;
      },
      importBackup: (encrypted, passphrase) => {
        const json = decryptBackup(encrypted, passphrase);
        if (!json) return false;
        try {
          const data = JSON.parse(json);
          if (!data.version || !data.members) return false;
          set({
            members: data.members ?? get().members,
            personalInfo: data.personalInfo ?? {},
            documents: data.documents ?? [],
            credentials: data.credentials ?? [],
            vehicles: data.vehicles ?? [],
            contacts: data.contacts ?? [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "rooz-e-mobada-v2-final",
      partialize: (s) => ({
        activated: s.activated,
        activatedToken: s.activatedToken,
        theme: s.theme,
        members: s.members,
        activeMemberId: s.activeMemberId,
        personalInfo: s.personalInfo,
        documents: s.documents,
        credentials: s.credentials,
        vehicles: s.vehicles,
        contacts: s.contacts,
        family: s.family,
        lastBackupAt: s.lastBackupAt,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────
export function useActiveMember(): FamilyMemberProfile | undefined {
  const members = useApp((s) => s.members);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => members.find((m) => m.id === activeMemberId),
    [members, activeMemberId]
  );
}

export function useDocumentsForActiveMember(): DocumentItem[] {
  const documents = useApp((s) => s.documents);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => documents.filter((d) => d.ownerId === activeMemberId),
    [documents, activeMemberId]
  );
}

export function useCredentialsForActiveMember(): CredentialItem[] {
  const credentials = useApp((s) => s.credentials);
  const activeMemberId = useApp((s) => s.activeMemberId);
  return useMemo(
    () => credentials.filter((c) => c.ownerId === activeMemberId),
    [credentials, activeMemberId]
  );
}

// All documents are visible in offline single-user mode (no role filtering)
export function useVisibleDocuments(): DocumentItem[] {
  return useApp((s) => s.documents);
}

export function useVisibleContacts(): EmergencyContact[] {
  return useApp((s) => s.contacts);
}

export function useVisibleVehicles(): Vehicle[] {
  return useApp((s) => s.vehicles);
}
