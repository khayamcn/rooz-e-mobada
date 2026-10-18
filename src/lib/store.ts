"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BankCard,
  Bill,
  ColorTheme,
  Credential,
  DocumentItem,
  EmergencyContact,
  Person,
  Theme,
} from "./types";
import { validateToken } from "./token-validator";

const APP_VERSION = "4.0.0";

const SEED_CONTACTS: EmergencyContact[] = [
  {
    id: "seed-115",
    name: "اورژانس",
    relationOrRole: "مرکز اورژانس ملی",
    phonePrimary: "115",
    iconLabel: "ambulance",
    priorityOrder: 1,
    isSystemEmergency: true,
  },
  {
    id: "seed-110",
    name: "پلیس",
    relationOrRole: "مرکز پلیس",
    phonePrimary: "110",
    iconLabel: "police",
    priorityOrder: 2,
    isSystemEmergency: true,
  },
  {
    id: "seed-125",
    name: "آتش‌نشانی",
    relationOrRole: "مرکز آتش‌نشانی",
    phonePrimary: "125",
    iconLabel: "fire",
    priorityOrder: 3,
    isSystemEmergency: true,
  },
  {
    id: "seed-191",
    name: "گاز",
    relationOrRole: "مرکز فوریت‌های گاز",
    phonePrimary: "191",
    iconLabel: "gas",
    priorityOrder: 4,
    isSystemEmergency: true,
  },
];

function xorCipher(text: string, passphrase: string): string {
  if (!passphrase) return text;
  const key = passphrase;
  let out = "";
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}

function toBase64(input: string): string {
  if (typeof btoa === "function") return btoa(input);
  // Fallback for environments without btoa
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    out += String.fromCharCode(c);
  }
  return out;
}

function fromBase64(input: string): string {
  if (typeof atob === "function") return atob(input);
  return input;
}

interface AppState {
  appVersion: string;
  activated: boolean;
  hasSeenOnboarding: boolean;
  theme: Theme;
  colorTheme: ColorTheme;
  people: Person[];
  activePersonId: string | null;
  bankCards: BankCard[];
  bills: Bill[];
  documents: DocumentItem[];
  credentials: Credential[];
  contacts: EmergencyContact[];
  lastBackupAt: string | null;

  activate: (token: string) => boolean;
  deactivate: () => void;
  completeOnboarding: () => void;

  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setColorTheme: (c: ColorTheme) => void;

  addPerson: (p: Omit<Person, "id" | "createdAt">) => string;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  setActivePerson: (id: string | null) => void;

  addBankCard: (c: Omit<BankCard, "id" | "createdAt">) => void;
  updateBankCard: (id: string, patch: Partial<BankCard>) => void;
  deleteBankCard: (id: string) => void;

  addBill: (b: Omit<Bill, "id" | "createdAt">) => void;
  updateBill: (id: string, patch: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  addDocument: (d: Omit<DocumentItem, "id" | "createdAt">) => void;
  updateDocument: (id: string, patch: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;

  addCredential: (c: Omit<Credential, "id" | "updatedAt">) => void;
  updateCredential: (id: string, patch: Partial<Credential>) => void;
  deleteCredential: (id: string) => void;

  exportBackup: (passphrase: string) => string;
  importBackup: (encrypted: string, passphrase: string) => boolean;
}

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      appVersion: APP_VERSION,
      activated: false,
      hasSeenOnboarding: false,
      theme: "light",
      colorTheme: "violet",
      people: [],
      activePersonId: null,
      bankCards: [],
      bills: [],
      documents: [],
      credentials: [],
      contacts: SEED_CONTACTS,
      lastBackupAt: null,

      activate: (token: string) => {
        if (!validateToken(token)) return false;
        set({ activated: true });
        return true;
      },
      deactivate: () =>
        set({
          activated: false,
          hasSeenOnboarding: true,
          people: [],
          bankCards: [],
          bills: [],
          documents: [],
          credentials: [],
          activePersonId: null,
          contacts: SEED_CONTACTS,
          lastBackupAt: null,
        }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),

      setTheme: (t) => set({ theme: t }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setColorTheme: (c) => set({ colorTheme: c }),

      addPerson: (p) => {
        const id = uid();
        const person: Person = { ...p, id, createdAt: new Date().toISOString() };
        set((s) => ({ people: [...s.people, person] }));
        return id;
      },
      updatePerson: (id, patch) =>
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deletePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          bankCards: s.bankCards.filter((c) => c.personId !== id),
          bills: s.bills.filter((b) => b.personId !== id),
          documents: s.documents.filter((d) => d.personId !== id),
          credentials: s.credentials.filter((c) => c.personId !== id),
          activePersonId: s.activePersonId === id ? null : s.activePersonId,
        })),
      setActivePerson: (id) => set({ activePersonId: id }),

      addBankCard: (c) =>
        set((s) => ({
          bankCards: [
            ...s.bankCards,
            { ...c, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateBankCard: (id, patch) =>
        set((s) => ({
          bankCards: s.bankCards.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      deleteBankCard: (id) =>
        set((s) => ({ bankCards: s.bankCards.filter((c) => c.id !== id) })),

      addBill: (b) =>
        set((s) => ({
          bills: [
            ...s.bills,
            { ...b, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateBill: (id, patch) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      addDocument: (d) =>
        set((s) => ({
          documents: [
            ...s.documents,
            { ...d, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...patch } : d,
          ),
        })),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      addCredential: (c) =>
        set((s) => ({
          credentials: [
            ...s.credentials,
            { ...c, id: uid(), updatedAt: new Date().toISOString() },
          ],
        })),
      updateCredential: (id, patch) =>
        set((s) => ({
          credentials: s.credentials.map((c) =>
            c.id === id
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c,
          ),
        })),
      deleteCredential: (id) =>
        set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) })),

      exportBackup: (passphrase: string) => {
        const state = get();
        const payload = JSON.stringify({
          appVersion: APP_VERSION,
          exportedAt: new Date().toISOString(),
          people: state.people,
          bankCards: state.bankCards,
          bills: state.bills,
          documents: state.documents,
          credentials: state.credentials,
          contacts: state.contacts,
        });
        const ciphered = xorCipher(payload, passphrase);
        const b64 = toBase64(ciphered);
        set({ lastBackupAt: new Date().toISOString() });
        return "ROOZ-V4:" + b64;
      },

      importBackup: (encrypted: string, passphrase: string) => {
        try {
          if (!encrypted.startsWith("ROOZ-V4:")) return false;
          const b64 = encrypted.slice("ROOZ-V4:".length);
          const ciphered = fromBase64(b64.trim());
          const json = xorCipher(ciphered, passphrase);
          const data = JSON.parse(json);
          if (!data || typeof data !== "object") return false;
          set({
            people: data.people || [],
            bankCards: data.bankCards || [],
            bills: data.bills || [],
            documents: data.documents || [],
            credentials: data.credentials || [],
            contacts:
              data.contacts && data.contacts.length > 0
                ? data.contacts
                : SEED_CONTACTS,
            lastBackupAt: new Date().toISOString(),
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "rooz-mobada-v4",
      partialize: (s) => ({
        activated: s.activated,
        hasSeenOnboarding: s.hasSeenOnboarding,
        theme: s.theme,
        colorTheme: s.colorTheme,
        people: s.people,
        bankCards: s.bankCards,
        bills: s.bills,
        documents: s.documents,
        credentials: s.credentials,
        lastBackupAt: s.lastBackupAt,
      }),
    },
  ),
);

// Selector hook: get the active person (or null) and stay reactive
export function useActivePerson(): Person | null {
  return useApp((s) => {
    if (!s.activePersonId) return null;
    return s.people.find((p) => p.id === s.activePersonId) ?? null;
  });
}
